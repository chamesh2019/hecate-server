import { FiKey, FiPlus, FiLock } from 'react-icons/fi';

interface ProfileHeaderProps {
    hasPublicKey: boolean;
    onShowPublicKeyModal: () => void;
    onShowApiKeyModal: () => void;
    onShowNewSecretModal: () => void;
}

export default function ProfileHeader({
    hasPublicKey,
    onShowPublicKeyModal,
    onShowApiKeyModal,
    onShowNewSecretModal
}: ProfileHeaderProps) {
    return (
        <header className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold">Hecate</h1>
                {hasPublicKey && (
                    <span className="flex items-center space-x-1 px-2 py-1 bg-green-900 text-green-300 rounded-md text-xs">
                        <FiLock size={12} />
                        <span>Encryption enabled</span>
                    </span>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onShowPublicKeyModal}
                    className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-md text-sm hover:bg-gray-700"
                >
                    <FiLock />
                    <span>{hasPublicKey ? 'Update' : 'Add'} encryption key</span>
                </button>
                <button
                    onClick={onShowApiKeyModal}
                    className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-md text-sm hover:bg-gray-700"
                >
                    <FiKey />
                    <span>Your api key</span>
                </button>
                <button
                    onClick={onShowNewSecretModal}
                    className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-md text-sm hover:bg-gray-700"
                >
                    <FiPlus />
                    <span>New secret</span>
                </button>
            </div>
        </header>
    );
}