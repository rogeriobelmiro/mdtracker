import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, LogOut, CheckCircle } from 'lucide-react';

interface WhatsAppStatusData {
    status: 'disconnected' | 'connecting' | 'connected' | 'qr';
    qrCodeBase64: string | null;
}

interface WhatsAppConnectionCardProps {
    companyId?: string;
}

export const WhatsAppConnectionCard: React.FC<WhatsAppConnectionCardProps> = ({ companyId }) => {
    const [waStatus, setWaStatus] = useState<WhatsAppStatusData>({ status: 'disconnected', qrCodeBase64: null });
    const [loading, setLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`/api/whatsapp/status?companyId=${companyId || 'comp-alfa'}`);
            const data = await res.json();
            setWaStatus(data);
        } catch (error) {
            console.error('Erro ao buscar status do WhatsApp:', error);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const connectWhatsApp = async () => {
        setLoading(true);
        try {
            await fetch('/api/whatsapp/connect', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId: companyId || 'comp-alfa' })
            });
            await fetchStatus();
        } catch (error) {
            console.error('Erro ao conectar:', error);
        }
        setLoading(false);
    };

    const logoutWhatsApp = async () => {
        setLoading(true);
        try {
            await fetch('/api/whatsapp/logout', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId: companyId || 'comp-alfa' })
            });
            await fetchStatus();
        } catch (error) {
            console.error('Erro ao desconectar:', error);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Conexão WhatsApp (Baileys)</h3>
                        <p className="text-[11px] text-slate-500">
                            Conecte seu aparelho para enviar e receber mensagens automaticamente pelo sistema.
                        </p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded border self-start sm:self-auto ${
                    waStatus.status === 'connected' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    waStatus.status === 'qr' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                    Status: {waStatus?.status?.toUpperCase() || 'DESCONECTADO'}
                </span>
            </div>

            <div className="flex flex-col items-center justify-center py-4 space-y-4">
                {waStatus.status === 'disconnected' && (
                    <div className="text-center space-y-3">
                        <p className="text-sm text-slate-600">Nenhum aparelho conectado no momento.</p>
                        <button
                            onClick={connectWhatsApp}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                            Gerar QR Code para Conectar
                        </button>
                    </div>
                )}

                {(waStatus.status === 'connecting' || (waStatus.status === 'qr' && !waStatus.qrCodeBase64)) && (
                    <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                        <p className="text-sm text-slate-500">Iniciando conexão e gerando QR Code...</p>
                    </div>
                )}

                {waStatus.status === 'qr' && waStatus.qrCodeBase64 && (
                    <div className="flex flex-col items-center space-y-3">
                        <p className="text-xs font-semibold text-slate-700">Escaneie o QR Code no seu WhatsApp (Aparelhos Conectados):</p>
                        <div className="p-2 bg-white rounded-lg border-2 border-slate-200 shadow-sm inline-block">
                            <img src={waStatus.qrCodeBase64} alt="WhatsApp QR Code" className="w-64 h-64" />
                        </div>
                    </div>
                )}

                {waStatus.status === 'connected' && (
                    <div className="flex flex-col items-center space-y-3">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                        <p className="text-sm font-semibold text-emerald-700">Aparelho conectado com sucesso!</p>
                        <button
                            onClick={logoutWhatsApp}
                            disabled={loading}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-6 rounded transition flex items-center justify-center gap-2 border border-red-200 mt-2 disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                            Desconectar Aparelho
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
