import { supabase } from '../lib/supabase.js';

export type WhatsAppStatus = 'disconnected' | 'connecting' | 'connected' | 'qr';

interface WhatsAppServiceState {
    status: WhatsAppStatus;
    qrCodeBase64: string | null;
}

const companyStates = new Map<string, WhatsAppServiceState>();

function getState(companyId: string): WhatsAppServiceState {
    if (!companyStates.has(companyId)) {
        companyStates.set(companyId, { status: 'disconnected', qrCodeBase64: null });
    }
    return companyStates.get(companyId)!;
}

async function getEvolutionConfig(companyId: string) {
    const { data } = await supabase.from('settings').select('evolution_instance, evolution_api_url, evolution_api_key').eq('company_id', companyId).single();
    return {
        instance: data?.evolution_instance,
        apiUrl: data?.evolution_api_url,
        apiKey: data?.evolution_api_key
    };
}

export const startWhatsApp = async (companyId: string): Promise<void> => {
    const state = getState(companyId);
    if (state.status === 'connected' || state.status === 'connecting') {
        return;
    }

    state.status = 'connecting';
    state.qrCodeBase64 = null;

    try {
        const config = await getEvolutionConfig(companyId);
        if (!config.instance || !config.apiUrl || !config.apiKey) {
            throw new Error('Configurações da Evolution API não encontradas no banco de dados.');
        }

        const baseUrl = config.apiUrl.replace(/\/$/, '');
        
        // 1. Tentar conectar / criar instância
        const response = await fetch(`${baseUrl}/instance/create`, {
            method: 'POST',
            signal: AbortSignal.timeout(15000), // 15 seconds timeout
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.apiKey
            },
            body: JSON.stringify({
                instanceName: config.instance,
                qrcode: true,
                integration: "WHATSAPP-BAILEYS",
                webhook: {
                    enabled: true,
                    url: "https://mdtracker.mudadigital.com.br/api/whatsapp/evolution/webhook",
                    byEvents: false,
                    base64: false,
                    events: ["MESSAGES_UPSERT"]
                }
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
            // Se já existe, tentar pegar o QR Code de conexão
            console.log('Instância já existe. Buscando QR Code...');
            const connectRes = await fetch(`${baseUrl}/instance/connect/${config.instance}`, {
                method: 'GET',
                signal: AbortSignal.timeout(10000),
                headers: { 'apikey': config.apiKey }
            });
            const connectData = await connectRes.json();
            
            if (connectData.base64) {
                state.status = 'qr';
                state.qrCodeBase64 = connectData.base64;
            } else if (connectData.qrcode && connectData.qrcode.base64) {
                state.status = 'qr';
                state.qrCodeBase64 = connectData.qrcode.base64;
            } else {
                console.log('Instância presa ou sem QR Code. Deletando e recriando...');
                // Deletar a instância travada
                await fetch(`${baseUrl}/instance/delete/${config.instance}`, {
                    method: 'DELETE',
                    signal: AbortSignal.timeout(8000),
                    headers: { 'apikey': config.apiKey }
                });

                // Tentar criar novamente
                const retryResponse = await fetch(`${baseUrl}/instance/create`, {
                    method: 'POST',
                    signal: AbortSignal.timeout(15000),
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': config.apiKey
                    },
                    body: JSON.stringify({
                        instanceName: config.instance,
                        qrcode: true,
                        integration: "WHATSAPP-BAILEYS",
                        webhook: {
                            enabled: true,
                            url: "https://mdtracker.mudadigital.com.br/api/whatsapp/evolution/webhook",
                            byEvents: false,
                            base64: false,
                            events: ["MESSAGES_UPSERT"]
                        }
                    })
                });
                
                const retryData = await retryResponse.json();
                if (retryData.qrcode && retryData.qrcode.base64) {
                    state.status = 'qr';
                    state.qrCodeBase64 = retryData.qrcode.base64;
                } else if (retryData.instance?.status === 'open' || retryData.instance?.status === 'connected') {
                    state.status = 'connected';
                    state.qrCodeBase64 = null;
                } else {
                    state.status = 'disconnected';
                    state.qrCodeBase64 = null;
                }
            }
        } else if (response.status === 401) {
             console.error('Erro de Autenticação (401): A Global API Key da Evolution é inválida.');
             state.status = 'disconnected';
             state.qrCodeBase64 = null;
        } else {
             console.error('Erro desconhecido na Evolution API:', data);
             state.status = 'disconnected';
             state.qrCodeBase64 = null;
        }
    } catch (error) {
        console.error('Erro ao conectar na Evolution API:', error);
        const state = getState(companyId);
        state.status = 'disconnected';
        state.qrCodeBase64 = null;
    }
};

export const logoutWhatsApp = async (companyId: string): Promise<void> => {
    const state = getState(companyId);
    try {
        const config = await getEvolutionConfig(companyId);
        if (!config.instance || !config.apiUrl || !config.apiKey) return;

        const baseUrl = config.apiUrl.replace(/\/$/, '');
        
        await fetch(`${baseUrl}/instance/logout/${config.instance}`, {
            method: 'DELETE',
            signal: AbortSignal.timeout(8000),
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

export const getWhatsAppStatus = async (companyId: string) => {
    const state = getState(companyId);
    try {
        const config = await getEvolutionConfig(companyId);
        if (!config.instance || !config.apiUrl || !config.apiKey) {
            return { status: 'disconnected', qrCodeBase64: null };
        }

        const baseUrl = config.apiUrl.replace(/\/$/, '');
        
        const response = await fetch(`${baseUrl}/instance/connectionState/${config.instance}`, {
            method: 'GET',
            signal: AbortSignal.timeout(8000),
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
