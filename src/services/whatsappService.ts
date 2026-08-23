import { supabase } from '../lib/supabase.js';

export type WhatsAppStatus = 'disconnected' | 'connecting' | 'connected' | 'qr';

interface WhatsAppServiceState {
    status: WhatsAppStatus;
    qrCodeBase64: string | null;
}

const state: WhatsAppServiceState = {
    status: 'disconnected',
    qrCodeBase64: null,
};

async function getEvolutionConfig() {
    const { data } = await supabase.from('settings').select('evolution_instance, evolution_api_url, evolution_api_key').eq('company_id', 'comp-alfa').single();
    return {
        instance: data?.evolution_instance,
        apiUrl: data?.evolution_api_url,
        apiKey: data?.evolution_api_key
    };
}

export const startWhatsApp = async (): Promise<void> => {
    if (state.status === 'connected' || state.status === 'connecting') {
        return;
    }

    state.status = 'connecting';
    state.qrCodeBase64 = null;

    try {
        const config = await getEvolutionConfig();
        if (!config.instance || !config.apiUrl || !config.apiKey) {
            throw new Error('Configurações da Evolution API não encontradas no banco de dados.');
        }

        const baseUrl = config.apiUrl.replace(/\/$/, '');
        
        // 1. Tentar conectar / criar instância
        const response = await fetch(`${baseUrl}/instance/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            },
            body: JSON.stringify({
                instanceName: config.instance,
                qrcode: true,
                integration: "WHATSAPP-BAILEYS"
            })
        });

        const data = await response.json();
        
        if (data.instance?.status === 'open' || data.instance?.status === 'connected') {
            state.status = 'connected';
            state.qrCodeBase64 = null;
        } else if (data.qrcode && data.qrcode.base64) {
            state.status = 'qr';
            state.qrCodeBase64 = data.qrcode.base64;
        } else if (response.status === 403 || data.error) {
            // Se já existe e retornou erro de existente, tenta buscar o estado
            await getWhatsAppStatus();
        } else {
             state.status = 'disconnected';
             state.qrCodeBase64 = null;
        }

    } catch (error) {
        console.error('Falha ao conectar via Evolution API:', error);
        state.status = 'disconnected';
    }
};

export const logoutWhatsApp = async (): Promise<void> => {
    try {
        const config = await getEvolutionConfig();
        if (!config.instance || !config.apiUrl || !config.apiKey) return;

        const baseUrl = config.apiUrl.replace(/\/$/, '');
        
        await fetch(`${baseUrl}/instance/logout/${config.instance}`, {
            method: 'DELETE',
            headers: {
                'apikey': config.apiKey
            }
        });
        
    } catch (error) {
         console.error('Erro ao deslogar da Evolution API:', error);
    } finally {
        state.status = 'disconnected';
        state.qrCodeBase64 = null;
    }
};

export const getWhatsAppStatus = async () => {
    try {
        const config = await getEvolutionConfig();
        if (!config.instance || !config.apiUrl || !config.apiKey) {
            return { status: 'disconnected', qrCodeBase64: null };
        }

        const baseUrl = config.apiUrl.replace(/\/$/, '');
        
        const response = await fetch(`${baseUrl}/instance/connectionState/${config.instance}`, {
            method: 'GET',
            headers: {
                'apikey': config.apiKey
            }
        });

        const data = await response.json();
        const instanceState = data?.instance?.state || data?.state;

        if (instanceState === 'open' || instanceState === 'connected') {
            state.status = 'connected';
            state.qrCodeBase64 = null;
        } else if (instanceState === 'connecting' || instanceState === 'close') {
            state.status = 'disconnected';
            state.qrCodeBase64 = null;
        }
        
    } catch (error) {
         console.error('Erro ao verificar status na Evolution API:', error);
    }

    return {
        status: state.status,
        qrCodeBase64: state.qrCodeBase64
    };
};

export const sendWhatsAppMessage = async (phone: string, text: string): Promise<boolean> => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('55') && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
        cleanPhone = '55' + cleanPhone;
    }
    
    try {
        const config = await getEvolutionConfig();
        if (!config.instance || !config.apiUrl || !config.apiKey) {
             throw new Error('Configurações da Evolution API não encontradas no banco de dados.');
        }

        const baseUrl = config.apiUrl.replace(/\/$/, '');

        const response = await fetch(`${baseUrl}/message/sendText/${config.instance}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            },
            body: JSON.stringify({
                number: cleanPhone,
                options: {
                    delay: 1200,
                    presence: 'composing'
                },
                textMessage: {
                    text: text
                }
            })
        });

        if (!response.ok) {
             throw new Error(`Erro na API Evolution: ${response.statusText}`);
        }
        
        const result = await response.json();

        // Save outgoing message to DB
        await supabase.from('whatsapp_messages').insert({
            id: result?.key?.id || `msg-out-${Date.now()}`,
            lead_phone: cleanPhone,
            sender: 'attendant',
            text: text,
            status: 'entregue',
            timestamp: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Erro ao enviar mensagem no WhatsApp (Evolution API):', error);
        return false;
    }
};
