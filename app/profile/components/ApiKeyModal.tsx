import { useState, useEffect } from 'react';
import { FiX, FiCopy, FiRefreshCw } from 'react-icons/fi';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
    const [apiKey, setApiKey] = useState<string>('');

    const fetchApiKey = async () => {
        const token = localStorage.getItem('supabase-jwt-access');
        if (token) {
            const response = await fetch('/api/apikey', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApiKey(data.apiKey);
            }
        }
    };

    const regenerateApiKey = async () => {
        const token = localStorage.getItem('supabase-jwt-access');
        if (token) {
            if (!confirm('Are you sure? This will invalidate your old API key.')) {
                return;
            }

            const response = await fetch('/api/apikey', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApiKey(data.apiKey);
                alert('New API key generated successfully!');
            }
        }
    };

    const copyApiKey = () => {
        navigator.clipboard.writeText(apiKey);

        // change modal button text to "Copied" for 2 seconds
        const button = document.querySelector('button[title="Copy API key"]') as HTMLButtonElement | null;
        if (button) {
            const originalInner = button.innerHTML;
            button.innerHTML = 'Copied';
            setTimeout(() => {
                button.innerHTML = originalInner;
            }, 2000);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchApiKey();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1A1A1A] p-8 rounded-lg w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Your API Key</h2>
                    <button onClick={onClose}><FiX className="text-xl" /></button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                        Use this API key to access your secrets from your client-side library. Keep it secure!
                    </p>
                    {apiKey ? (
                        <>
                            <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-md">
                                <code className="flex-1 text-sm break-all">{apiKey}</code>
                                <button
                                    onClick={copyApiKey}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                                    title="Copy API key"
                                >
                                    <FiCopy />
                                </button>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={regenerateApiKey}
                                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-md"
                                >
                                    <FiRefreshCw />
                                    <span>Regenerate Key</span>
                                </button>
                            </div>
                            <div className="mt-4 p-4 bg-gray-800 rounded-md">
                                <h3 className="font-semibold mb-2">Usage Example:</h3>
                                <pre className="text-xs bg-gray-900 p-3 rounded overflow-x-auto">
                                    {`
import Hecate from 'hecate-keystone';

// Initialize with environment variables
// Set HECATE_API_KEY and HECATE_USER_KEY in your environment
const hecate = new Hecate();

// Or pass keys directly to constructor
const hecate = new Hecate('your-api-key-here', 'your-user-key-here');

// Fetch a secret
try {
    const secret = await hecate.getSecret('DATABASE_PASSWORD');
    console.log('Secret value:', secret.value);
} catch (error) {
    console.error('Failed to fetch secret:', error);
}
`}
                                </pre>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400">Loading API key...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}