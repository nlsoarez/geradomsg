/**
 * Funções de geração de mensagens
 */

// ===== GERAÇÃO DE MENSAGENS - ROMPIMENTO =====

async function gerarMensagem() {
    const topologia = document.getElementById('topologia').value;
    if (!topologia) {
        alert('Por favor, selecione o tipo de topologia');
        return;
    }

    const tipoStatus = document.getElementById('status').value;
    if (!tipoStatus) {
        alert('Por favor, selecione o tipo de status');
        return;
    }

    const tipoImpactoElement = document.querySelector('input[name="tipoImpacto"]:checked');
    if (!tipoImpactoElement) {
        alert('Por favor, selecione se o incidente tem impacto ou não');
        return;
    }

    const impactoValor = document.getElementById('impacto').value;
    Validators.verificarEscalonamento(topologia, impactoValor, tipoStatus);

    // Validar campos de data/hora
    const camposDataHora = ['abertura', 'previsao', 'acionamento'];
    if (tipoStatus === 'encerramento') {
        camposDataHora.push('encerramento');
    }

    if (!Validators.validarCamposDataHora(camposDataHora)) {
        alert('Por favor, corrija os campos de data/hora no formato dd/mm/aaaa hh:mm');
        return;
    }

    const get = id => document.getElementById(id)?.value.toUpperCase() || '';
    const tipoImpactoTexto = tipoImpactoElement.value === 'com' ? 'COM IMPACTO' : 'SEM IMPACTO';
    const alertaImpacto = Validators.verificarAlertaImpacto(topologia, impactoValor);

    let msg = `## COP REDE INFORMA: INCIDENTE ${tipoImpactoTexto}
## ROMPIMENTO DE FIBRA RESIDENCIAL\n`;
    msg += `## TOPOLOGIA: ${get('topologia')}\n`;
    msg += `## INCIDENTE: ${get('incidente')}\n`;
    msg += `## CIDADE/CLUSTER: ${get('cidade')}\n`;
    msg += `## ÁREA/DISTRITO: ${get('distrito')}\n`;
    msg += `## IMPACTO: ${get('impacto')}${alertaImpacto}\n`;
    msg += `## BASE AFETADA: ${get('base')}\n`;

    const recValue = parseInt(get('rec'));
    const ralValue = parseInt(get('ral'));
    if (!isNaN(recValue) && recValue >= 1) {
        msg += `## REC: ${recValue}\n`;
    }
    if (!isNaN(ralValue) && ralValue >= 1) {
        msg += `## RAL: ${ralValue}\n`;
    }

    msg += `## DATA E HORA DE ABERTURA: ${get('abertura')}\n`;
    msg += `## PREVISÃO DO OUTAGE: ${get('previsao')}\n`;
    msg += `## DATA E HORA DE ACIONAMENTO: ${get('acionamento') || 'AGUARDANDO DISPONIBILIDADE TÉCNICA'}\n`;
    msg += `## TIPO DE STATUS: ${document.getElementById('status').options[document.getElementById('status').selectedIndex].text.toUpperCase()}\n`;

    if (tipoStatus === 'inicial') {
        msg += gerarConteudoStatusInicial();
    } else if (tipoStatus === 'atualizacao') {
        msg += gerarConteudoStatusAtualizacao();
    } else if (tipoStatus === 'encerramento') {
        msg += gerarConteudoStatusEncerramento();
    }

    document.getElementById('output').textContent = msg;
    document.getElementById('outputContainer').classList.remove('hidden');

    // ENVIO DE SMS (automático se impacto alto OU se habilitado manualmente)
    const dadosSMS = coletarDadosFormulario('rompimento');
    const shouldAutoSend = verificarEnvioAutomaticoSMS(topologia, impactoValor);

    if (shouldAutoSend || smsService.isEnabled()) {
        const resultSMS = await sendSMSNotification('rompimento', dadosSMS);
        if (resultSMS) {
            showSMSFeedback(resultSMS);
        }
    }

    // SALVAMENTO AUTOMÁTICO (exceto no status inicial)
    await salvarAutomaticamente('rompimento', tipoStatus);
}

