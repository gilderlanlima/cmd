# CMD

O `CMD` e um CRM com foco em atendimento, operacao comercial e centralizacao de conversas.

Este repositorio e a base oficial do sistema para desenvolvimento, versionamento, deploy em VPS e manutencao do painel.

## Versao Atual

- `2.1.1`

## O Painel

O painel web concentra a operacao do CRM e foi pensado para uso diario por equipes de atendimento, supervisao e administracao.

Principais modulos do painel:

- atendimentos;
- respostas rapidas;
- contatos;
- agendamentos;
- tags;
- chat interno;
- flowbuilder;
- informativos;
- API;
- usuarios;
- filas e chatbot;
- integracoes;
- conexoes;
- financeiro;
- configuracoes.

## Componentes do Projeto

- `frontend`: painel administrativo e operacional em React.
- `backend`: API principal, autenticacao, regras de negocio, sockets, filas e integracoes.
- `api_oficial`: servico complementar para WhatsApp Oficial.
- `api_transcricao`: servico auxiliar para transcricao de audio.

## Stack Principal

- `Node.js`
- `React`
- `TypeScript` no backend
- `PostgreSQL`
- `Redis`
- `PM2`
- `Nginx`

## Requisitos Recomendados

Configuracao recomendada para VPS:

- Ubuntu 22.04 LTS;
- Node.js `20.x` LTS;
- PostgreSQL `14+`;
- Redis `6+`;
- PM2 para gerenciamento de processos;
- Nginx como proxy reverso;
- Certbot para SSL;
- minimo de `4 GB RAM`;
- minimo de `2 vCPU`;
- disco SSD.

Observacao importante:

- Evite usar `Node 24` neste projeto sem ajustes extras, porque o frontend atual usa scripts do CRA com `--openssl-legacy-provider`.

## Portas Padrao

- `frontend`: `3000`
- `backend`: `8080`
- `api_oficial`: `6000`
- `api_transcricao`: `4002`
- `PostgreSQL`: `5432`
- `Redis`: `6379`

## Instalacao Local

1. Clone o repositorio:

```bash
git clone https://github.com/gilderlanlima/cmd.git
cd cmd
```

2. Instale as dependencias:

```bash
cd backend
npm install
```

```bash
cd ../frontend
npm install
```

```bash
cd ../api_oficial
npm install
```

3. Configure os arquivos de ambiente:

- copie `backend/.env.example` para `backend/.env`
- copie `frontend/.env.example` para `frontend/.env`
- copie `api_oficial/.env.exemplo` para `api_oficial/.env`
- copie `api_transcricao/.env.example` para `api_transcricao/.env`

4. Suba banco e cache:

- PostgreSQL ativo na `5432`
- Redis ativo na `6379`

5. Rode migrations e seeds do backend:

```bash
cd backend
npx sequelize db:migrate
npx sequelize db:seed:all
```

6. Inicie o backend:

```bash
cd backend
npm run dev
```

7. Inicie o frontend:

```bash
cd frontend
npm start
```

## Credencial Inicial

Depois de rodar as seeds, o acesso padrao do painel e:

- login: `admin@ideianobolso.com`
- senha: `bolso1234`

## Variaveis Principais

Exemplo importante do `backend/.env.example`:

```env
PORT=8080
FRONTEND_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=whatsapp
REDIS_URI=redis://localhost:6379
TRANSCRIBE_URL=http://localhost:506
USE_WHATSAPP_OFICIAL=false
URL_API_OFICIAL=
TOKEN_API_OFICIAL=
```

Exemplo importante do `frontend/.env.example`:

```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_BACKEND_API=http://localhost:8080
PORT=3000
PROXY_PORT=8080
GENERATE_SOURCEMAP=false
BUILD_PATH=build
```

## Build para Producao

Backend:

```bash
cd backend
npm install
npm run build
```

Frontend:

```bash
cd frontend
npm install
npm run build
```

API oficial:

```bash
cd api_oficial
npm install
npm run build
```

## Deploy Basico em VPS

Fluxo recomendado:

1. Instalar dependencias do servidor:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx redis-server postgresql postgresql-contrib
```

2. Instalar Node.js 20 e PM2.

3. Clonar o projeto:

```bash
git clone https://github.com/gilderlanlima/cmd.git
cd cmd
```

4. Configurar os `.env` de cada servico.

5. Instalar dependencias e gerar build:

```bash
cd backend && npm install && npm run build
```

```bash
cd ../frontend && npm install && npm run build
```

6. Rodar migrations e seeds:

```bash
cd ../backend
npx sequelize db:migrate
npx sequelize db:seed:all
```

7. Subir processos com PM2:

```bash
cd backend
pm2 start dist/server.js --name cmd-backend
```

Para o frontend, use build estatico servido por Nginx ou um processo dedicado conforme sua estrategia de deploy.

## Configuracao Recomendada de Producao

- `frontend` servido pelo `Nginx`;
- `backend` gerenciado por `PM2`;
- `PostgreSQL` e `Redis` locais ou em servicos dedicados;
- SSL com `Certbot`;
- backup recorrente do banco;
- `pm2 save` e `pm2 startup` configurados;
- acesso externo apenas pelas portas `80` e `443`.

## Fluxo de Atualizacao na VPS

```bash
cd cmd
git pull origin main
```

```bash
cd backend
npm install
npm run build
npx sequelize db:migrate
pm2 restart cmd-backend
```

Se houver alteracao no frontend:

```bash
cd frontend
npm install
npm run build
```

Depois, atualize o build servido pelo Nginx.

## Observacao Operacional

Antes de publicar na VPS, garantir que:

- as alteracoes estejam commitadas;
- as alteracoes estejam enviadas ao GitHub;
- a versao do projeto esteja atualizada conforme o impacto da mudanca;
- a tag correspondente esteja criada no padrao `vX.Y.Z`.
