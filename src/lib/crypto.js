/**
 * TwoLyp Encryption Service
 *
 * AES-256-GCM encryption with PBKDF2 key derivation.
 * Data is encrypted client-side before being stored in Supabase/R2.
 * The shared passphrase is the only way to derive the encryption key.
 */

const SALT_LENGTH = 16
const IV_LENGTH = 12
const PBKDF2_ITERATIONS = 100000

/**
 * Derive an AES-256-GCM key from the shared passphrase
 */
export async function deriveKey(passphrase, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns: { ciphertext: base64, iv: base64, salt: base64 }
 */
export async function encrypt(plaintext, passphrase) {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(passphrase, salt)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  )

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  }
}

/**
 * Decrypt an AES-256-GCM encrypted string
 */
export async function decrypt({ ciphertext, iv, salt }, passphrase) {
  const saltBytes = base64ToArrayBuffer(salt)
  const ivBytes = base64ToArrayBuffer(iv)
  const ciphertextBytes = base64ToArrayBuffer(ciphertext)
  const key = await deriveKey(passphrase, saltBytes)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    ciphertextBytes
  )

  return new TextDecoder().decode(decrypted)
}

/**
 * Encrypt a File/Blob for upload to R2
 * Returns an encrypted Blob with metadata header prepended
 */
export async function encryptFile(file, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(passphrase, salt)

  const fileBuffer = await file.arrayBuffer()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  )

  // Prepend header: [salt(16) + iv(12) + encrypted_data]
  const header = new Uint8Array(SALT_LENGTH + IV_LENGTH + encrypted.byteLength)
  header.set(salt, 0)
  header.set(iv, SALT_LENGTH)
  header.set(new Uint8Array(encrypted), SALT_LENGTH + IV_LENGTH)

  return new Blob([header], { type: 'application/octet-stream' })
}

/**
 * Decrypt a File/Blob downloaded from R2
 */
export async function decryptFile(encryptedBlob, passphrase) {
  const buffer = await encryptedBlob.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  const salt = bytes.slice(0, SALT_LENGTH)
  const iv = bytes.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = bytes.slice(SALT_LENGTH + IV_LENGTH)

  const key = await deriveKey(passphrase, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  return new Blob([decrypted])
}

// --- Helpers ---

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
