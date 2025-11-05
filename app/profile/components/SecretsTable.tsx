import { FiTrash2 } from 'react-icons/fi';

interface Secret {
    createdAt: string;
    id: string;
    key: string;
    value: string;
}

interface SecretsTableProps {
    secrets: Secret[];
    onDeleteSecret: (id: string, name: string) => void;
}

export default function SecretsTable({ secrets, onDeleteSecret }: SecretsTableProps) {
    return (
        <div className="bg-[#121212] rounded-lg">
            <table className="w-full text-left text-sm">
                <thead className="text-gray-400">
                    <tr className="border-b border-gray-800">
                        <th className="p-4 font-medium">Secret Name</th>
                        <th className="p-4 font-medium">Created at</th>
                        <th className="p-4 font-medium">Actions</th>
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
                                    <span>{item.createdAt}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => onDeleteSecret(item.id, item.key)}
                                    className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm text-white transition-colors"
                                    title="Delete secret"
                                >
                                    <FiTrash2 />
                                    <span>Delete</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}