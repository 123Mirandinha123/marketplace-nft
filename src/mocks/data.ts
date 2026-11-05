import nft1 from '@/assets/NFT-1.webp'
import nft2 from '@/assets/NFT-2.webp'
import nft3 from '@/assets/NFT-3.webp'
import nft4 from '@/assets/NFT-4.webp'
import type { Nft, NftEdition, NftRarity, Order } from '@/types/api'
import catalog from './catalog.json'

export interface MockUser {
  id: string
  username: string
  email: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  ensName: string | null
  walletAlias: string | null
  createdAt: string
  passwordSalt: string
  passwordHash: string
}

export interface MockSession {
  id: string
  tokenHash: string
  userId: string
  createdAt: string
}

export interface MockDb {
  version: 2
  scenario: string
  users: MockUser[]
  sessions: MockSession[]
  nfts: Nft[]
  favorites: Record<string, string[]>
  orders: Order[]
}

interface CatalogNft {
  id: string
  name: string
  description: string
  collection: string
  network: Nft['network']
  priceEth: string
  imageUrl: string
  creator: Nft['creator']
  editions: NftEdition[]
  attributes: string[]
  contractAddress: string
}

export const DEMO_EMAIL = 'demo@kurio.art'
export const TEST_EMAIL = 'nova@kurio.test'
export const DEMO_PASSWORD = 'kurio123'

const imageBySource: Record<string, string> = {
  '/images/Frame-136.webp': nft1,
  '/images/NFT-Artwork-05.webp': nft2,
  '/images/NFT-Artwork-09.webp': nft3,
  '/images/NFT-Artwork-18.webp': nft4,
}

const gradients: Array<[string, string]> = [
  ['#1f4d3d', '#8ccf9f'],
  ['#4b1d4f', '#e89b55'],
  ['#26163f', '#9a6ad6'],
  ['#4c4433', '#f5f1eb'],
  ['#5f3b12', '#e8c26a'],
  ['#2a1552', '#f0805f'],
  ['#3d4b2f', '#c8b58a'],
  ['#2b2119', '#b39463'],
]

const rarityOrder: NftRarity[] = ['Comum', 'Raro', 'Épico', 'Lendário']

function rarityFor(item: CatalogNft, index: number): NftRarity {
  const attribute = item.attributes.find((value) =>
    rarityOrder.includes(value as NftRarity),
  )

  if (attribute) {
    return attribute as NftRarity
  }

  const price = Number(item.priceEth)

  if (price >= 5) {
    return 'Lendário'
  }

  if (price >= 2.5) {
    return 'Épico'
  }

  if (price >= 1.2) {
    return 'Raro'
  }

  if (index % 5 === 0) {
    return 'Épico'
  }

  return 'Comum'
}

export const seedNfts: Nft[] = (catalog as CatalogNft[]).map((item, index) => ({
  id: item.id,
  tokenId: item.id.replace('nft-', '').padStart(4, '0'),
  title: item.name,
  collection: item.collection,
  description: item.description,
  priceEth: item.priceEth,
  rarity: rarityFor(item, index),
  network: item.network,
  attributes: item.attributes,
  gradient: gradients[index % gradients.length],
  imageUrl: imageBySource[item.imageUrl] ?? null,
  rating: Number((4.3 + (index % 7) * 0.1).toFixed(1)),
  reviews: 7 + ((index * 7) % 38),
  editions: item.editions,
  creator: item.creator,
  contractAddress: item.contractAddress,
}))

export const seedUsers: MockUser[] = [
  {
    id: 'usr_demo',
    username: 'nova',
    email: DEMO_EMAIL,
    displayName: 'Nova Colecionadora',
    avatarUrl: null,
    bio: 'Colecionando cultura digital, uma edição por vez.',
    ensName: 'nova.kurio.eth',
    walletAlias: 'Reserva',
    createdAt: '2026-07-29T12:00:00.000Z',
    passwordSalt: 'kurio-demo-salt-v1',
    passwordHash:
      'abeefb3bcab894f9e52295ad68861c077c700e90edb67613f80917b0892a8e78',
  },
  {
    id: 'usr_test',
    username: 'nova_test',
    email: TEST_EMAIL,
    displayName: 'Nova Teste',
    avatarUrl: null,
    bio: 'Colecionadora de teste oficial Kurio.',
    ensName: 'nova.kurio.eth',
    walletAlias: 'Reserva',
    createdAt: '2026-07-29T12:00:00.000Z',
    passwordSalt: 'kurio-demo-salt-v1',
    passwordHash:
      'abeefb3bcab894f9e52295ad68861c077c700e90edb67613f80917b0892a8e78',
  },
]
