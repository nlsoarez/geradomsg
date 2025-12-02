/**
 * Interface do usuário para SMS
 */

// ===== FUNÇÕES DE UI SMS =====

/**
 * Ativa/desativa o envio de SMS
 */
function toggleSMS() {
    const checkbox = document.getElementById('smsEnabled');
    const config = document.getElementById('smsConfig');

    smsService.setEnabled(checkbox.checked);

    if (checkbox.checked) {
        config.classList.remove('hidden');
        updateSMSStats();
        updateRecipientsList();
    } else {
        config.classList.add('hidden');
    }
}

/**
 * Adiciona um número de telefone
 */
function addPhoneNumber() {
    const input = document.getElementById('smsPhone');
    const phone = input.value.trim();

    if (!phone) {
        alert('Digite um número de telefone');
        return;
    }

    try {
        const added = smsService.addRecipient(phone);
        if (added) {
            alert('✅ Número adicionado com sucesso!');
            input.value = '';
            updateRecipientsList();
        } else {
            alert('⚠️ Este número já está cadastrado');
        }
    } catch (error) {
        alert('❌ ' + error.message);
    }
}

/**
 * Remove um número de telefone
 */
function removePhoneNumber(phone) {
    if (confirm(`Deseja remover o número ${phone}?`)) {
        smsService.removeRecipient(phone);
        updateRecipientsList();
        alert('✅ Número removido');
    }
}

/**
 * Atualiza a lista de números cadastrados
 */
function updateRecipientsList() {
    const list = document.getElementById('smsRecipientsList');
    const recipients = smsService.config.recipients;

    if (recipients.length === 0) {
        list.innerHTML = '<div class="no-incidents">Nenhum número cadastrado</div>';
        return;
    }

    list.innerHTML = '';
    recipients.forEach(phone => {
        const item = document.createElement('div');
        item.className = 'incident-item';
        item.innerHTML = `
            <div>
                <div class="incident-id">
                    <i class="fas fa-phone"></i> ${phone}
                </div>
            </div>
            <button class="delete-incident" onclick="removePhoneNumber('${phone}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(item);
    });
}

/**
 * Atualiza as estatísticas de SMS
 */
function updateSMSStats() {
    const stats = smsService.getStats();
    const statsElement = document.getElementById('smsStats');

    statsElement.textContent = `${stats.sent} enviados, ${stats.errors} erros`;
    if (stats.lastSent !== 'Nunca') {
        statsElement.textContent += ` (último: ${stats.lastSent})`;
    }
}

/**
 * Testa o envio de SMS
 */
async function testSMS() {
    if (!smsService.isEnabled()) {
        alert('⚠️ Ative o SMS e adicione pelo menos um número primeiro');
        return;
    }

    const btn = event.target.closest('button');
    const originalHTML = btn.innerHTML;

    try {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;

        const result = await smsService.testSMS();
        smsService.updateStats(result);
        updateSMSStats();

        if (result.success) {
            alert(`✅ SMS de teste enviado!\n\n${result.message}\n\nVerifique os telefones cadastrados.`);
        } else {
            alert(`❌ Erro ao enviar SMS:\n\n${result.message}\n\nVerifique as configurações no arquivo js/config.js`);
        }
    } catch (error) {
        alert(`❌ Erro ao enviar SMS:\n\n${error.message}\n\nVerifique as credenciais do Twilio em js/config.js`);
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

/**
 * Mostra informações de configuração
 */
function showSMSConfig() {
    const info = `
📱 CONFIGURAÇÃO DO SMS

Para ativar o envio automático de SMS:

1️⃣ Crie uma conta no Twilio:
   • Acesse: https://www.twilio.com/try-twilio
   • Cadastre-se gratuitamente (você ganha US$ 15 de créditos)

2️⃣ Obtenha suas credenciais:
   • Account SID
   • Auth Token
   • Número de telefone Twilio

3️⃣ Configure no arquivo js/config.js:
   • Abra o arquivo js/config.js
   • Localize a seção "sms > twilio"
   • Cole suas credenciais
   • Salve o arquivo

4️⃣ Adicione números de telefone:
   • Clique em "Adicionar" acima
   • Digite o número no formato: +55 11 99999-9999
   • Pode adicionar vários números

5️⃣ Teste o envio:
   • Clique em "Testar SMS"
   • Verifique se recebeu a mensagem

⚠️ IMPORTANTE:
• Conta gratuita do Twilio tem limitações
• Números só podem receber SMS se verificados
• Para produção, requer conta paga

💰 CUSTOS (aproximados):
• SMS no Brasil: ~US$ 0.085 por mensagem
• Número Twilio: ~US$ 1.15/mês

📚 Documentação:
• Twilio: https://www.twilio.com/docs
• Preços: https://www.twilio.com/sms/pricing/br
    `;

    alert(info);
}

/**
 * Envia SMS ao gerar mensagem (integração)
 */
async function sendSMSNotification(tipo, dados) {
    if (!smsService.isEnabled()) {
        return null;
    }

    try {
        const result = await smsService.sendSMS(tipo, dados);
        smsService.updateStats(result);
        updateSMSStats();
        return result;
    } catch (error) {
        console.error('Erro ao enviar SMS:', error);
        return null;
    }
}

/**
 * Mostra feedback do SMS na UI
 */
function showSMSFeedback(result) {
    if (!result) return;

    const outputContainer = document.getElementById('outputContainer');

    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        margin-top: 15px;
        padding: 12px;
        border-radius: 6px;
        font-size: 14px;
        border-left: 4px solid;
    `;

    if (result.success) {
        feedback.style.backgroundColor = '#d4edda';
        feedback.style.borderColor = '#28a745';
        feedback.style.color = '#155724';
        feedback.innerHTML = `
            <strong><i class="fas fa-check-circle"></i> SMS enviado com sucesso!</strong><br>
            ${result.successCount} mensagem(ns) enviada(s)
        `;
    } else {
        feedback.style.backgroundColor = '#f8d7da';
        feedback.style.borderColor = '#dc3545';
        feedback.style.color = '#721c24';
        feedback.innerHTML = `
            <strong><i class="fas fa-exclamation-circle"></i> Erro ao enviar SMS</strong><br>
            ${result.message}
        `;
    }

    // Remover feedback anterior se existir
    const oldFeedback = outputContainer.querySelector('.sms-feedback');
    if (oldFeedback) {
        oldFeedback.remove();
    }

    feedback.className = 'sms-feedback';
    outputContainer.appendChild(feedback);

    // Remover após 10 segundos
    setTimeout(() => {
        feedback.style.transition = 'opacity 0.5s';
        feedback.style.opacity = '0';
        setTimeout(() => feedback.remove(), 500);
    }, 10000);
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    // Carregar estado do checkbox
    const checkbox = document.getElementById('smsEnabled');
    checkbox.checked = smsService.enabled;

    if (smsService.enabled) {
        document.getElementById('smsConfig').classList.remove('hidden');
        updateRecipientsList();
        updateSMSStats();
    }

    // Atualizar estatísticas a cada minuto
    setInterval(updateSMSStats, 60000);
});