function gerarConteudoStatusInicial() {
    const acionado = document.querySelector('input[name="acionado"]:checked');
    const scan = document.querySelector('input[name="scan"]:checked');
    const equipe = document.querySelector('input[name="equipe"]:checked');

    let statusInfo = [];

    if (acionado && acionado.value === 'sim') {
        statusInfo.push('EQUIPE FO ACIONADA');
    }

    const escalonamentos = [];
    if (document.getElementById('esc_ponto_focal')?.checked) {
        const nome = document.getElementById('esc_ponto_focal_nome')?.value.toUpperCase() || '';
        escalonamentos.push(nome ? `PONTO FOCAL ${nome}` : 'PONTO FOCAL');
    }
    if (document.getElementById('esc_supervisor')?.checked) {
        const nome = document.getElementById('esc_supervisor_nome')?.value.toUpperCase() || '';
        escalonamentos.push(nome ? `SUPERVISOR ${nome}` : 'SUPERVISOR');
    }
    if (document.getElementById('esc_coordenador')?.checked) {
        const nome = document.getElementById('esc_coordenador_nome')?.value.toUpperCase() || '';
        escalonamentos.push(nome ? `COORDENADOR ${nome}` : 'COORDENADOR');
    }
    if (document.getElementById('esc_gerente')?.checked) {
        const nome = document.getElementById('esc_gerente_nome')?.value.toUpperCase() || '';
        escalonamentos.push(nome ? `GERENTE ${nome}` : 'GERENTE');
    }

    if (escalonamentos.length > 0) {
        statusInfo.push(`ESCALONADO: ${escalonamentos.join(', ')}`);
    }

    if (scan && scan.value === 'sim') {
        const metragem = document.getElementById('metragemScan')?.value.toUpperCase() || '';
        statusInfo.push(`EFETUADO SCAN: ${metragem}`);
    }

    if (equipe && equipe.value === 'sim') {
        const motivo = document.getElementById('motivoEquipe')?.value || '';
        statusInfo.push(`INCIDENTE AOS CUIDADOS DA EQUIPE DA MANHÃ. MOTIVO: ${motivo}`);
    }

    if (statusInfo.length > 0) {
        return statusInfo.join('. ') + '.\n';
    }

    return '';
}

function gerarConteudoStatusAtualizacao() {
    const percorrendo = document.querySelector('input[name="percorrendo"]:checked');
    const avaliando = document.querySelector('input[name="avaliando"]:checked');
    const endereco = document.getElementById('enderecoDano')?.value.toUpperCase() || '';
    const causa = document.getElementById('causaDano')?.value.toUpperCase() || '';
    const cabos = document.getElementById('cabosAfetados')?.value.toUpperCase() || '';
    const percentual = document.getElementById('validado')?.value || '';

    let statusInfo = [];

    if (endereco && causa && cabos) {
        statusInfo.push(`LOCALIZADO DANO EM ${endereco}, OCASIONADO POR ${causa}, AFETANDO CABOS DE ${cabos}`);
    }

    if (percorrendo && percorrendo.value === 'sim') {
        statusInfo.push('EQUIPE SEGUE PERCORRENDO ROTA');
    }

    if (avaliando && avaliando.value === 'sim') {
        statusInfo.push('EQUIPE SEGUE AVALIANDO INFRAESTRUTURA NO LOCAL');
    }

    if (percentual && parseInt(percentual) > 0) {
        statusInfo.push(`PERCENTUAL DE NODES NORMALIZADOS: ${percentual}%`);
    }

    if (statusInfo.length > 0) {
        return statusInfo.join('. ') + '.\n';
    }

    return '';
}

function gerarConteudoStatusEncerramento() {
    const encerramento = document.getElementById('encerramento')?.value.toUpperCase() || '';
    const fato = document.getElementById('fato')?.value.toUpperCase() || '';
    const causa = document.getElementById('causa')?.value.toUpperCase() || '';
    const acao = document.getElementById('acao')?.value.toUpperCase() || '';

    let msg = `## DATA E HORA DE ENCERRAMENTO: ${encerramento}\n`;
    msg += `FATO: ${fato}. CAUSA: ${causa}. AÇÃO: ${acao}.\n`;
    msg += `\n✅ SITUAÇÃO NORMALIZADA - SERVIÇO CONCLUÍDO COM SUCESSO`;

    return msg;
}

// ===== GERAÇÃO DE MENSAGENS - MANOBRA =====

