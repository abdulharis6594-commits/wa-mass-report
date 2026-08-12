require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const TARGET_NUMBER = process.env.TARGET_NUMBER; // format: 628xxx@c.us
const REPORT_MESSAGE = process.env.REPORT_MESSAGE || 'Laporan otomatis';
const TOTAL_REPORTS = parseInt(process.env.TOTAL_REPORTS) || 200;
const DELAY_MS = parseInt(process.env.DELAY_MS) || 500; // delay antar report (ms)

if (!TARGET_NUMBER) {
  console.error('❌ Set TARGET_NUMBER di .env');
  process.exit(1);
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

let reportCount = 0;
let successCount = 0;
let failCount = 0;

client.on('qr', qr => {
  console.log('📱 Scan QR ini dengan WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('✅ WhatsApp siap! Memulai report massal...');
  await kirimReportMassal();
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Terputus:', reason);
  process.exit(1);
});

async function kirimReportMassal() {
  console.log(`🎯 Target: ${TARGET_NUMBER}`);
  console.log(`📨 Total report: ${TOTAL_REPORTS}`);
  console.log(`⏱️ Delay: ${DELAY_MS}ms\n`);

  const logFile = path.join(__dirname, 'reports', `log_${Date.now()}.txt`);
  if (!fs.existsSync(path.dirname(logFile))) fs.mkdirSync(path.dirname(logFile));

  for (let i = 1; i <= TOTAL_REPORTS; i++) {
    try {
      const chat = await client.getChatById(TARGET_NUMBER);
      await chat.sendMessage(`${REPORT_MESSAGE} #${i}`);
      successCount++;
      console.log(`✅ Report #${i} terkirim`);

      fs.appendFileSync(logFile, `SUCCESS #${i} - ${new Date().toISOString()}\n`);

      if (i < TOTAL_REPORTS) {
        await sleep(DELAY_MS);
      }
    } catch (err) {
      failCount++;
      console.log(`❌ Report #${i} gagal: ${err.message}`);
      fs.appendFileSync(logFile, `FAIL #${i} - ${err.message}\n`);

      if (err.message.includes('banned') || err.message.includes('blocked')) {
        console.log('🚫 Akun terdeteksi banned/blocked. Menghentikan.');
        break;
      }
    }
  }

  console.log(`\n📊 Selesai! Sukses: ${successCount}, Gagal: ${failCount}`);
  await client.destroy();
  process.exit(0);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.initialize();
