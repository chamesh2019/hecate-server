import CryptoJS from 'crypto-js';

/**
 * Encrypts a message using AES encryption with the provided key
 * @param message - The message to encrypt
 * @param encryptionKey - The encryption key (can be a passphrase)
 * @returns Encrypted message as a string
 */
export function encryptWithPublicKey(message: string, encryptionKey: string): string {
    try {
        const encrypted = CryptoJS.AES.encrypt(message, encryptionKey);
        return encrypted.toString();
    } catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Failed to encrypt message");
    }
}

/**
 * Decrypts a message using AES decryption with the provided key
 * @param encryptedMessage - The encrypted message
 * @param encryptionKey - The decryption key (same as encryption key)
 * @returns Decrypted message as a string
 */
export function decryptWithPrivateKey(encryptedMessage: string, encryptionKey: string): string {
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Failed to decrypt message");
    }
}

/**
 * Validates if a string is a valid encryption key
 * @param key - The encryption key to validate
 * @returns true if valid, false otherwise
 */
export function isValidPublicKey(key: string): boolean {
    // For AES, we just need to ensure the key is not empty and has minimum length
    return Boolean(key && key.trim().length >= 8);
}

/**
 * Generates a random encryption key
 * @returns A random 256-bit key in hex format
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
    // Generate a random 256-bit key
    const randomKey = CryptoJS.lib.WordArray.random(32).toString();

    return {
        publicKey: randomKey,
        privateKey: randomKey, // For AES, the key is the same for encryption and decryption
    };
}