async function gerarMensagemManobra() {
    const topologiaManobra = document.getElementById('topologiaManobra').value;
    if (!topologiaManobra) {
        alert('Por favor, selecione o tipo de topologia');
        return;
    }

    const tipoStatus = document.getElementById('statusManobra').value;
    if (!tipoStatus) {
        alert('Por favor, selecione o tipo de status');
        return;
    }

    const tipoImpactoElement = document.querySelector('input[name="tipoImpactoManobra"]:checked');
    if (!tipoImpactoElement) {
        alert('Por favor, selecione se o incidente tem impacto ou não');
        return;
    }

    // Validar campos de data/hora
    const camposDataHora = [];
    if (tipoStatus === 'encerramento') {
        camposDataHora.push('encerramentoManobra');
    }

    if (!Validators.validarCamposDataHora(camposDataHora)) {
        alert('Por favor, corrija os campos de data/hora no formato dd/mm/aaaa hh:mm');
        return;
    }

    const get = id => document.getElementById(id)?.value.toUpperCase() || '';
    const tipoImpactoTexto = tipoImpactoElement.value === 'com' ? 'COM IMPACTO' : 'SEM IMPACTO';
    const impactoManobraValor = document.getElementById('impactoManobra').value;
    const alertaImpactoManobra = Validators.verificarAlertaImpacto(topologiaManobra, impactoManobraValor);

    let msg = `## COP REDE INFORMA: INCIDENTE ${tipoImpactoTexto}
## MANOBRA DE FIBRA RESIDENCIAL\n`;
    msg += `## TOPOLOGIA: ${get('topologiaManobra')}\n`;
    msg += `## TICKET DA MANOBRA: ${get('ticketManobra')}\n`;
    msg += `## INCIDENTE: ${get('incidenteManobra')}\n`;
    msg += `## CIDADE/CLUSTER: ${get('cidadeManobra')}\n`;
    msg += `## ÁREA/DISTRITO: ${get('distritoManobra')}\n`;
    msg += `## IMPACTO: ${get('impactoManobra')}${alertaImpactoManobra}\n`;
    msg += `## BASE AFETADA: ${get('baseManobra')}\n`;
    msg += `## RESPONSÁVEL: ${get('responsavelManobra')}\n`;
    msg += `## EXECUTOR: ${get('executorManobra')}\n`;
    msg += `## ENDEREÇO: ${get('enderecoManobra')}\n`;
    msg += `## PROPOSTO: ${get('propostoManobra')}\n`;
    msg += `## TIPO DE STATUS: ${document.getElementById('statusManobra').options[document.getElementById('statusManobra').selectedIndex].text.toUpperCase()}\n`;

    if (tipoStatus === 'inicial') {
        const manobraIniciada = document.querySelector('input[name="manobra_iniciada"]:checked');

        if (manobraIniciada && manobraIniciada.value === 'sim') {
            msg += `MANOBRA INICIADA.\n`;
        }
    } else if (tipoStatus === 'atualizacao') {
        const percentual = get('validadoManobra');
        const atualizacao = get('atualizacaoManobra');

        if (percentual && parseInt(percentual) > 0) {
            msg += `PERCENTUAL DE NODES NORMALIZADOS: ${percentual}%\n`;
        }

        if (atualizacao) {
            msg += `${atualizacao}\n`;
        }
    } else if (tipoStatus === 'encerramento') {
        msg += `## DATA E HORA DE ENCERRAMENTO: ${get('encerramentoManobra')}\n`;
        msg += `FATO: ${get('fatoManobra')}\n`;
        msg += `CAUSA: ${get('causaManobra')}\n`;
        msg += `AÇÃO: ${get('acaoManobra')}\n`;
        msg += `\n✅ SITUAÇÃO NORMALIZADA - SERVIÇO CONCLUÍDO COM SUCESSO`;
    }

    document.getElementById('output').textContent = msg;
    document.getElementById('outputContainer').classList.remove('hidden');

    // ENVIO DE SMS (automático se impacto alto OU se habilitado manualmente)
    const dadosSMS = coletarDadosFormulario('manobra');
    const shouldAutoSend = verificarEnvioAutomaticoSMS(topologiaManobra, impactoManobraValor);

    if (shouldAutoSend || smsService.isEnabled()) {
        const resultSMS = await sendSMSNotification('manobra', dadosSMS);
        if (resultSMS) {
            showSMSFeedback(resultSMS);
        }
    }

    // SALVAMENTO AUTOMÁTICO (exceto no status inicial)
    await salvarAutomaticamente('manobra', tipoStatus);
}

// ===== VERIFICAÇÃO DE ENVIO AUTOMÁTICO =====

/**
 * Verifica se deve enviar SMS automaticamente baseado no impacto
 */
