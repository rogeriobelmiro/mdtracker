import { getWhatsAppStatus } from './dist/services/whatsappService.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log("Calling getWhatsAppStatus...");
  const res = await getWhatsAppStatus('comp-alfa');
  console.log("Result:", res);
}
test();
