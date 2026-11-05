import Decimal from 'decimal.js'
import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import type { Nft, Order, OrderItem, User, WalletDetails } from '@/types/api'
import { createId, createSalt, hashPassword, sha256 } from './crypto'
import type { MockDb, MockUser } from './data'
import { loadDb, resetDb, saveDb, updateDb } from './db'

const API = '/api'
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const registerPayloadSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email(),
  password: z.string().min(8),
})

const loginPayloadSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
})

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        nftId: z.string().min(1),
        editionId: z.string().min(1),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1),
  network: z.enum(['Ethereum', 'Polygon', 'Solana']),
  wallet: z.object({
    provider: z.string().trim().min(1),
    kind: z.string().trim().min(1),
    address: z.string().trim().min(3),
  }),
  buyer: z.object({
    fullName: z.string().trim().min(3),
    email: z.string().trim().email(),
    document: z.string().trim().min(1),
    country: z.string().trim().min(1),
    referralCode: z.string().nullable().optional(),
  }),
  promoCode: z.string().nullable().optional(),
})

function eth(value: Decimal) {
  return value.toFixed(5).replace(/\.?0+$/, '') || '0'
}

function orderNumberFor(db: MockDb) {
  return `KUR-${String(db.orders.length + 1).padStart(4, '0')}`
}

function buildOrderItem(nft: Nft, editionId: string, quantity: number) {
  const edition = nft.editions.find((item) => item.id === editionId)

  if (!edition) {
    return { error: 'EDIÇÃO_INVÁLIDA' as const }
  }

  if (edition.available < quantity) {
    return { error: 'ESTOQUE_INSUFICIENTE' as const, edition }
  }

  const unitPrice = new Decimal(nft.priceEth)
  const item: OrderItem = {
    nftId: nft.id,
    title: nft.title,
    imageUrl: nft.imageUrl,
    editionId: edition.id,
    editionName: edition.name,
    quantity,
    unitPriceEth: eth(unitPrice),
    lineTotalEth: eth(unitPrice.times(quantity)),
  }

  return { item, edition }
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  return HttpResponse.json({ code, message, details }, { status })
}

function publicUser(user: MockUser): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    ensName: user.ensName,
    walletAlias: user.walletAlias,
    createdAt: user.createdAt,
  }
}

function getBearerToken(request: Request) {
  const header = request.headers.get('authorization')

  if (!header?.startsWith('Bearer ')) {
    return null
  }

  return header.slice('Bearer '.length)
}

async function resolveSession(request: Request) {
  const token = getBearerToken(request)

  if (!token) {
    return null
  }

  const tokenHash = await sha256(token)
  const db = loadDb()
  const session = db.sessions.find((item) => item.tokenHash === tokenHash)

  if (!session) {
    return null
  }

  if (Date.now() - new Date(session.createdAt).getTime() > SESSION_MAX_AGE) {
    const nextDb = loadDb()
    nextDb.sessions = nextDb.sessions.filter((item) => item.id !== session.id)
    saveDb(nextDb)
    return null
  }

  const user = db.users.find((item) => item.id === session.userId)

  if (!user) {
    return null
  }

  return { db, user, session }
}

async function createSession(userId: string) {
  const token = createId('tok')
  const tokenHash = await sha256(token)

  updateDb((db) => {
    db.sessions.push({
      id: createId('ses'),
      tokenHash,
      userId,
      createdAt: new Date().toISOString(),
    })
  })

  return token
}

function unauthorized() {
  return errorResponse(
    401,
    'SESSION_EXPIRED',
    'Sua sessão expirou. Entre novamente.',
  )
}

function readAuthPayload(request: Request) {
  return request.json().catch(() => null)
}

