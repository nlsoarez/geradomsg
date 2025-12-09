/**
 * Configuração da aplicação
 * Este arquivo deve estar presente para a aplicação funcionar
 */

// Configuração padrão (será sobrescrita se config.js existir)
window.CONFIG = window.CONFIG || {
    // Configuração do JSONBin.io
    jsonbin: {
        binId: '690480d2ae596e708f39dcad',
        accessKey: '$2a$10$iCHPT/M2gqtqeGsBZ/AdCeE.Y/yihLCb5IKZbACZrafL8/.fIuRAW',
        baseUrl: 'https://api.jsonbin.io/v3/b'
    },

    // Configurações de limpeza automática
    cleanup: {
        hoursEncerrado: 3,
        hoursInativo: 24
    },

    // Limites de escalonamento
    escalonamento: {
        HFC: 10,
        GPON: 300
    },

    // Configurações de notificação automática via Telegram
    notification: {
        enabled: true,
        provider: 'telegram',
        autoSendOnHighImpact: true,

        telegram: {
            botToken: '8266961280:AAEqEiuefaJy9UzGNuXYJm1ClIsqrVk-Y2k',
            chatId: '1834260126'
        },

        template: {
            prefix: '🚨 COP REDE'
        }
    }
};

// Tornar CONFIG acessível globalmente para todos os scripts
var CONFIG = window.CONFIG;

// Log de carregamento
console.log('✅ Configuração carregada com sucesso!');
console.log('📱 Notificação Telegram:', CONFIG.notification.enabled ? 'ATIVA' : 'INATIVA');
if (CONFIG.notification.telegram.chatId) {
    console.log('💬 Chat ID configurado:', CONFIG.notification.telegram.chatId);
} else {
    console.warn('⚠️ Configure o bot do Telegram em js/config-inline.js');
}
