import { useState } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import { isValidPublicKey } from '@/lib/encryption';

interface EncryptionKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    hasPublicKey: boolean;
    onKeySaved: (key: string) => void;
}

export default function EncryptionKeyModal({
    isOpen,
    onClose,
    hasPublicKey,
    onKeySaved
}: EncryptionKeyModalProps) {
    const [newPublicKey, setNewPublicKey] = useState<string>('');

    const handleSavePublicKey = async () => {
        if (!newPublicKey) {
            alert('Please enter a public key');
            return;
        }

        if (!isValidPublicKey(newPublicKey)) {
            alert('Invalid RSA public key. Please provide a valid PEM-formatted public key.');
            return;
        }

        const token = localStorage.getItem('supabase-jwt-access');
        if (token) {
            const response = await fetch('/api/publickey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ publicKey: newPublicKey })
            });

            if (response.ok) {
                onKeySaved(newPublicKey);
                setNewPublicKey('');
                onClose();
                alert('Encryption key saved successfully!');
            } else {
                const errorData = await response.json();
                console.error('Error saving public key:', errorData);
                alert(`Error: ${errorData.error}`);
            }
        }
    };

    const handleGenerateKeyPair = async () => {
        try {
            const token = localStorage.getItem('supabase-jwt-access');
            if (!token) {
                alert('You must be logged in to generate keys.');
                return;
            }

            const response = await fetch('/api/generate-keys', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate key pair');
            }

            const keyPair = await response.json();
            setNewPublicKey(keyPair.publicKey);

            // Download private key
            const blob = new Blob([keyPair.privateKey], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'hecate-private-key.pem';
            a.click();
            URL.revokeObjectURL(url);

            alert('Key pair generated successfully! Your private key has been downloaded. Keep it safe!');
        } catch (error: any) {
            console.error('Key generation error:', error);
            alert(`Failed to generate key pair: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1A1A1A] p-8 rounded-lg w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{hasPublicKey ? 'Update' : 'Add'} Encryption Key</h2>
                    <button onClick={onClose}><FiX className="text-xl" /></button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                        Your RSA public key is used to encrypt secrets on the client side before they are stored.
                        Keep your private key safe - you'll need it to decrypt your secrets later.
                    </p>
                    {hasPublicKey && (
                        <div className="p-3 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-md text-sm">
                            <div className="text-blue-300">
                                <strong>Note:</strong> Updating your encryption key will not re-encrypt existing secrets.
                                Only new secrets will be encrypted with the new key.
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-2">RSA Public Key</label>
                        <textarea
                            placeholder="Enter your RSA public key in PEM format..."
                            value={newPublicKey}
                            onChange={(e) => setNewPublicKey(e.target.value)}
                            className="w-full p-3 bg-gray-800 rounded-md font-mono text-sm"
                            rows={4}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSavePublicKey}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                        >
                            Save Encryption Key
                        </button>
                        <button
                            onClick={handleGenerateKeyPair}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
                        >
                            <FiDownload />
                            <span>Generate Random Key</span>
                        </button>
                    </div>
                    <div className="mt-4 p-4 bg-gray-800 rounded-md">
                        <h3 className="font-semibold mb-2">How to use:</h3>
                        <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
                            <li>Generate an RSA key pair using the button above, or provide your own RSA public key in PEM format</li>
                            <li>If generated, your private key will be downloaded automatically - keep it safe!</li>
                            <li>All new secrets will be automatically encrypted with your public key using RSA</li>
                            <li>Use your private key to decrypt secrets when you retrieve them</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}