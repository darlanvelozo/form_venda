# Dashboard de Acompanhamento de Leads

Sistema de dashboard para acompanhar informações do banco de dados de leads e prospectos.

## Funcionalidades

### 📊 Dashboard de Gerenciamento
- **Estatísticas em tempo real**: Total de leads, prospectos, leads do dia e valor total
- **Gráficos interativos**: Gráfico de pizza para status dos prospectos e linha para tendência de leads
- **Tabelas detalhadas**: Listagem completa de leads e prospectos com paginação
- **Busca e filtros**: Busca por leads e filtro por status de prospectos
- **Atualização automática**: Dados atualizados automaticamente a cada 5 minutos

### 📝 Sistema de Cadastro de Clientes
- **Formulário em etapas**: Processo guiado em 4 etapas para melhor UX
- **Seleção de planos**: Interface visual para escolha de planos de internet
- **Validação em tempo real**: CPF, telefone e campos obrigatórios validados instantaneamente
- **Busca automática de CEP**: Preenchimento automático do endereço via ViaCEP
- **Integração com API**: Envio direto para a API de cadastro de prospectos
- **Design responsivo**: Interface adaptada para desktop e mobile
- **Feedback visual**: Modais de sucesso, erro e loading para melhor experiência

## Estrutura do Projeto

```
acompanhamento_banco/
├── app.py                 # Backend Flask
├── requirements.txt       # Dependências Python
├── README.md             # Documentação
├── templates/
│   └── dashboard.html    # Template principal
└── static/
    ├── css/
    │   └── style.css     # Estilos CSS
    └── js/
        └── dashboard.js  # JavaScript do dashboard
```

## Instalação

1. **Clone ou navegue até o diretório do projeto**
   ```bash
   cd acompanhamento_banco
   ```

2. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure o banco de dados**
   
   O sistema está configurado para conectar ao banco PostgreSQL com as seguintes configurações:
   ```python
   DB_CONFIG_LEADS = {
       'dbname': 'robo_venda_automatica',
       'user': 'admin',
       'password': 'qualidade@trunks.57',
       'host': '187.62.153.52',
       'port': '5432'
   }
   ```

4. **Execute a aplicação**
   ```bash
   python app.py
   ```

5. **Acesse o sistema**
   
   - **Dashboard**: `http://localhost:5000`
   - **Cadastro de Clientes**: `http://localhost:5000/cadastro`

## Uso do Dashboard

### Seção de Estatísticas
- **Total de Leads**: Quantidade total de leads cadastrados
- **Total de Prospectos**: Quantidade total de prospectos
- **Leads Hoje**: Leads cadastrados no dia atual
- **Valor Total**: Soma de todos os valores dos leads

### Gráficos
- **Status dos Prospectos**: Gráfico de pizza mostrando a distribuição por status
- **Leads dos Últimos 7 Dias**: Gráfico de linha com a tendência de cadastros

### Tabelas Resumo
- **Top Empresas**: Empresas com mais leads
- **Top Origens**: Principais origens dos leads

### Tabelas Detalhadas

#### Aba Leads
- Listagem completa de todos os leads
- Busca por nome, email ou telefone
- Visualização de detalhes completos do lead
- Paginação para navegação

#### Aba Prospectos
- Listagem completa de todos os prospectos
- Filtro por status
- Informações de processamento e erros
- Paginação para navegação

### Métricas de Performance
- **Prospectos com Erro**: Quantidade de prospectos que falharam no processamento
- **Tempo Médio Processamento**: Tempo médio para processar um prospecto
- **Valor Médio por Lead**: Valor médio dos leads com valor definido
- **Leads com Valor**: Quantidade de leads que possuem valor

## Sistema de Cadastro de Clientes

### Processo de Cadastro

#### Etapa 1: Seleção do Plano
- Escolha entre 3 planos de internet disponíveis:
  - **620MB + Paramount**: R$ 99,90/mês
  - **820MB + Paramount**: R$ 117,90/mês  
  - **1GB Turbo + Max + Paramount**: R$ 147,90/mês
