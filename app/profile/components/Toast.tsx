import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose?: () => void;
}

const typeStyles: Record<NonNullable<ToastProps['type']>, string> = {
    success: 'bg-green-600/90 text-white border-green-400/80',
    error: 'bg-red-600/90 text-white border-red-400/80',
    info: 'bg-blue-600/90 text-white border-blue-400/80'
};

export default function Toast({
    message,
    type = 'info',
    duration = 3000,
    onClose
}: ToastProps) {
    useEffect(() => {
        if (!onClose) {
            return;
        }

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`fixed top-6 right-6 z-[60] max-w-sm rounded-md border px-4 py-3 shadow-lg backdrop-blur ${typeStyles[type]}`}
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    );
}
