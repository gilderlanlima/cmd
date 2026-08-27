# Deploy na VPS (Hostinger + CloudPanel)

Referência do deploy de produção em `wp.ideianobolso.com` (frontend) e
`wp-bk.ideianobolso.com` (backend), na mesma VPS que já hospeda outros
sites via CloudPanel.

## Topologia

- **Backend**: site CloudPanel tipo *reverse proxy*, usuário `crmideia`,
  checkout git em `~/htdocs/wp-bk.ideianobolso.com/repo`. Processo Node
  gerenciado por **systemd** (`crm-backend.service`), escutando em
  `127.0.0.1:8085` (porta 8080 já é usada internamente pelo nginx do
  CloudPanel para todos os vhosts — não usar).
- **Frontend**: site CloudPanel tipo *static*, usuário `crmideiafront`,
  servindo `~/htdocs/wp.ideianobolso.com/` (build da CRA copiado para lá,
  não é servido diretamente do checkout do backend). A config nginx
  gerada pelo CloudPanel precisou de um bloco `location / { try_files
  $uri /index.html; }` adicionado manualmente para suportar rotas SPA.
- Node instalado via `nvm` dentro do home do usuário `crmideia` (não há
  Node/pm2 a nível de sistema nesta VPS).
- PM2 apresentou um bug de baixo nível nesse kernel (`spawn ... EACCES`
  no daemon, sem relação com permissão de arquivo — não investigado até
  a causa raiz). Por isso o processo do backend usa **systemd**, não pm2.

## Por que não pm2

`update.sh` originalmente assumia `pm2 restart`. Como pm2 não conseguiu
nem iniciar seu próprio daemon nesta VPS (erro `spawn .../node EACCES`
mesmo com o binário executável e sem restrição de AppArmor/ulimit
detectada), trocamos para systemd, que é nativo do Ubuntu e não depende
de um daemon Node adicional.

## Unit systemd do backend (`/etc/systemd/system/crm-backend.service`, não versionado)

```ini
[Unit]
Description=CRM Ideia no Bolso - Backend
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=crmideia
WorkingDirectory=/home/crmideia/htdocs/wp-bk.ideianobolso.com/repo/backend
ExecStart=/home/crmideia/.nvm/versions/node/v20.20.2/bin/node dist/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment="PATH=/home/crmideia/.nvm/versions/node/v20.20.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
StandardOutput=append:/home/crmideia/logs/app/backend.log
StandardError=append:/home/crmideia/logs/app/backend-error.log

[Install]
WantedBy=multi-user.target
```

**Gotchas**:
- Sem o `Environment="PATH=..."` explícito incluindo o bin do `nvm`, o
  processo do backend (e portanto o `update.sh`, que ele spawna) não
  enxerga `node`/`npm` — serviços systemd não carregam `~/.bashrc`.
- `NODE_ENV=production` (necessário para o app em runtime) é herdado
  pelo `update.sh` via `env: process.env` (`RunSystemUpdateService.ts`)
  e faz `npm install` pular devDependencies (`typescript`,
  `react-scripts` etc.), quebrando o build. `update.sh` já dá
  `unset NODE_ENV` logo no início por causa disso.

## Atualização automática (painel > Configurações > Atualizações)

`update.sh` roda como o usuário `crmideia` (mesmo usuário do backend) e
precisa de dois privilégios que ele não tem por padrão:

1. Reiniciar o serviço systemd do backend.
2. Publicar o build do frontend no diretório do usuário `crmideiafront`.

Isso é resolvido com um sudoers escopado (`/etc/sudoers.d/crm-deploy`,
só nessa VPS, não versionado) liberando, sem senha, apenas:

```
crmideia ALL=(root) NOPASSWD: /usr/bin/systemd-run --unit=crm-backend-restart-* --collect /usr/bin/systemctl restart crm-backend.service
crmideia ALL=(root) NOPASSWD: /usr/local/bin/crm-sync-frontend.sh
```

`/usr/local/bin/crm-sync-frontend.sh` (root:root, 700, caminhos
hardcoded, sem argumentos) faz o rsync do build para o htdocs do
`crmideiafront` e corrige o dono dos arquivos.