export const handlers = [
  http.post(`${API}/auth/register`, async ({ request }) => {
    const payload = registerPayloadSchema.safeParse(
      await readAuthPayload(request),
    )

    if (!payload.success) {
      return errorResponse(
        422,
        'VALIDATION_ERROR',
        'Revise os dados informados.',
        payload.error.flatten(),
      )
    }

    const db = loadDb()
    const email = payload.data.email.toLowerCase()
    const username = payload.data.username.toLowerCase()

    if (db.users.some((user) => user.email.toLowerCase() === email)) {
      return errorResponse(
        409,
        'EMAIL_TAKEN',
        'Este e-mail já está cadastrado.',
      )
    }

    if (db.users.some((user) => user.username.toLowerCase() === username)) {
      return errorResponse(
        409,
        'USERNAME_TAKEN',
        'Este nome de usuário já está em uso.',
      )
    }

    const passwordSalt = createSalt()
    const passwordHash = await hashPassword(
      payload.data.password,
      passwordSalt,
    )

    const user: MockUser = {
      id: createId('usr'),
      username: payload.data.username,
      email: payload.data.email,
      displayName: payload.data.username,
      avatarUrl: null,
      bio: null,
      ensName: null,
      walletAlias: null,
      createdAt: new Date().toISOString(),
      passwordSalt,
      passwordHash,
    }

    updateDb((nextDb) => {
      nextDb.users.push(user)
    })

    const token = await createSession(user.id)

    return HttpResponse.json({ token, user: publicUser(user) }, { status: 201 })
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    const payload = loginPayloadSchema.safeParse(
      await readAuthPayload(request),
    )

    if (!payload.success) {
      return errorResponse(
        422,
        'VALIDATION_ERROR',
        'Informe e-mail e senha.',
      )
    }

    const db = loadDb()
    const identifier = payload.data.email.toLowerCase()
    const user = db.users.find(
      (item) =>
        item.email.toLowerCase() === identifier ||
        item.username.toLowerCase() === identifier,
    )

    if (!user) {
      return errorResponse(
        401,
        'INVALID_CREDENTIALS',
        'E-mail ou senha inválidos.',
      )
    }

    const passwordHash = await hashPassword(
      payload.data.password,
      user.passwordSalt,
    )

    if (passwordHash !== user.passwordHash) {
      return errorResponse(
        401,
        'INVALID_CREDENTIALS',
        'E-mail ou senha inválidos.',
      )
    }

    const token = await createSession(user.id)

    return HttpResponse.json({ token, user: publicUser(user) })
  }),

  http.get(`${API}/auth/session`, async ({ request }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    return HttpResponse.json({ user: publicUser(session.user) })
  }),

  http.post(`${API}/auth/logout`, async ({ request }) => {
    const token = getBearerToken(request)

    if (token) {
      const tokenHash = await sha256(token)
      updateDb((db) => {
        db.sessions = db.sessions.filter(
          (session) => session.tokenHash !== tokenHash,
        )
      })
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.patch(`${API}/auth/profile`, async ({ request }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    const body = (await readAuthPayload(request)) as Partial<User> | null
    if (!body) {
      return errorResponse(400, 'INVALID_BODY', 'Dados inválidos.')
    }

    let updatedUser: User | null = null

    updateDb((db) => {
      const u = db.users.find((item) => item.id === session.user.id)
      if (u) {
        if (body.displayName !== undefined) u.displayName = body.displayName
        if (body.username !== undefined) u.username = body.username
        if (body.email !== undefined) u.email = body.email
        if (body.ensName !== undefined) u.ensName = body.ensName || null
        if (body.bio !== undefined) u.bio = body.bio || null
        updatedUser = publicUser(u)
      }
    })

    return HttpResponse.json(updatedUser)
  }),

  http.post(`${API}/auth/change-password`, async ({ request }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    const body = (await readAuthPayload(request)) as { currentPassword?: string; newPassword?: string } | null
    if (!body?.currentPassword || !body?.newPassword || body.newPassword.length < 8) {
      return errorResponse(422, 'VALIDATION_ERROR', 'A nova senha deve ter no mínimo 8 caracteres.')
    }

    const currentHash = await hashPassword(body.currentPassword, session.user.passwordSalt)
    if (currentHash !== session.user.passwordHash) {
      return errorResponse(401, 'INVALID_CREDENTIALS', 'Senha atual incorreta.')
    }

    const newSalt = createSalt()
    const newHash = await hashPassword(body.newPassword, newSalt)

    updateDb((db) => {
      const u = db.users.find((item) => item.id === session.user.id)
      if (u) {
        u.passwordSalt = newSalt
        u.passwordHash = newHash
      }
    })

    return HttpResponse.json({ success: true, message: 'Senha alterada com sucesso.' })
  }),

  http.get(`${API}/auth/wallets`, async ({ request }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    const db = loadDb()
    const userWallets = (db as any).userWallets?.[session.user.id] ?? [
      {
        provider: 'MetaMask',
        kind: 'Ethereum',
        address: '0x71C...3924',
      },
      {
        provider: 'Coinbase Wallet',
        kind: 'Polygon',
        address: '0x32A...918B',
      },
    ]

    return HttpResponse.json(userWallets)
  }),

  http.post(`${API}/auth/wallets`, async ({ request }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    const body = (await readAuthPayload(request)) as Partial<WalletDetails> | null
    if (!body?.address) {
      return errorResponse(422, 'VALIDATION_ERROR', 'Endereço da carteira é obrigatório.')
    }

    const newWallet: WalletDetails = {
      address: body.address,
      provider: body.provider || 'MetaMask',
      kind: body.kind || 'Ethereum',
    }

    updateDb((db) => {
      if (!(db as any).userWallets) {
        ;(db as any).userWallets = {}
      }
      const list = (db as any).userWallets[session.user.id] ?? [
        {
          provider: 'MetaMask',
          kind: 'Ethereum',
          address: '0x71C...3924',
        },
      ]
      list.push(newWallet)
      ;(db as any).userWallets[session.user.id] = list
    })

    return HttpResponse.json(newWallet, { status: 201 })
  }),

  http.delete(`${API}/auth/wallets/:address`, async ({ request, params }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    const address = decodeURIComponent(String(params.address))

    updateDb((db) => {
      if (!(db as any).userWallets) {
        ;(db as any).userWallets = {}
      }
      const list: WalletDetails[] = (db as any).userWallets[session.user.id] ?? [
        {
          provider: 'MetaMask',
          kind: 'Ethereum',
          address: '0x71C...3924',
        },
      ]
      ;(db as any).userWallets[session.user.id] = list.filter((w) => w.address !== address)
    })

    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API}/nfts/facets`, () => {
    const db = loadDb()
    const collections = new Map<string, number>()
    const networks = new Map<string, number>()
    let priceMin = Number.POSITIVE_INFINITY
    let priceMax = 0

    for (const nft of db.nfts) {
      collections.set(nft.collection, (collections.get(nft.collection) ?? 0) + 1)
      networks.set(nft.network, (networks.get(nft.network) ?? 0) + 1)
      priceMin = Math.min(priceMin, Number(nft.priceEth))
      priceMax = Math.max(priceMax, Number(nft.priceEth))
    }

    return HttpResponse.json({
      collections: [...collections]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
      networks: [...networks]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      priceMinEth: String(Number.isFinite(priceMin) ? priceMin : 0),
      priceMaxEth: String(priceMax),
    })
  }),

  http.get(`${API}/nfts`, ({ request }) => {
    const url = new URL(request.url)
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
    const pageSize = Math.min(
      24,
      Math.max(1, Number(url.searchParams.get('pageSize') ?? 9)),
    )
    const collection = url.searchParams.get('collection')
    const network = url.searchParams.get('network')
    const query = url.searchParams.get('q')?.trim().toLowerCase()
    const minPrice = Number(url.searchParams.get('minPrice') ?? 0)
    const maxPrice = Number(
      url.searchParams.get('maxPrice') ?? Number.POSITIVE_INFINITY,
    )
    const sort = url.searchParams.get('sort')
    const tab = url.searchParams.get('tab')

    const db = loadDb()
    const filtered = db.nfts.filter((nft) => {
      if (collection && nft.collection !== collection) {
        return false
      }

      if (network && nft.network !== network) {
        return false
      }

      const price = Number(nft.priceEth)

      if (price < minPrice || price > maxPrice) {
        return false
      }

      if (
        query &&
        !`${nft.title} ${nft.collection} ${nft.creator.name} ${nft.attributes.join(' ')}`
          .toLowerCase()
          .includes(query)
      ) {
        return false
      }

      return true
    })

    if (sort === 'price-asc') {
      filtered.sort((a, b) => Number(a.priceEth) - Number(b.priceEth))
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => Number(b.priceEth) - Number(a.priceEth))
    } else if (sort === 'rating' || tab === 'trending') {
      filtered.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    } else if (tab === 'new') {
      filtered.sort((a, b) => Number(b.tokenId) - Number(a.tokenId))
    }

    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return HttpResponse.json({
      items,
      page,
      pageSize,
      total: filtered.length,
      hasMore: start + pageSize < filtered.length,
    })
  }),

  http.get(`${API}/nfts/:id`, ({ params }) => {
    const db = loadDb()
    const nft = db.nfts.find(
      (item) => item.id === params.id || item.tokenId === params.id,
    )

    if (!nft) {
      return errorResponse(404, 'NFT_NOT_FOUND', 'NFT não encontrado.')
    }

    return HttpResponse.json(nft)
  }),

  http.post(`${API}/orders`, async ({ request }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    const payload = createOrderSchema.safeParse(
      await request.json().catch(() => null),
    )

    if (!payload.success) {
      return errorResponse(
        422,
        'VALIDATION_ERROR',
        'Revise os dados do pedido.',
        payload.error.flatten(),
      )
    }

    const db = loadDb()
    const items: OrderItem[] = []
    const stock: Array<{ nftId: string; editionId: string; quantity: number }> =
      []

    for (const line of payload.data.items) {
      const nft = db.nfts.find((item) => item.id === line.nftId)

      if (!nft) {
        return errorResponse(
          422,
          'NFT_INDISPONIVEL',
          'Um dos NFTs não está mais disponível.',
        )
      }

      const built = buildOrderItem(nft, line.editionId, line.quantity)

      if ('error' in built) {
        const code = built.error ?? 'EDICAO_INVALIDA'

        return errorResponse(
          409,
          code,
          code === 'ESTOQUE_INSUFICIENTE'
            ? 'A edição selecionada não possui estoque suficiente.'
            : 'A edição selecionada não existe.',
        )
      }

      items.push(built.item)
      stock.push({
        nftId: line.nftId,
        editionId: line.editionId,
        quantity: line.quantity,
      })
    }

    const subtotal = items.reduce(
      (sum, item) => sum.plus(item.lineTotalEth),
      new Decimal(0),
    )
    const promoCode = payload.data.promoCode?.trim().toUpperCase() || null
    const discount =
      promoCode === 'KURIO10' ? subtotal.times('0.1') : new Decimal(0)
    const discounted = subtotal.minus(discount)
    const networkFee = discounted.times('0.025')
    const total = discounted.plus(networkFee)
    const id = createId('ord')
    const transactionHash = `0x${(await sha256(id + session.user.id)).slice(0, 64)}`
    const order: Order = {
      id,
      orderNumber: orderNumberFor(db),
      userId: session.user.id,
      status: 'confirmed',
      items,
      subtotalEth: eth(subtotal),
      discountEth: eth(discount),
      networkFeeEth: eth(networkFee),
      totalEth: eth(total),
      promoCode,
      network: payload.data.network,
      wallet: payload.data.wallet,
      buyer: {
        ...payload.data.buyer,
        referralCode: payload.data.buyer.referralCode?.trim() || null,
      },
      transactionHash,
      createdAt: new Date().toISOString(),
    }

    updateDb((nextDb) => {
      for (const line of stock) {
        const nft = nextDb.nfts.find((item) => item.id === line.nftId)
        const edition = nft?.editions.find(
          (item) => item.id === line.editionId,
        )

        if (edition) {
          edition.available = Math.max(0, edition.available - line.quantity)
        }
      }

      nextDb.orders.push(order)
    })

    return HttpResponse.json(order, { status: 201 })
  }),

  http.get(`${API}/orders/:id`, async ({ request, params }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    const order = loadDb().orders.find(
      (item) =>
        item.id === params.id && item.userId === session.user.id,
    )

    if (!order) {
      return errorResponse(404, 'ORDER_NOT_FOUND', 'Pedido não encontrado.')
    }

    return HttpResponse.json(order)
  }),

  http.get(`${API}/favorites`, async ({ request }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    return HttpResponse.json({
      ids: session.db.favorites[session.user.id] ?? [],
    })
  }),

  http.post(`${API}/favorites/:nftId`, async ({ request, params }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    const nftId = String(params.nftId)
    const db = loadDb()
    const nftExists = db.nfts.some((nft) => nft.id === nftId)

    if (!nftExists) {
      return errorResponse(404, 'NFT_NOT_FOUND', 'NFT não encontrado.')
    }

    const ids = new Set(db.favorites[session.user.id] ?? [])
    ids.add(nftId)
    db.favorites[session.user.id] = [...ids]
    saveDb(db)

    return HttpResponse.json({ ids: db.favorites[session.user.id] })
  }),

  http.delete(`${API}/favorites/:nftId`, async ({ request, params }) => {
    const session = await resolveSession(request)

    if (!session) {
      return unauthorized()
    }

    const nftId = String(params.nftId)
    const db = loadDb()
    db.favorites[session.user.id] = (
      db.favorites[session.user.id] ?? []
    ).filter((id) => id !== nftId)
    saveDb(db)

    return HttpResponse.json({ ids: db.favorites[session.user.id] })
  }),

  http.post(`${API}/__mocks/reset`, () => {
    resetDb()
    return HttpResponse.json({ ok: true })
  }),

  http.post(`${API}/__mocks/scenario`, async ({ request }) => {
    const body = (await readAuthPayload(request)) as {
      scenario?: string
    } | null
    const scenario = body?.scenario ?? 'standard'
    const db = updateDb((nextDb: MockDb) => {
      nextDb.scenario = scenario
    })

    return HttpResponse.json({ scenario: db.scenario })
  }),

  http.get(`${API}/__mocks/state`, () => {
    const db = loadDb()

    return HttpResponse.json({
      scenario: db.scenario,
      users: db.users.length,
      sessions: db.sessions.length,
      nfts: db.nfts.length,
    })
  }),
]