function verificarEnvioAutomaticoSMS(topologia, impacto) {
    // Se configuração autoSendOnHighImpact não estiver ativa, retorna false
    if (!CONFIG.notification.autoSendOnHighImpact) {
        return false;
    }

    const numero = parseInt(impacto);
    if (isNaN(numero)) {
        return false;
    }

    const limites = CONFIG.escalonamento;

    // Verifica se atinge os limites de escalonamento
    if (topologia === 'HFC' && numero >= limites.HFC) {
        console.log(`🚨 Envio automático de SMS: Impacto HFC (${numero}) ≥ ${limites.HFC}`);
        return true;
    } else if (topologia === 'GPON' && numero >= limites.GPON) {
        console.log(`🚨 Envio automático de SMS: Impacto GPON (${numero}) ≥ ${limites.GPON}`);
        return true;
    }

    return false;
}

// ===== SALVAMENTO AUTOMÁTICO =====

async function salvarAutomaticamente(tipo, tipoStatus) {
    // Só salvar automaticamente em atualização ou encerramento
    if (tipoStatus === 'inicial') return;

    const incidenteId = document.getElementById('incidenteId').value.trim();
    if (!incidenteId) return;

    const dados = coletarDadosFormulario(tipo);
    dados.statusEncerrado = (tipoStatus === 'encerramento');

    try {
        const todosIncidentes = await jsonBinService.buscarTodosIncidentes();
        const incidenteExistente = todosIncidentes.find(inc => inc.incidente_id === incidenteId);

        if (incidenteExistente) {
            incidenteExistente.dados = dados;
            incidenteExistente.data_atualizacao = new Date().toISOString();
            incidenteExistente.ultimoStatus = tipoStatus;

            await jsonBinService.salvarTodosIncidentes(todosIncidentes);
            console.log(`✅ Incidente ${incidenteId} salvo automaticamente (${tipoStatus})`);
        }
    } catch (error) {
        console.error('Erro ao salvar automaticamente:', error);
    }
}

// ===== FUNÇÕES DE OUTPUT =====

/**
 * Copia a mensagem gerada usando a API moderna do Clipboard
 */
async function copiarMensagem() {
    const output = document.getElementById('output');
    const texto = output.textContent;

    try {
        // Usar a API moderna do Clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(texto);
            mostrarFeedbackCopia(true);
        } else {
            // Fallback para navegadores antigos
            copiarMensagemFallback(texto);
        }
    } catch (error) {
        console.error('Erro ao copiar:', error);
        copiarMensagemFallback(texto);
    }
}

/**
 * Fallback para copiar usando o método antigo (para compatibilidade)
 */
function copiarMensagemFallback(texto) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        mostrarFeedbackCopia(true);
    } catch (error) {
        console.error('Erro ao copiar (fallback):', error);
        mostrarFeedbackCopia(false);
    } finally {
        document.body.removeChild(textarea);
    }
}

/**
 * Mostra feedback visual ao copiar
 */
function mostrarFeedbackCopia(sucesso) {
    const btn = document.querySelector('.btn-copy');
    const originalText = btn.innerHTML;

    if (sucesso) {
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
    } else {
        btn.innerHTML = '<i class="fas fa-times"></i> Erro ao copiar';
    }

    setTimeout(() => {
        btn.innerHTML = originalText;
    }, 2000);
}

/**
 * Limpa a mensagem gerada
 */
function limparMensagem() {
    document.getElementById('output').textContent = '';
    document.getElementById('outputContainer').classList.add('hidden');
}

// ===== FUNÇÃO AUXILIAR =====

/**
 * Expande/recolhe a lista de incidentes
 */
function toggleExpandirLista() {
    const incidentList = document.getElementById('incidentList');
    const expandIcon = document.getElementById('expandIcon');

    if (incidentList.classList.contains('expanded')) {
        incidentList.classList.remove('expanded');
        expandIcon.className = 'fas fa-expand-alt';
    } else {
        incidentList.classList.add('expanded');
        expandIcon.className = 'fas fa-compress-alt';
    }
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    // Atualizar lista de incidentes ao carregar
    atualizarListaIncidentes();

    // Converter inputs para maiúsculas e remover pontos duplicados
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        if (input.type !== 'radio' && input.type !== 'checkbox') {
            input.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
                this.value = this.value.replace(/\.{2,}/g, '.');
            });
        }
    });
});
