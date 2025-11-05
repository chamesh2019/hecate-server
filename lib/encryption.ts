import * as crypto from 'crypto';

/**
 * Encrypts a message using RSA encryption with the provided public key
 * @param message - The message to encrypt
 * @param publicKey - The RSA public key in PEM format
 * @returns Encrypted message as a base64 string
 */
export function encryptWithPublicKey(message: string, publicKey: string): string {
    try {
        const buffer = Buffer.from(message, 'utf8');
        const encrypted = crypto.publicEncrypt(publicKey, buffer);
        return encrypted.toString('base64');
    } catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Failed to encrypt message");
    }
}

/**
 * Decrypts a message using RSA decryption with the provided private key
 * @param encryptedMessage - The encrypted message as a base64 string
 * @param privateKey - The RSA private key in PEM format
 * @returns Decrypted message as a string
 */
export function decryptWithPrivateKey(encryptedMessage: string, privateKey: string): string {
    try {
        const buffer = Buffer.from(encryptedMessage, 'base64');
        const decrypted = crypto.privateDecrypt(privateKey, buffer);
        return decrypted.toString('utf8');
    } catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Failed to decrypt message");
    }
}

/**
 * Validates if a string is a valid RSA public key
 * @param key - The public key to validate
 * @returns true if valid, false otherwise
 */
export function isValidPublicKey(key: string): boolean {
    // Basic validation for PEM format
    return Boolean(key && key.trim().startsWith('-----BEGIN PUBLIC KEY-----') && key.trim().endsWith('-----END PUBLIC KEY-----'));
}

/**
 * Generates an RSA key pair
 * @returns An object containing publicKey and privateKey in PEM format
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    return {
        publicKey,
        privateKey
    };
}
