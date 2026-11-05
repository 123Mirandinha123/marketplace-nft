import { seedNfts, seedUsers, type MockDb } from './data'

const STORAGE_KEY = 'kurio.mock.db.v1'

function createSeedDb(): MockDb {
  return {
    version: 2,
    scenario: 'standard',
    users: structuredClone(seedUsers),
    sessions: [],
    nfts: structuredClone(seedNfts),
    favorites: {},
    orders: [],
  }
}

export function loadDb(): MockDb {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    const db = createSeedDb()
    saveDb(db)
    return db
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MockDb>

    if (parsed.version !== 2 || !Array.isArray(parsed.nfts)) {
      throw new Error('Unsupported mock database version')
    }

    // Garante que todos os seedUsers estejam presentes (mesmo se o LocalStorage for antigo)
    const existingUsers = parsed.users ?? []
    const mergedUsers = [...existingUsers]
    for (const seed of seedUsers) {
      if (!mergedUsers.some((u) => u.email.toLowerCase() === seed.email.toLowerCase())) {
        mergedUsers.push(seed)
      }
    }

    const db: MockDb = {
      ...createSeedDb(),
      ...parsed,
      users: mergedUsers,
      sessions: parsed.sessions ?? [],
      nfts: parsed.nfts.length > 0 ? parsed.nfts : seedNfts,
      favorites: parsed.favorites ?? {},
      orders: parsed.orders ?? [],
    }
    saveDb(db)
    return db
  } catch {
    const db = createSeedDb()
    saveDb(db)
    return db
  }
}

export function saveDb(db: MockDb) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function resetDb() {
  const db = createSeedDb()
  saveDb(db)
  return db
}

export function updateDb(mutator: (db: MockDb) => void) {
  const db = loadDb()
  mutator(db)
  saveDb(db)
  return db
}
