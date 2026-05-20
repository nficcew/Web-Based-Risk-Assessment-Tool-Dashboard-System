const crypto = require('crypto');

// AES-256-CBC Encryption Configuration
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits

/**
 * Generate a random encryption key
 * @returns {string} Base64 encoded key
 */
const generateKey = () => {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
};

/**
 * Encrypt data using AES-256-CBC
 * @param {string} plaintext - The text to encrypt
 * @param {string} key - Base64 encoded encryption key (optional, uses env key if not provided)
 * @returns {string} Encrypted data in format: iv:encryptedData (both base64)
 */
const encrypt = (plaintext, key = null) => {
  try {
    // Use provided key or environment key
    const encryptionKey = key
      ? Buffer.from(key, 'base64')
      : Buffer.from(process.env.ENCRYPTION_KEY || generateKey(), 'base64');

    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Return IV + encrypted data (IV needed for decryption)
    return iv.toString('base64') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES-256-CBC
 * @param {string} encryptedData - The encrypted string in format: iv:encryptedData
 * @param {string} key - Base64 encoded encryption key (optional, uses env key if not provided)
 * @returns {string} Decrypted plaintext
 */
const decrypt = (encryptedData, key = null) => {
  try {
    // Use provided key or environment key
    const encryptionKey = key
      ? Buffer.from(key, 'base64')
      : Buffer.from(process.env.ENCRYPTION_KEY, 'base64');

    // Split IV and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'base64');
    const encrypted = parts[1];

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash sensitive data (one-way, for comparison only)
 * @param {string} data - Data to hash
 * @returns {string} SHA-256 hash
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Example usage:
// const key = generateKey();
// const encrypted = encrypt('Hello, AES-256 encryption!', key);
// const decrypted = decrypt(encrypted, key);

module.exports = {
  generateKey,
  encrypt,
  decrypt,
  hashData,
  ALGORITHM
};
