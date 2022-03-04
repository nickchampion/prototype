import crypto from 'crypto'
const set = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const keys = {
  salt: 'somethingrandom',
  nonce: 10,
  iv: 16,
  algorithm: 'sha512',
  iterations: 100000,
  length: 48
}

const create_hash = buffer => crypto.createHash('sha256').update(buffer).digest('base64')

const hash = password => {
  const salt = crypto.randomBytes(16).toString('hex').replace('$', '')
  const hashed = crypto.pbkdf2Sync(password, salt, keys.iterations, keys.length, keys.algorithm)
  return `${hashed.toString('hex')}$${salt}$${keys.iterations}$${keys.algorithm}`
}

const compare = (clearPassword, storedPassword) => {
  const parts = storedPassword.split('$')
  const algorithm = parts[parts.length - 1]
  const iterations = parseInt(parts[parts.length - 2])
  const salt = parts[parts.length - 3]
  const originalPassword = storedPassword.split(`$${salt}`)[0]

  const hashedPassword = crypto.pbkdf2Sync(clearPassword, salt, iterations, keys.length, algorithm)

  return hashedPassword.toString('hex') === originalPassword
}

const random_alpha_numeric = length => {
  const bytes = crypto.randomBytes(length)
  const chars = []

  for (let i = 0; i < bytes.length; i += 1) {
    chars.push(set[bytes[i] % set.length])
  }

  return chars.join('')
}

const hash_code = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i += 1) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

const base64_encode = input => {
  const buffer = Buffer.from(input, 'utf8')
  return buffer.toString('base64')
}

const base64_decode = input => {
  const buffer = Buffer.from(input, 'base64')
  return buffer.toString('utf8')
}

function encrypt(text, key, salt) {
  const cryptoKey = get_key(key, salt)
  const nonce = crypto.randomBytes(keys.nonce)
  const iv = Buffer.alloc(keys.iv)
  nonce.copy(iv)

  const cipher = crypto.createCipheriv('aes-256-ctr', cryptoKey, iv)
  const encrypted = cipher.update(text.toString())
  const message = Buffer.concat([nonce, encrypted, cipher.final()])
  return message.toString('base64')
}

function decrypt(text, key, salt) {
  try {
    const cryptoKey = get_key(key, salt)
    const message = Buffer.from(text, 'base64')
    const iv = Buffer.alloc(keys.iv)
    message.copy(iv, 0, 0, keys.nonce)
    const encryptedText = message.slice(keys.nonce)
    const decipher = crypto.createDecipheriv('aes-256-ctr', cryptoKey, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (err) {
    return null
  }
}

function get_key(key, salt) {
  return crypto.pbkdf2Sync(key, salt || keys.salt, 10000, 32, 'sha512')
}

module.exports = {
  hash,
  hash_code,
  compare,
  random_alpha_numeric,
  base64_encode,
  base64_decode,
  create_hash,
  encrypt,
  decrypt
}
