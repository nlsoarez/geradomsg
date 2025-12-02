# Configuração do Twilio para SMS Automático

## Problema
O navegador bloqueia chamadas diretas à API do Twilio por questões de segurança (CORS).

## Solução: Twilio Function (Serverless - GRATUITO)

### Passo 1: Criar a Function no Twilio

1. Acesse: https://console.twilio.com/us1/develop/functions/services
2. Clique em **"Create Service"**
3. Nome do serviço: `sms-sender`
4. Clique em **"Next"**

### Passo 2: Adicionar a Function

1. Clique em **"Add +"** → **"Add Function"**
2. Nome do path: `/send-sms`
3. Cole o código abaixo:

```javascript
exports.handler = function(context, event, callback) {
  // Configurar CORS para permitir chamadas do seu site
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return callback(null, response);
  }

  // Obter parâmetros
  const { to, body } = event;

  // Validar parâmetros
  if (!to || !body) {
    response.setStatusCode(400);
    response.setBody({
      success: false,
      message: 'Parâmetros "to" e "body" são obrigatórios'
    });
    return callback(null, response);
  }

  // Enviar SMS usando Twilio Client (já autenticado)
  const client = context.getTwilioClient();

  client.messages
    .create({
      body: body,
      to: to,
      from: context.TWILIO_PHONE_NUMBER
    })
    .then(message => {
      response.setStatusCode(200);
      response.setBody({
        success: true,
        sid: message.sid,
        message: 'SMS enviado com sucesso'
      });
      callback(null, response);
    })
    .catch(error => {
      response.setStatusCode(500);
      response.setBody({
        success: false,
        message: error.message
      });
      callback(null, response);
    });
};
```

### Passo 3: Configurar Environment Variables

1. Na mesma tela, clique na aba **"Environment Variables"**
2. Adicione:
   - Key: `TWILIO_PHONE_NUMBER`
   - Value: `+13417585645` (seu número Twilio)

### Passo 4: Deploy

1. Clique em **"Deploy All"**
2. Aguarde o deploy finalizar
3. Copie a URL da function (algo como: `https://sms-sender-XXXX.twil.io/send-sms`)

### Passo 5: Verificar número de destino (Apenas para contas Trial)

Se sua conta Twilio é **Trial** (gratuita), você precisa verificar o número de destino:

1. Acesse: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Clique em **"Add a new Caller ID"**
3. Digite: `+5521991212107`
4. Você receberá um código de verificação no telefone
5. Digite o código para verificar

**Nota:** Contas pagas (Upgraded) não precisam verificar números.

### Passo 6: Me fornecer a URL

Após criar a function, me forneça a URL completa (ex: `https://sms-sender-1234-dev.twil.io/send-sms`)

Eu vou atualizar o código para usar essa URL.

---

## Alternativa: Upgrade da conta Twilio

Se preferir não usar Functions, você pode:
1. Fazer upgrade da conta Twilio para paga (adicionar cartão de crédito)
2. Isso remove algumas restrições, mas ainda terá o problema de CORS

**Recomendação:** Use a Twilio Function, é mais seguro e gratuito!
