/**
 * Serviço de envio de SMS
 */

class SMSService {
    constructor() {
        this.config = CONFIG.sms;
        this.enabled = this.config.enabled;
    }

    /**
     * Verifica se o serviço de SMS está habilitado
     */
    isEnabled() {
        return this.enabled && this.config.recipients.length > 0;
    }

    /**
     * Ativa ou desativa o envio de SMS
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('sms_enabled', enabled ? 'true' : 'false');
        console.log(`SMS ${enabled ? 'ativado' : 'desativado'}`);
    }

    /**
     * Carrega estado do SMS do localStorage
     */
    loadState() {
        const savedState = localStorage.getItem('sms_enabled');
        if (savedState !== null) {
            this.enabled = savedState === 'true';
        }
    }

    /**
     * Adiciona um número de telefone à lista
     */
    addRecipient(phoneNumber) {
        const formatted = this.formatPhoneNumber(phoneNumber);
        if (!formatted) {
            throw new Error('Número de telefone inválido');
        }

        if (!this.config.recipients.includes(formatted)) {
            this.config.recipients.push(formatted);
            this.saveRecipients();
            return true;
        }
        return false;
    }

    /**
     * Remove um número de telefone da lista
     */
    removeRecipient(phoneNumber) {
        const index = this.config.recipients.indexOf(phoneNumber);
        if (index > -1) {
            this.config.recipients.splice(index, 1);
            this.saveRecipients();
            return true;
        }
        return false;
    }

    /**
     * Salva números no localStorage
     */
    saveRecipients() {
        localStorage.setItem('sms_recipients', JSON.stringify(this.config.recipients));
    }

    /**
     * Carrega números do localStorage
     */
    loadRecipients() {
        const saved = localStorage.getItem('sms_recipients');
        if (saved) {
            try {
                this.config.recipients = JSON.parse(saved);
            } catch (error) {
                console.error('Erro ao carregar números:', error);
            }
        }
    }

    /**
     * Formata número de telefone para padrão internacional
     */
    formatPhoneNumber(phone) {
        // Remove caracteres não numéricos
        let cleaned = phone.replace(/\D/g, '');

        // Se começa com 0, remove
        if (cleaned.startsWith('0')) {
            cleaned = cleaned.substring(1);
        }

        // Se não tem código do país, adiciona +55 (Brasil)
        if (!cleaned.startsWith('55') && cleaned.length <= 11) {
            cleaned = '55' + cleaned;
        }

        // Valida comprimento (país + DDD + número)
        if (cleaned.length >= 12 && cleaned.length <= 13) {
            return '+' + cleaned;
        }

        return null;
    }

    /**
     * Constrói a mensagem SMS baseada nos dados do incidente
     */
    buildSMSMessage(tipo, dados) {
        const prefix = this.config.template.prefix;
        const maxLength = this.config.template.maxLength;

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

        // Construir mensagem
        let message = `${prefix}\nOutage: ${outage}\nCidade: ${cidade}\nImpacto: ${impacto}`;

        // Truncar se necessário
        if (message.length > maxLength) {
            message = message.substring(0, maxLength - 3) + '...';
        }

        return message;
    }

    /**
     * Envia SMS via Twilio
     */
    async sendViaTwilio(phoneNumber, message) {
        const { accountSid, authToken, phoneFrom } = this.config.twilio;

        // Validar credenciais
        if (!accountSid || accountSid === 'SEU_ACCOUNT_SID_AQUI') {
            throw new Error('Credenciais do Twilio não configuradas');
        }

        // URL da API Twilio
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        // Preparar dados
        const data = new URLSearchParams({
            To: phoneNumber,
            From: phoneFrom,
            Body: message
        });

        // Headers com autenticação Basic
        const credentials = btoa(`${accountSid}:${authToken}`);
        const headers = {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: data.toString()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao enviar SMS');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erro Twilio:', error);
            throw error;
        }
    }

    /**
     * Envia SMS para todos os destinatários configurados
     */
    async sendSMS(tipo, dados) {
        if (!this.isEnabled()) {
            console.log('SMS desabilitado ou sem destinatários configurados');
            return {
                success: false,
                message: 'SMS desabilitado',
                results: []
            };
        }

        const message = this.buildSMSMessage(tipo, dados);
        const results = [];
        let successCount = 0;
        let errorCount = 0;

        console.log('Enviando SMS:', message);

        for (const recipient of this.config.recipients) {
            try {
                if (this.config.provider === 'twilio') {
                    const result = await this.sendViaTwilio(recipient, message);
                    results.push({
                        recipient,
                        success: true,
                        sid: result.sid
                    });
                    successCount++;
                } else {
                    throw new Error(`Provedor ${this.config.provider} não implementado`);
                }
            } catch (error) {
                results.push({
                    recipient,
                    success: false,
                    error: error.message
                });
                errorCount++;
                console.error(`Erro ao enviar SMS para ${recipient}:`, error);
            }
        }

        return {
            success: successCount > 0,
            message: `${successCount} enviado(s), ${errorCount} erro(s)`,
            successCount,
            errorCount,
            results
        };
    }

    /**
     * Testa o envio de SMS (modo de teste)
     */
    async testSMS() {
        const testData = {
            incidente: 'INC-TEST-001',
            cidade: 'RIO DE JANEIRO - RJO',
            impacto: '50'
        };

        return await this.sendSMS('rompimento', testData);
    }

    /**
     * Obtém estatísticas de SMS
     */
    getStats() {
        const sent = parseInt(localStorage.getItem('sms_sent_count') || '0');
        const errors = parseInt(localStorage.getItem('sms_error_count') || '0');
        const lastSent = localStorage.getItem('sms_last_sent');

        return {
            sent,
            errors,
            lastSent: lastSent ? new Date(lastSent).toLocaleString() : 'Nunca',
            recipients: this.config.recipients.length
        };
    }

    /**
     * Atualiza estatísticas após envio
     */
    updateStats(result) {
        if (result.success) {
            const sent = parseInt(localStorage.getItem('sms_sent_count') || '0');
            localStorage.setItem('sms_sent_count', (sent + result.successCount).toString());
            localStorage.setItem('sms_last_sent', new Date().toISOString());
        }

        if (result.errorCount > 0) {
            const errors = parseInt(localStorage.getItem('sms_error_count') || '0');
            localStorage.setItem('sms_error_count', (errors + result.errorCount).toString());
        }
    }
}

// Instanciar serviço
const smsService = new SMSService();

// Carregar estado salvo
document.addEventListener('DOMContentLoaded', function() {
    smsService.loadState();
    smsService.loadRecipients();
});

// Exportar serviço
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SMSService;
}