- Seleção do dia de vencimento da fatura (5, 10, 15, 20 ou 30)
- Interface visual com destaque para o plano mais popular

#### Etapa 2: Dados Pessoais
- Nome completo (obrigatório)
- CPF com validação automática (obrigatório)
- RG (obrigatório)
- Telefone/WhatsApp com máscara (obrigatório)
- Data de nascimento (obrigatório)

#### Etapa 3: Endereço de Instalação
- CEP com busca automática via ViaCEP
- Endereço preenchido automaticamente
- Número da residência
- Bairro
- Cidade e Estado (preenchidos automaticamente)

#### Etapa 4: Confirmação
- Resumo de todas as informações
- Aceitação dos termos de serviço
- Envio para a API de cadastro

### Funcionalidades Avançadas

#### Validações
- **CPF**: Validação matemática completa
- **Telefone**: Verificação de formato (10-11 dígitos)
- **CEP**: Consulta automática na API ViaCEP
- **Campos obrigatórios**: Validação em tempo real

#### UX/UI Otimizada
- **Máscaras de input**: Formatação automática de CPF, telefone e CEP
- **Feedback visual**: Mensagens de erro em tempo real
- **Barra de progresso**: Indicação visual do andamento
- **Design responsivo**: Adaptado para todos os dispositivos
- **Modais informativos**: Sucesso, erro e loading

#### Integração
- **API Externa**: Envio direto para a API da Megalink
- **Tratamento de erros**: Mensagens claras em caso de falha
- **Loading states**: Indicação visual durante o processamento

## API Endpoints

O backend fornece os seguintes endpoints:

- `GET /` - Página principal do dashboard
- `GET /api/stats` - Estatísticas gerais do sistema
- `GET /api/leads` - Lista de leads com paginação
- `GET /api/prospectos` - Lista de prospectos com paginação
- `GET /api/lead/<id>` - Detalhes completos de um lead específico

### Parâmetros de Query

#### /api/leads
- `page`: Número da página (padrão: 1)
- `per_page`: Itens por página (padrão: 10)
- `search`: Termo de busca para nome, email ou telefone

#### /api/prospectos
- `page`: Número da página (padrão: 1)
- `per_page`: Itens por página (padrão: 10)
- `status`: Filtro por status

## Estrutura do Banco de Dados

### Tabela: leads_prospectos
- `id`: ID único do lead
- `nome_razaosocial`: Nome ou razão social
- `email`: Email do lead
- `telefone`: Telefone do lead
- `valor`: Valor monetário associado
- `empresa`: Empresa do lead
- `origem`: Origem do lead
- `data_cadastro`: Data de cadastro
- `status_api`: Status da API
- `cnpj`: CNPJ (se aplicável)
- `cidade`: Cidade
- `estado`: Estado

### Tabela: prospectos
- `id`: ID único do prospecto
- `nome_prospecto`: Nome do prospecto
- `id_prospecto_hubsoft`: ID no sistema Hubsoft
- `status`: Status atual do prospecto
- `data_criacao`: Data de criação
- `data_processamento`: Data do processamento
- `tentativas_processamento`: Número de tentativas
- `tempo_processamento`: Tempo gasto no processamento
- `erro_processamento`: Erro ocorrido (se houver)

## Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Banco de Dados**: PostgreSQL
- **Gráficos**: Chart.js
- **Ícones**: Font Awesome
- **Design**: CSS Grid, Flexbox, Gradientes

## Personalização

### Alterando Cores
As cores principais podem ser alteradas no arquivo `static/css/style.css`:
```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cores dos gráficos */
const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
```

### Modificando Intervalos
O intervalo de atualização automática pode ser alterado no arquivo `static/js/dashboard.js`:
```javascript
// Auto refresh (atualmente 5 minutos)
setInterval(() => {
    if (dashboard) {
        dashboard.loadData();
    }
}, 5 * 60 * 1000); // Altere aqui
```

## Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o banco de dados está acessível
3. Verifique os logs do console para erros JavaScript
4. Confirme se o Flask está rodando na porta 5000 