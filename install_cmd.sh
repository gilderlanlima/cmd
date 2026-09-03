#!/bin/bash
set -e

echo "================================================"
echo "  Instalador CRM Ideia no Bolso (Docker)"
echo "================================================"
echo ""

# --- Verifica e instala o Docker, se necessário ---
if ! command -v docker &> /dev/null; then
  echo "Docker não encontrado. Instalando automaticamente..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
  echo "Docker instalado com sucesso."
else
  echo "Docker já está instalado ($(docker --version))."
fi

# --- Verifica se o usuário atual precisa de sudo para rodar docker ---
if ! docker ps &> /dev/null; then
  echo "Usando 'sudo' para comandos docker (usuário sem permissão direta)."
  DOCKER_CMD="sudo docker"
  COMPOSE_CMD="sudo docker compose"
else
  DOCKER_CMD="docker"
  COMPOSE_CMD="docker compose"
fi

echo ""

# --- Coleta de informações ---
read -p "Nome da instância (ex: ideianobolso, sem espaços): " INSTANCE_NAME
read -p "IP ou domínio do servidor (ex: 10.0.0.90): " SERVER_HOST
read -p "Porta do BACKEND (ex: 8085): " BACKEND_PORT
read -p "Porta do FRONTEND (ex: 8086): " FRONTEND_PORT
read -p "Senha do banco de dados PostgreSQL (deixe em branco para gerar automática): " DB_PASS
read -p "Usar protocolo https? (s/n): " USE_HTTPS

if [ -z "$DB_PASS" ]; then
  DB_PASS=$(openssl rand -hex 12)
  echo "Senha do banco gerada automaticamente: $DB_PASS"
fi

if [ "$USE_HTTPS" = "s" ] || [ "$USE_HTTPS" = "S" ]; then
  PROTOCOL="https"
else
  PROTOCOL="http"
fi

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

INSTALL_DIR="$HOME/crm-$INSTANCE_NAME"

echo ""
echo "Resumo da instalação:"
echo "  Nome:        $INSTANCE_NAME"
echo "  Diretório:   $INSTALL_DIR"
echo "  Backend:     $PROTOCOL://$SERVER_HOST:$BACKEND_PORT"
echo "  Frontend:    $PROTOCOL://$SERVER_HOST:$FRONTEND_PORT"
echo ""
read -p "Confirma a instalação com esses dados? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
  echo "Instalação cancelada."
  exit 1
fi

# --- Clonar o repositório ---
echo ""
echo "Clonando repositório..."
git clone https://github.com/gilderlanlima/cmd.git "$INSTALL_DIR"
cd "$INSTALL_DIR"

# --- Criar Dockerfile do backend ---
cat > backend/Dockerfile << 'EOF'
FROM node:20-bullseye
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["node", "dist/server.js"]
EOF

# --- Criar Dockerfile do frontend ---
cat > frontend/Dockerfile << 'EOF'
FROM node:20-bullseye AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
EOF

# --- Criar .env do backend ---
cat > backend/.env << EOF
NODE_ENV=production
BACKEND_URL=$PROTOCOL://$SERVER_HOST:$BACKEND_PORT
FRONTEND_URL=$PROTOCOL://$SERVER_HOST:$FRONTEND_PORT
PROXY_PORT=8080
PORT=8080
DB_DIALECT=postgres
DB_HOST=${INSTANCE_NAME}-postgres
DB_PORT=5432
DB_USER=crmuser
DB_PASS=$DB_PASS
DB_NAME=crmdb
DB_POOL_MAX=100
DB_POOL_MIN=15
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=600000
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
REDIS_URI=redis://${INSTANCE_NAME}-redis:6379
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000
SOCKET_ADMIN=true
VERIFY_TOKEN=whaticket
USE_WHATSAPP_OFICIAL=false
USER_LIMIT=10000
CONNECTIONS_LIMIT=100000
CLOSED_SEND_BY_ME=true
EOF

# --- Criar .env do frontend ---
cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=$PROTOCOL://$SERVER_HOST:$BACKEND_PORT
REACT_APP_FACEBOOK_APP_ID=
REACT_APP_NAME_SYSTEM=$INSTANCE_NAME
REACT_APP_NUMBER_SUPPORT=
REACT_APP_REQUIRE_BUSINESS_MANAGEMENT=TRUE
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
BUILD_PATH=build
CI=false
ESLint_NO_DEV_ERRORS=true
TSC_COMPILE_ON_ERROR=true
FAST_REFRESH=false
EOF

# --- Criar docker-compose.yml ---
cat > docker-compose.yml << EOF
services:
  ${INSTANCE_NAME}-postgres:
    image: postgres:17
    container_name: ${INSTANCE_NAME}-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=crmuser
      - POSTGRES_PASSWORD=$DB_PASS
      - POSTGRES_DB=crmdb
    volumes:
      - ${INSTANCE_NAME}_pg_data:/var/lib/postgresql/data

  ${INSTANCE_NAME}-redis:
    image: redis:latest
    container_name: ${INSTANCE_NAME}-redis
    restart: unless-stopped

  ${INSTANCE_NAME}-backend:
    build: ./backend
    container_name: ${INSTANCE_NAME}-backend
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT}:8080"
    env_file:
      - ./backend/.env
    depends_on:
      - ${INSTANCE_NAME}-postgres
      - ${INSTANCE_NAME}-redis
    volumes:
      - ${INSTANCE_NAME}_backend_public:/app/public

  ${INSTANCE_NAME}-frontend:
    build: ./frontend
    container_name: ${INSTANCE_NAME}-frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT}:80"
    depends_on:
      - ${INSTANCE_NAME}-backend

volumes:
  ${INSTANCE_NAME}_pg_data:
  ${INSTANCE_NAME}_backend_public:
EOF

echo ""
echo "Arquivos gerados. Iniciando build e subida dos containers..."
echo "(isso pode levar de 5 a 15 minutos na primeira vez)"
echo ""

$COMPOSE_CMD up -d --build

echo ""
echo "================================================"
echo "  Instalação concluída!"
echo "================================================"
echo "  Frontend: $PROTOCOL://$SERVER_HOST:$FRONTEND_PORT"
echo "  Backend:  $PROTOCOL://$SERVER_HOST:$BACKEND_PORT"
echo "  Senha do banco: $DB_PASS"
echo "  (Guarde essas informações em local seguro)"
echo "================================================"