**Gotcha (self-kill no restart)**: `update.sh` roda dentro do cgroup do
próprio `crm-backend.service` (foi spawnado pelo processo Node que esse
serviço gerencia). Um `sudo systemctl restart crm-backend.service`
direto mata o cgroup inteiro — incluindo o próprio `update.sh` — antes
dele conseguir publicar o frontend e finalizar o status, deixando o
painel travado em "atualizando" para sempre. Por isso o restart é feito
via `systemd-run`, que pede pro systemd (PID 1) rodar numa unit
transiente separada, fora do cgroup atual — e a publicação do frontend
acontece *antes* do restart no script, não depois, para não depender
dele. **Se a regra de sudoers antiga (`systemctl restart` direto) ainda
estiver na VPS, ela precisa ser trocada pela de `systemd-run` acima
antes desta versão do `update.sh` funcionar em produção.**

`backend/.env` nesta VPS define:

```
SYSTEM_UPDATE_REPO_PATH=/home/crmideia/htdocs/wp-bk.ideianobolso.com/repo
SYSTEM_UPDATE_BRANCH=main
SYSTEMD_BACKEND_SERVICE=crm-backend.service
FRONTEND_SYNC_SCRIPT=/usr/local/bin/crm-sync-frontend.sh
```

## Upgrade e downgrade por tag (tela de Atualizações)

`update.sh` não faz mais `git pull origin main`. Ele recebe uma tag de
release como terceiro argumento (`update.sh <logfile> <statusfile>
<tag>`) e roda `git fetch --tags && git checkout --force <tag>` — o
mesmo caminho de código serve tanto para "Atualizar agora" (tag mais
nova) quanto para "Reverter para uma versão anterior" (uma das até 3
tags anteriores à instalada, listadas em `downgradeOptions` pelo
`CheckForUpdatesService`). O backend valida a tag recebida contra a
lista real de tags do repositório antes de repassar ao script
(`RunSystemUpdateService.ts`), então uma tag inexistente ou fora do
formato `vX.Y.Z` é rejeitada com 400 antes de chegar no shell.

O checkout fica em detached HEAD (é uma tag, não uma branch) — normal
para um ambiente de produção que só é atualizado por esse mecanismo.

**Downgrade não desfaz migrações de banco.** `db:migrate` só aplica
migrações pendentes; reverter o código para uma tag mais antiga não
roda `db:migrate:undo`. Se a versão que estava rodando adicionou uma
migração, o schema continua com ela mesmo depois do downgrade — a UI
avisa isso no modal de confirmação, mas não tenta reverter o banco
automaticamente.

## Migrações de banco de dados

`update.sh` roda `npx sequelize db:migrate` logo após buildar o backend
(e antes do restart), então uma nova versão com migração pendente é
aplicada automaticamente pelo botão "Atualizar agora". Antes da v3.3.22
esse passo não existia — qualquer release com migração deployada por
esse mecanismo teria deixado o schema do banco desatualizado.

## Gotcha conhecido: ajv-keywords x ajv

`npm install` no frontend pode quebrar o build (`Cannot find module
'ajv/dist/compile/codegen'`) por incompatibilidade entre a versão do
`ajv` que `ajv-keywords` espera e a que o `schema-utils` instala. Não
depender de `overrides` no `package.json` (trava o install por 40+
minutos nesse ambiente). `update.sh` já automatiza a correção (copia a
versão do `ajv` que o `schema-utils` trouxe para dentro de
`ajv-keywords/node_modules`) — se mesmo assim o build falhar com esse
erro, repetir manualmente:

```bash
cp -r node_modules/schema-utils/node_modules/ajv node_modules/ajv-keywords/node_modules/ajv
```

## Credenciais e segredos

Senhas de banco, JWT secrets e senha dos usuários de site do CloudPanel
foram geradas na hora do deploy e não estão neste repositório. Backup
delas é responsabilidade de quem fez o deploy (gerente de senhas / nota
segura), não do git.
