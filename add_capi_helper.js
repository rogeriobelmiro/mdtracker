const fs = require('fs');

const path = 'server.ts';
let code = fs.readFileSync(path, 'utf8');

const helper = `
// ---- CAPI HELPER ----
const crypto = require('crypto');
async function sendMetaCAPIEvent(eventName, leadData, settings, reqIp, reqUserAgent) {
    if (!settings.globalMetaPixelId || !settings.globalMetaToken) return;

    let hashedPhone;
    if (leadData.phone) {
      let ph = leadData.phone.replace(/\\D/g, '');
      if (ph.startsWith('55') && ph.length === 12) {
         // Add the missing 9 for mobile phones in BR if needed, or leave as is
      }
      hashedPhone = crypto.createHash('sha256').update(ph).digest('hex');
    }
    const hashedEmail = leadData.email ? crypto.createHash('sha256').update(leadData.email.trim().toLowerCase()).digest('hex') : undefined;

    const payload = {
        data: [
            {
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'system_generated',
                user_data: {
                    client_ip_address: reqIp || '192.168.0.1',
                    client_user_agent: reqUserAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    em: hashedEmail ? [hashedEmail] : undefined,
                    ph: hashedPhone ? [hashedPhone] : undefined,
                },
                custom_data: {
                   value: leadData.value || undefined,
                   currency: leadData.value ? 'BRL' : undefined
                }
            }
        ]
    };

    // Clean undefined
    if (!payload.data[0].user_data.em) delete payload.data[0].user_data.em;
    if (!payload.data[0].user_data.ph) delete payload.data[0].user_data.ph;
    if (!payload.data[0].custom_data.value) delete payload.data[0].custom_data;

    try {
        const resp = await fetch(\`https://graph.facebook.com/v19.0/\${settings.globalMetaPixelId}/events?access_token=\${settings.globalMetaToken}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const respData = await resp.json();
        console.log("CAPI Event Sent:", eventName, respData);
    } catch(e) {
        console.error("Meta CAPI Error:", e);
    }
}
// ---------------------
`;

// Insert after mapLeadToDB definition (around line 240)
code = code.replace(/(function mapLeadToDB[\s\S]*?})/m, '$1\n' + helper);
fs.writeFileSync(path, code);
