#!/usr/bin/env bash
# Executado pelo backend (SystemUpdateController) para atualizar o CRM a
# partir do GitHub. Assume um checkout git na VPS (não Docker), backend
# gerenciado via systemd e frontend servido como arquivos estáticos.
# Uso: update.sh <logfile> <statusfile>

LOGFILE="$1"
STATUSFILE="$2"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$REPO_ROOT" || exit 1

# NODE_ENV=production (herdado do processo do backend que dispara este
# script) faz "npm install" pular devDependencies como typescript e
# react-scripts, quebrando o build. O build precisa delas mesmo em produção.
unset NODE_ENV

STARTED_AT="$(date -Iseconds)"
printf '{"running":true,"startedAt":"%s","finishedAt":null,"exitCode":null}\n' "$STARTED_AT" > "$STATUSFILE"

{
  echo "=== $(date -Iseconds) - iniciando atualização ==="

  echo "--- git pull ---"
  git pull origin main &&

  echo "--- backend: instalando dependências e buildando ---" &&
  (cd backend && npm install --legacy-peer-deps --include=dev && npm run build) &&

  echo "--- rodando migrações do banco de dados ---" &&
  (cd backend && npx sequelize db:migrate) &&

  echo "--- frontend: instalando dependências e buildando ---" &&
  (
    cd frontend &&
    npm install --legacy-peer-deps --include=dev &&
    # ajv-keywords e schema-utils podem instalar versões incompatíveis do
    # ajv (quebra o build com "Cannot find module 'ajv/dist/compile/codegen'").
    # Best-effort: se schema-utils trouxe uma versão própria do ajv, usa a
    # mesma para ajv-keywords. Ver docs/deploy-vps.md.
    if [ -d node_modules/schema-utils/node_modules/ajv ]; then
      mkdir -p node_modules/ajv-keywords/node_modules &&
      cp -r node_modules/schema-utils/node_modules/ajv node_modules/ajv-keywords/node_modules/ajv
    fi &&
    npm run build
  ) &&

  echo "--- publicando build do frontend ---" &&
  if [ -n "$FRONTEND_SYNC_SCRIPT" ]; then
    # Nao checar "-x" aqui: o script e 700 (root:root) de proposito, entao
    # o usuario que roda o update.sh nunca tem permissao de execucao direta
    # nele mesmo podendo rodar via sudo -n - "-x" sempre falharia e a
    # publicacao do frontend seria pulada silenciosamente (com um aviso
    # enganoso dizendo "nao definido", mesmo estando definido).
    sudo -n "$FRONTEND_SYNC_SCRIPT"
  else
    echo "AVISO: FRONTEND_SYNC_SCRIPT não definido - publique o build do frontend manualmente."
  fi &&

  echo "--- reiniciando backend (systemd) ---" &&
  if [ -n "$SYSTEMD_BACKEND_SERVICE" ]; then
    # Este script roda dentro do proprio cgroup do servico do backend (foi
    # spawnado pelo processo Node gerenciado por esse mesmo servico). Um
    # "systemctl restart" direto mata o cgroup inteiro - incluindo este
    # script - antes dele terminar, deixando o status travado em
    # "running" e nunca finalizando o log. "systemd-run" pede pro systemd
    # (PID 1) rodar o restart numa unit transiente separada, fora do
    # cgroup atual, entao o restart do backend nao mata quem o disparou.
    sudo -n systemd-run --unit="crm-backend-restart-$(date +%s)" --collect \
      /usr/bin/systemctl restart "$SYSTEMD_BACKEND_SERVICE"
  else
    echo "AVISO: SYSTEMD_BACKEND_SERVICE não definido - reinicie o backend manualmente."
  fi
} >> "$LOGFILE" 2>&1

EXIT_CODE=$?
echo "=== $(date -Iseconds) - finalizado com código $EXIT_CODE ===" >> "$LOGFILE"
printf '{"running":false,"startedAt":"%s","finishedAt":"%s","exitCode":%s}\n' \
  "$STARTED_AT" "$(date -Iseconds)" "$EXIT_CODE" > "$STATUSFILE"
