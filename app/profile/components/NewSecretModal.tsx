import { useState } from 'react';
import { FiX, FiLock, FiKey } from 'react-icons/fi';
import { encryptWithPublicKey } from '@/lib/encryption';

interface NewSecretModalProps {
    isOpen: boolean;
    onClose: () => void;
    hasPublicKey: boolean;
    publicKey: string;
    onSecretAdded: () => void;
}

export default function NewSecretModal({
    isOpen,
    onClose,
    hasPublicKey,
    publicKey,
    onSecretAdded
}: NewSecretModalProps) {
    const [newSecretName, setNewSecretName] = useState('');
    const [newSecretKey, setNewSecretKey] = useState('');

    const handleSubmit = async () => {
        const token = localStorage.getItem('supabase-jwt-access');
        if (token && newSecretName && newSecretKey) {
            let secretValue = newSecretKey;

            // Encrypt the secret if a public key is available
            if (hasPublicKey && publicKey) {
                try {
                    secretValue = encryptWithPublicKey(newSecretKey, publicKey);
                } catch (error) {
                    console.error('Encryption error:', error);
                    alert('Failed to encrypt the secret. Please check your public key.');
                    return;
                }
            }

            const response = await fetch('/api/secrets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key: newSecretName, value: secretValue })
            });

            if (response.ok) {
                setNewSecretName('');
                setNewSecretKey('');
                onClose();
                onSecretAdded(); // Refresh secrets
            } else {
                const errorData = await response.json();
                console.error('Error inserting secret:', errorData);
                alert(`Error: ${errorData.error}\n${errorData.details ? JSON.stringify(errorData.details) : ''}`);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-[#1A1A1A] p-8 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Add New Secret</h2>
                    <button onClick={onClose}><FiX /></button>
                </div>
                {hasPublicKey && (
                    <div className="mb-4 p-3 bg-green-900 bg-opacity-20 border border-green-700 rounded-md text-sm">
                        <div className="flex items-center space-x-2 text-green-300">
                            <FiLock />
                            <span>This secret will be encrypted with your encryption key</span>
                        </div>
                    </div>
                )}
                {!hasPublicKey && (
                    <div className="mb-4 p-3 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-md text-sm">
                        <div className="flex items-center space-x-2 text-yellow-300">
                            <FiKey />
                            <span>Add an encryption key to enable encryption</span>
                        </div>
                    </div>
                )}
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Secret Name"
                        value={newSecretName}
                        onChange={(e) => setNewSecretName(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded-md"
                    />
                    <input
                        type="text"
                        placeholder="Secret Key"
                        value={newSecretKey}
                        onChange={(e) => setNewSecretKey(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded-md"
                    />
                    <button
                        onClick={handleSubmit}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                        Add Secret
                    </button>
                </div>
            </div>
        </div>
    );
}