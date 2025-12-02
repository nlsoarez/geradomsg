# Gerador de Mensagens - Fibra Óptica

Sistema de gerenciamento e geração de mensagens para incidentes de fibra óptica residencial.

## 🚀 Funcionalidades

- **Gerenciamento de Incidentes**
  - Rompimento de fibra (HFC/GPON)
  - Manobra de fibra
  - Status: inicial, atualização, encerramento

- **Armazenamento de Dados**
  - Sincronização em nuvem via JSONBin.io
  - Fallback local com localStorage
  - Compartilhamento entre múltiplos usuários

- **Geração de Mensagens**
  - Templates padronizados
  - Validação automática de formatos
  - Alertas de escalonamento

- **Limpeza Automática**
  - Remove incidentes encerrados após 3 horas
  - Remove incidentes inativos após 24 horas

## 📁 Estrutura do Projeto

```
teste/
├── index.html              # Estrutura HTML principal
├── css/
│   └── styles.css          # Estilos da aplicação
├── js/
│   ├── config.js           # Configurações (NÃO commitado)
│   ├── config.js.example   # Template de configuração
│   ├── api.js              # Serviço JSONBin.io
│   ├── validators.js       # Funções de validação
│   ├── ui.js               # Lógica da interface
│   └── ui-messages.js      # Geração de mensagens
├── .gitignore              # Arquivos ignorados pelo Git
└── README.md               # Este arquivo
```

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd teste
```

### 2. Configure as credenciais

```bash
# Copie o arquivo de exemplo
cp js/config.js.example js/config.js

# Edite js/config.js com suas credenciais do JSONBin.io
```

### 3. Obtenha credenciais do JSONBin.io

1. Acesse [JSONBin.io](https://jsonbin.io/)
2. Crie uma conta gratuita
3. Crie um novo Bin
4. Copie o **Bin ID** e **Access Key**
5. Cole no arquivo `js/config.js`

### 4. Abra a aplicação

Abra o arquivo `index.html` no navegador ou use um servidor local:

```bash
# Usando Python 3
python -m http.server 8000

# Ou usando Node.js
npx http-server
```

Acesse: `http://localhost:8000`

## ✨ Melhorias Aplicadas

### Segurança
- ✅ Credenciais movidas para arquivo de configuração separado
- ✅ Arquivo de configuração adicionado ao `.gitignore`
- ✅ Template de exemplo criado (`config.js.example`)

### Código
- ✅ Separação de responsabilidades (HTML, CSS, JS)
- ✅ Módulos organizados por funcionalidade
- ✅ Refatoração de código duplicado
- ✅ Uso de Clipboard API moderna (com fallback)
- ✅ Validações melhoradas
- ✅ Tratamento de erros aprimorado

### Manutenibilidade
- ✅ Código modular e reutilizável
- ✅ Comentários e documentação
- ✅ Estrutura de arquivos clara
- ✅ Facilita futuras expansões

## 🎯 Uso

### Criar um Incidente

1. Selecione o tipo de mensagem (Rompimento ou Manobra)
2. Preencha os campos obrigatórios
3. Clique em "Salvar Incidente"
4. O incidente será compartilhado com todos os usuários

### Gerar Mensagem

1. Selecione o tipo de status (Inicial, Atualização, Encerramento)
2. Preencha os campos específicos do status
3. Clique em "Gerar Mensagem"
4. Copie a mensagem gerada

### Carregar Incidente

1. Digite o número do incidente no campo de busca
2. Clique no ícone de busca
3. Ou clique em um incidente da lista

## 📝 Validações

- **Data/Hora**: Formato `dd/mm/aaaa hh:mm`
- **Campos Numéricos**: Apenas números
- **Escalonamento Automático**:
  - HFC: Impacto ≥ 10
  - GPON: Impacto ≥ 300

## ⚠️ Avisos Importantes

- **NUNCA** faça commit do arquivo `js/config.js`
- Mantenha suas credenciais seguras
- Use HTTPS em produção
- Revise as permissões do Bin no JSONBin.io

## 🔒 Segurança

Este sistema usa JSONBin.io para armazenamento compartilhado. Recomendações:

1. **Desenvolvimento**: Use bins de teste
2. **Produção**: Configure permissões adequadas no JSONBin.io
3. **Futuro**: Considere implementar um backend próprio com autenticação

## 🛠️ Próximas Melhorias Sugeridas

- [ ] Implementar autenticação de usuários
- [ ] Backend próprio com Node.js/Express
- [ ] Exportação para PDF/CSV
- [ ] Sistema de notificações
- [ ] Histórico de alterações
- [ ] Pesquisa avançada de incidentes
- [ ] Dashboard com estatísticas
- [ ] Suporte a anexos de imagens
- [ ] PWA (Progressive Web App)

## 👤 Desenvolvedor

Desenvolvido por N5923221

## 📄 Licença

Este projeto é de uso interno.
