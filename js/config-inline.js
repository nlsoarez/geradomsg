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

    // Configurações de SMS (Twilio)
    sms: {
        enabled: true,
        provider: 'twilio',
        autoSendOnHighImpact: true,

        twilio: {
            accountSid: 'ACc4b98b578b3d2825c7819a0e2c97f1a3',
            authToken: '84925fad0ea3419800714418b4b39f23',
            phoneFrom: '+13417585645',
            // IMPORTANTE: Adicione aqui a URL da sua Twilio Function para contornar CORS
            // Exemplo: 'https://sms-sender-1234-dev.twil.io/send-sms'
            // Veja instruções em TWILIO_SETUP.md
            functionUrl: ''
        },

        recipients: [
            '+5521991212107'
        ],

        template: {
            maxLength: 160,
            prefix: '🚨 COP REDE'
        }
    }
};

// Tornar CONFIG acessível globalmente para todos os scripts
var CONFIG = window.CONFIG;

// Log de carregamento
console.log('✅ Configuração carregada com sucesso!');
console.log('📱 SMS automático:', CONFIG.sms.enabled ? 'ATIVO' : 'INATIVO');
console.log('📞 Destinatário:', CONFIG.sms.recipients[0]);
