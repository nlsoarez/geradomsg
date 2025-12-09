/**
 * Serviço de notificação via Telegram
 */

class NotificationService {
    constructor() {
        this.config = CONFIG.notification;
        this.enabled = this.config.enabled;
    }

    /**
     * Verifica se o serviço de notificação está habilitado
     */
    isEnabled() {
        return this.enabled && this.config.telegram.botToken && this.config.telegram.chatId;
    }

    /**
     * Ativa ou desativa o envio de notificações
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('notification_enabled', enabled ? 'true' : 'false');
        console.log(`Notificação ${enabled ? 'ativada' : 'desativada'}`);
    }

    /**
     * Carrega estado do localStorage
     */
    loadState() {
        const savedState = localStorage.getItem('notification_enabled');
        if (savedState !== null) {
            this.enabled = savedState === 'true';
        }
    }

    /**
     * Constrói a mensagem baseada nos dados do incidente
     */
    buildMessage(tipo, dados) {
        const prefix = this.config.template.prefix;

        let outage = '';
        let cidade = '';
        let impacto = '';

        if (tipo === 'rompimento') {
            outage = dados.incidente || 'N/A';
            cidade = dados.cidade || 'N/A';
            impacto = dados.impacto || '0';
        } else if (tipo === 'manobra') {
            outage = dados.incidenteManobra || 'N/A';
            cidade = dados.cidadeManobra || 'N/A';
            impacto = dados.impactoManobra || '0';
        }

        // Construir mensagem formatada para Telegram (suporta Markdown)
        const message = `${prefix}

📋 *Outage:* ${outage}
📍 *Cidade:* ${cidade}
⚠️ *Impacto:* ${impacto}`;

        return message;
    }

    /**
     * Envia mensagem via Telegram Bot API
     */
    async sendViaTelegram(message) {
        const { botToken, chatId } = this.config.telegram;

        // Validar configurações
        if (!botToken || botToken.trim() === '') {
            throw new Error('Token do bot Telegram não configurado. Veja instruções em TELEGRAM_SETUP.md');
        }

        if (!chatId || chatId.trim() === '') {
            throw new Error('Chat ID não configurado. Veja instruções em TELEGRAM_SETUP.md');
        }

        // URL da API do Telegram
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        // Preparar dados
        const data = {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        };

        console.log('📱 Enviando notificação via Telegram...');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.description || 'Erro ao enviar mensagem no Telegram');
            }

            const result = await response.json();

            if (!result.ok) {
                throw new Error(result.description || 'Erro desconhecido');
            }

            console.log('✅ Mensagem enviada com sucesso!', result);

            return {
                success: true,
                message_id: result.result.message_id,
                chat_id: result.result.chat.id
            };
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem Telegram:', error);
            throw error;
        }
    }

    /**
     * Envia notificação
     */
    async sendNotification(tipo, dados) {
        if (!this.isEnabled()) {
            console.log('Notificação desabilitada ou não configurada');
            return {
                success: false,
                message: 'Notificação desabilitada ou não configurada'
            };
        }

        const message = this.buildMessage(tipo, dados);

        try {
            if (this.config.provider === 'telegram') {
                const result = await this.sendViaTelegram(message);
                this.updateStats(true);
                return {
                    success: true,
                    message: 'Mensagem enviada via Telegram',
                    result: result
                };
            } else {
                throw new Error(`Provedor ${this.config.provider} não implementado`);
            }
        } catch (error) {
            this.updateStats(false);
            console.error('Erro ao enviar notificação:', error);
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }

    /**
     * Testa o envio de notificação
     */
    async testNotification() {
        const testData = {
            incidente: 'INC-TEST-001',
            cidade: 'RIO DE JANEIRO - RJO',
            impacto: '50'
        };

        return await this.sendNotification('rompimento', testData);
    }

    /**
     * Obtém estatísticas de notificações
     */
    getStats() {
        const sent = parseInt(localStorage.getItem('notification_sent_count') || '0');
        const errors = parseInt(localStorage.getItem('notification_error_count') || '0');
        const lastSent = localStorage.getItem('notification_last_sent');

        return {
            sent,
            errors,
            lastSent: lastSent ? new Date(lastSent).toLocaleString() : 'Nunca'
        };
    }

    /**
     * Atualiza estatísticas após envio
     */
    updateStats(success) {
        if (success) {
            const sent = parseInt(localStorage.getItem('notification_sent_count') || '0');
            localStorage.setItem('notification_sent_count', (sent + 1).toString());
            localStorage.setItem('notification_last_sent', new Date().toISOString());
        } else {
            const errors = parseInt(localStorage.getItem('notification_error_count') || '0');
            localStorage.setItem('notification_error_count', (errors + 1).toString());
        }
    }
}

// Instanciar serviço (mantém nome 'smsService' para compatibilidade)
const smsService = new NotificationService();

// Carregar estado salvo
document.addEventListener('DOMContentLoaded', function() {
    smsService.loadState();
});

// Exportar serviço
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationService;
}
