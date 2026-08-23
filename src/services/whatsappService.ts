import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { supabase } from '../lib/supabase.js';

const AUTH_DIR = path.join(process.cwd(), 'baileys_auth_info');

// Cache in-memory for remoteJids (maps cleanPhone -> exact JID with domain)
const jidCache = new Map<string, string>();

export type WhatsAppStatus = 'disconnected' | 'connecting' | 'connected' | 'qr';

interface WhatsAppServiceState {
    status: WhatsAppStatus;
    qrCodeBase64: string | null;
    socket: ReturnType<typeof makeWASocket> | null;
}

const state: WhatsAppServiceState = {
    status: 'disconnected',
    qrCodeBase64: null,
    socket: null
};

// Initialize logger
const logger = pino({ level: 'silent' });

export const startWhatsApp = async (): Promise<void> => {
    if (state.status === 'connected' || state.status === 'connecting') {
        return;
    }

    state.status = 'connecting';
    state.qrCodeBase64 = null;

    try {
        const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: false,
            auth: authState,
            browser: Browsers.macOS('Desktop'),
            syncFullHistory: false
        });

        state.socket = sock;

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                state.status = 'qr';
                state.qrCodeBase64 = await QRCode.toDataURL(qr);
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
                
                state.status = 'disconnected';
                state.socket = null;
                state.qrCodeBase64 = null;

                if (shouldReconnect) {
                    console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting...');
                    startWhatsApp();
                } else {
                    console.log('connection closed. logged out.');
                    // If logged out, remove auth dir to start fresh next time
                    if (fs.existsSync(AUTH_DIR)) {
                        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
                    }
                }
            } else if (connection === 'open') {
                console.log('opened connection');
                state.status = 'connected';
                state.qrCodeBase64 = null;
            }
        });

        sock.ev.on('messages.upsert', async (m) => {
            if (m.type === 'notify') {
                for (const msg of m.messages) {
                    // Ignore status updates
                    if (msg.key.remoteJid === 'status@broadcast') continue;
                    
                    const remoteJid = msg.key.remoteJid || '';
                    // Extract phone number from JID (ex: 5511999999999@s.whatsapp.net -> 5511999999999)
                    const phone = remoteJid.split('@')[0];
                    
                    // Store the exact JID in cache for reliable replies
                    jidCache.set(phone, remoteJid);
                    
                    const isFromMe = msg.key.fromMe;
                    const textContent = msg.message?.conversation || 
                                        msg.message?.extendedTextMessage?.text || 
                                        msg.message?.imageMessage?.caption || 
                                        '[Mensagem sem suporte no momento]';

                    if (!textContent || textContent === '') continue;

                    // Check if lead exists
                    const { data: existingLead } = await supabase
                        .from('leads')
                        .select('id')
                        .eq('phone', phone)
                        .maybeSingle();

                    if (!existingLead && !isFromMe) {
                        // Find first active company to assign this lead to
                        const { data: firstCompany } = await supabase.from('companies').select('id').limit(1).maybeSingle();
                        const assignedCompanyId = firstCompany ? firstCompany.id : 'comp-alfa';
                        
                        // Deduce state from Brazilian DDD
                        let state = '';
                        let city = 'Desconhecida';
                        if (phone.startsWith('55') && phone.length >= 4) {
                            const ddd = phone.substring(2, 4);
                            const dddMap: Record<string, string> = {
                                '68': 'AC', '82': 'AL', '92': 'AM', '97': 'AM', '96': 'AP', '71': 'BA', '73': 'BA', '74': 'BA', '75': 'BA', '77': 'BA',
                                '85': 'CE', '88': 'CE', '61': 'DF', '27': 'ES', '28': 'ES', '62': 'GO', '64': 'GO', '98': 'MA', '99': 'MA',
                                '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG', '35': 'MG', '37': 'MG', '38': 'MG', '67': 'MS', '65': 'MT', '66': 'MT',
                                '91': 'PA', '93': 'PA', '94': 'PA', '83': 'PB', '81': 'PE', '87': 'PE', '86': 'PI', '89': 'PI',
                                '41': 'PR', '42': 'PR', '43': 'PR', '44': 'PR', '45': 'PR', '46': 'PR', '21': 'RJ', '22': 'RJ', '24': 'RJ',
                                '84': 'RN', '69': 'RO', '95': 'RR', '51': 'RS', '53': 'RS', '54': 'RS', '55': 'RS', '47': 'SC', '48': 'SC', '49': 'SC',
                                '79': 'SE', '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP', '16': 'SP', '17': 'SP', '18': 'SP', '19': 'SP', '63': 'TO'
                            };
                            if (dddMap[ddd]) {
                                state = dddMap[ddd];
                                city = 'DDD ' + ddd;
                            }
                        }

                        // Create new lead automatically so they show up in the Chat Inbox
                        const newLead = {
                            id: `lead-${Date.now()}`,
                            company_id: assignedCompanyId,
                            name: msg.pushName || 'Novo Contato WhatsApp',
                            phone: phone,
                            source: 'whatsapp_direto',
                            utm_source: 'whatsapp_direto',
                            utm_medium: 'organico',
                            utm_campaign: 'whatsapp',
                            stage: 'Novo Lead',
                            link_id: null,
                            link_title: '',
                            device: 'WhatsApp',
                            browser: 'WhatsApp',
                            location: { city: city, state: state, country: 'BR' },
                            conversion_events: [],
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        };
                        const { error: insertErr } = await supabase.from('leads').insert(newLead);
                        if (insertErr) {
                            console.error('Falha ao criar lead automaticamente:', insertErr);
                        }
                    }

                    // Save to DB
                    await supabase.from('whatsapp_messages').insert({
                        id: msg.key.id || `msg-${Date.now()}`,
                        lead_phone: phone,
                        sender: isFromMe ? 'attendant' : 'lead',
                        text: textContent,
                        status: 'entregue',
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });

    } catch (error) {
        console.error('Failed to start WhatsApp socket:', error);
        state.status = 'disconnected';
        state.socket = null;
    }
};

export const logoutWhatsApp = async (): Promise<void> => {
    if (state.socket) {
        await state.socket.logout();
    }
    state.status = 'disconnected';
    state.socket = null;
    state.qrCodeBase64 = null;
    
    if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }
};

export const getWhatsAppStatus = () => {
    return {
        status: state.status,
        qrCodeBase64: state.qrCodeBase64
    };
};

export const sendWhatsAppMessage = async (phone: string, text: string): Promise<boolean> => {
    if (state.status !== 'connected' || !state.socket) {
        throw new Error('WhatsApp não está conectado');
    }

    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('55') && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
        cleanPhone = '55' + cleanPhone;
    }
    
    // Retrieve exact JID from cache if available, else fallback
    const jid = jidCache.get(cleanPhone) || `${cleanPhone}@s.whatsapp.net`;
    
    try {
        const result = await state.socket.sendMessage(jid, { text });
        
        // Save outgoing message to DB
        await supabase.from('whatsapp_messages').insert({
            id: result?.key.id || `msg-out-${Date.now()}`,
            lead_phone: cleanPhone,
            sender: 'attendant',
            text: text,
            status: 'entregue',
            timestamp: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('Erro ao enviar mensagem no WhatsApp:', error);
        return false;
    }
};
