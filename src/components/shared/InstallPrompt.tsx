import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl p-4 border border-pink-100 z-50 animate-fade-in-up">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Instalar App</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Instale o aplicativo para acesso rápido e melhor experiência.
                    </p>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleInstallClick}
                            className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Instalar
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Agora não
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
