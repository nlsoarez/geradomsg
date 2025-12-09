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
            // IMPORTANTE: Configure seu bot do Telegram
            // 1. Abra o Telegram e procure por @BotFather
            // 2. Digite /newbot e siga as instruções
            // 3. Copie o token que ele fornece e cole abaixo
            // 4. Inicie uma conversa com seu bot
            // 5. Acesse: https://api.telegram.org/bot<SEU_TOKEN>/getUpdates
            // 6. Procure por "chat":{"id": e copie o número (seu chat_id)
            botToken: '',  // Cole aqui o token do bot (ex: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz')
            chatId: ''     // Cole aqui seu chat ID (ex: '123456789')
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
