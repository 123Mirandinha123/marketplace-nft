function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function sha256(value: string) {
  const data = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
  return toHex(digest)
}

export function createSalt() {
  return globalThis.crypto.randomUUID()
}

export function createId(prefix: string) {
  return `${prefix}_${globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 12)}`
}

export async function hashPassword(password: string, salt: string) {
  return sha256(`${password}:${salt}`)
}
