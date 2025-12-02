/**
 * Gerenciador de Configuração
 * Carrega configurações do localStorage ou solicita ao usuário
 */

// Configurações padrão (sem credenciais)
const CONFIG_DEFAULT = {
    jsonbin: {
        binId: '',
        accessKey: '',
        baseUrl: 'https://api.jsonbin.io/v3/b'
    },
    cleanup: {
        hoursEncerrado: 3,
        hoursInativo: 24
    },
    escalonamento: {
        HFC: 10,
        GPON: 300
    },
    sms: {
        enabled: false,
        provider: 'twilio',
        autoSendOnHighImpact: true,
        twilio: {
            accountSid: '',
            authToken: '',
            phoneFrom: ''
        },
        recipients: [],
        template: {
            maxLength: 160,
            prefix: '🚨 COP REDE'
        }
    }
};

// Carregar configuração salva ou usar padrão
function loadConfig() {
    const saved = localStorage.getItem('app_config');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.error('Erro ao carregar configuração:', error);
            return CONFIG_DEFAULT;
        }
    }
    return CONFIG_DEFAULT;
}

// Salvar configuração
function saveConfig(config) {
    localStorage.setItem('app_config', JSON.stringify(config));
}

// Verificar se configuração está completa
function isConfigComplete(config) {
    return config.jsonbin.binId &&
           config.jsonbin.accessKey &&
           config.sms.twilio.accountSid &&
           config.sms.twilio.authToken &&
           config.sms.twilio.phoneFrom;
}

// Criar CONFIG global
let CONFIG = loadConfig();

// Mostrar modal de configuração se necessário
if (!isConfigComplete(CONFIG)) {
    document.addEventListener('DOMContentLoaded', function() {
        showConfigModal();
    });
}

// Mostrar modal de configuração
function showConfigModal() {
    const modal = document.createElement('div');
    modal.id = 'configModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h2 style="color: #1b5e20; margin-bottom: 20px;">⚙️ Configuração Inicial</h2>
            <p style="margin-bottom: 20px;">Configure as credenciais para usar o sistema:</p>

            <div style="margin-bottom: 20px;">
                <h3 style="color: #2e7d32; font-size: 18px; margin-bottom: 10px;">JSONBin.io</h3>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Bin ID:</label>
                <input type="text" id="cfg_binId" placeholder="690480d2ae596e708f39dcad" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; margin-bottom: 10px;">

                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Access Key:</label>
                <input type="text" id="cfg_accessKey" placeholder="$2a$10$..." style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px;">
            </div>

            <div style="margin-bottom: 20px;">
                <h3 style="color: #2e7d32; font-size: 18px; margin-bottom: 10px;">Twilio (SMS)</h3>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Account SID:</label>
                <input type="text" id="cfg_accountSid" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; margin-bottom: 10px;">

                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Auth Token:</label>
                <input type="password" id="cfg_authToken" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; margin-bottom: 10px;">

                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Número Twilio:</label>
                <input type="text" id="cfg_phoneFrom" placeholder="+1xxxxxxxxxx" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; margin-bottom: 10px;">

                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Número Destino (SMS):</label>
                <input type="text" id="cfg_recipient" placeholder="+55xxxxxxxxxxxx" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px;">
            </div>

            <div style="padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 20px;">
                <strong>ℹ️ Informação:</strong><br>
                Essas credenciais serão salvas <strong>apenas no seu navegador</strong> (localStorage).<br>
                Não serão enviadas para nenhum servidor externo.
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="skipConfig()" style="background: #6c757d; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer;">
                    Pular (usar sem SMS)
                </button>
                <button onclick="saveConfigFromModal()" style="background: #2e7d32; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer;">
                    ✅ Salvar Configuração
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Preencher com valores existentes se houver
    document.getElementById('cfg_binId').value = CONFIG.jsonbin.binId || '';
    document.getElementById('cfg_accessKey').value = CONFIG.jsonbin.accessKey || '';
    document.getElementById('cfg_accountSid').value = CONFIG.sms.twilio.accountSid || '';
    document.getElementById('cfg_authToken').value = CONFIG.sms.twilio.authToken || '';
    document.getElementById('cfg_phoneFrom').value = CONFIG.sms.twilio.phoneFrom || '';
    if (CONFIG.sms.recipients.length > 0) {
        document.getElementById('cfg_recipient').value = CONFIG.sms.recipients[0] || '';
    }
}

// Salvar configuração do modal
function saveConfigFromModal() {
    const binId = document.getElementById('cfg_binId').value.trim();
    const accessKey = document.getElementById('cfg_accessKey').value.trim();
    const accountSid = document.getElementById('cfg_accountSid').value.trim();
    const authToken = document.getElementById('cfg_authToken').value.trim();
    const phoneFrom = document.getElementById('cfg_phoneFrom').value.trim();
    const recipient = document.getElementById('cfg_recipient').value.trim();

    if (!binId || !accessKey) {
        alert('Por favor, preencha pelo menos as credenciais do JSONBin.io');
        return;
    }

    CONFIG.jsonbin.binId = binId;
    CONFIG.jsonbin.accessKey = accessKey;

    if (accountSid && authToken && phoneFrom) {
        CONFIG.sms.enabled = true;
        CONFIG.sms.twilio.accountSid = accountSid;
        CONFIG.sms.twilio.authToken = authToken;
        CONFIG.sms.twilio.phoneFrom = phoneFrom;

        if (recipient) {
            CONFIG.sms.recipients = [recipient];
        }
    }

    saveConfig(CONFIG);
    document.getElementById('configModal').remove();
    alert('✅ Configuração salva com sucesso!\n\nRecarregando a página...');
    window.location.reload();
}

// Pular configuração
function skipConfig() {
    if (confirm('Pular a configuração? O sistema funcionará parcialmente (sem SMS e sem sincronização).')) {
        CONFIG.sms.enabled = false;
        saveConfig(CONFIG);
        document.getElementById('configModal').remove();
    }
}

// Função para reabrir configuração
function openConfigModal() {
    showConfigModal();
}

// Exportar CONFIG
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
