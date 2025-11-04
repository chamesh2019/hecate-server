'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileHeader from './components/ProfileHeader';
import SecretsTable from './components/SecretsTable';
import NewSecretModal from './components/NewSecretModal';
import ApiKeyModal from './components/ApiKeyModal';
import EncryptionKeyModal from './components/EncryptionKeyModal';

export default function Profile() {
    const router = useRouter();
    const [secrets, setSecrets] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [showPublicKeyModal, setShowPublicKeyModal] = useState(false);
    const [publicKey, setPublicKey] = useState<string>('');
    const [hasPublicKey, setHasPublicKey] = useState<boolean>(false);

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

    const fetchPublicKey = async () => {
        const token = localStorage.getItem('supabase-jwt-access');
        if (token) {
            const response = await fetch('/api/publickey', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.publicKey) {
                    setPublicKey(data.publicKey);
                    setHasPublicKey(true);
                } else {
                    setHasPublicKey(false);
                }
            }
        }
    };

    useEffect(() => {
        if (user) {
            getSecrets();
            fetchPublicKey();
        }
    }, [user]);

    const handleDeleteSecret = async (secretId: string, secretName: string) => {
        if (!confirm(`Are you sure you want to delete the secret "${secretName}"?`)) {
            return;
        }

        const token = localStorage.getItem('supabase-jwt-access');
        if (token) {
            const response = await fetch(`/api/secrets?id=${secretId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                getSecrets(); // Refresh secrets
            } else {
                const errorData = await response.json();
                console.error('Error deleting secret:', errorData);
                alert(`Error: ${errorData.error}`);
            }
        }
    };

    const handleKeySaved = (key: string) => {
        setPublicKey(key);
        setHasPublicKey(true);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-gray-300 p-8">
            <div className="max-w-2xl mx-auto">
                <ProfileHeader
                    hasPublicKey={hasPublicKey}
                    onShowPublicKeyModal={() => setShowPublicKeyModal(true)}
                    onShowApiKeyModal={() => setShowApiKeyModal(true)}
                    onShowNewSecretModal={() => setShowModal(true)}
                />

                <SecretsTable
                    secrets={secrets}
                    onDeleteSecret={handleDeleteSecret}
                />
            </div>

            <NewSecretModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                hasPublicKey={hasPublicKey}
                publicKey={publicKey}
                onSecretAdded={getSecrets}
            />

            <ApiKeyModal
                isOpen={showApiKeyModal}
                onClose={() => setShowApiKeyModal(false)}
            />

            <EncryptionKeyModal
                isOpen={showPublicKeyModal}
                onClose={() => setShowPublicKeyModal(false)}
                hasPublicKey={hasPublicKey}
                onKeySaved={handleKeySaved}
            />
        </div>
    );
}
