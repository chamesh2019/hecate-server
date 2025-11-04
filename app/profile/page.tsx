'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiKey, FiPlus, FiX, FiCopy, FiRefreshCw } from 'react-icons/fi';

export default function Profile() {
    const router = useRouter();
    const [secrets, setSecrets] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKey, setApiKey] = useState<string>('');
    const [newSecretName, setNewSecretName] = useState('');
    const [newSecretKey, setNewSecretKey] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const token = localStorage.getItem('supabase-jwt-access');
            if (!token) {
                router.push('/');
                return;
            }

            const response = await fetch('/api/auth/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                router.push('/');
            }
        };
        getUser();
    }, [router]);

    const getSecrets = async () => {
        const token = localStorage.getItem('supabase-jwt-access');
        if (token) {
            const response = await fetch('/api/secrets', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSecrets(data.secrets);
            } else {
                console.error('Error fetching secrets:', await response.json());
            }
        }
    };

    useEffect(() => {
        if (user) {
            getSecrets();
        }
    }, [user]);

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
        alert('API key copied to clipboard!');
    };

    const handleShowApiKey = () => {
        fetchApiKey();
        setShowApiKeyModal(true);
    };

    const handleNewSecret = async () => {
        const token = localStorage.getItem('supabase-jwt-access');
        if (token && newSecretName && newSecretKey) {
            const response = await fetch('/api/secrets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newSecretName, key: newSecretKey })
            });

            if (response.ok) {
                setNewSecretName('');
                setNewSecretKey('');
                setShowModal(false);
                getSecrets(); // Refresh secrets
            } else {
                const errorData = await response.json();
                console.error('Error inserting secret:', errorData);
                alert(`Error: ${errorData.error}\n${errorData.details ? JSON.stringify(errorData.details) : ''}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-300 p-8">
            <div className="max-w-2xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold">Your Secret Keys</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleShowApiKey} className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-md text-sm hover:bg-gray-700"><FiKey /><span>Your api key</span></button>
                        <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-md text-sm hover:bg-gray-700"><FiPlus /><span>New secret</span></button>
                    </div>
                </header>

                <div className="bg-[#121212] rounded-lg">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-400">
                            <tr className="border-b border-gray-800">
                                <th className="p-4 font-medium">Secret Name</th>
                                <th className="p-4 font-medium">Secret key</th>
                            </tr>
                        </thead>
                        <tbody>
                            {secrets.map((item) => (
                                <tr key={item.id} className="border-b border-gray-800">
                                    <td className="p-4">
                                        <div className="font-semibold text-white">{item.key}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <span>{item.value}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-[#1A1A1A] p-8 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Add New Secret</h2>
                            <button onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
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
                                onClick={handleNewSecret}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                                Add Secret
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showApiKeyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#1A1A1A] p-8 rounded-lg w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Your API Key</h2>
                            <button onClick={() => setShowApiKeyModal(false)}><FiX className="text-xl" /></button>
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
                                            {`// Fetch all secrets
fetch('http://localhost:3000/api/v1/secrets', {
  headers: {
    'x-api-key': '${apiKey}'
  }
});

// Fetch a specific secret by name
fetch('http://localhost:3000/api/v1/secrets?name=MY_SECRET', {
  headers: {
    'x-api-key': '${apiKey}'
  }
});`}
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
            )}
        </div>
    );
}
