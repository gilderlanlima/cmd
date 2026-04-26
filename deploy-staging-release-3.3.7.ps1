$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH

$repoPath = 'C:\Users\Gil\Documents\CRM\cmd'
$archivePath = Join-Path $repoPath 'release-v3.3.7.tar.gz'

if (Test-Path $archivePath) {
  Remove-Item $archivePath -Force
}

git -C $repoPath archive --format=tar.gz --output=$archivePath v3.3.7

$sec = ConvertTo-SecureString '@Ubuntu24.04' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $sec)
$session = New-SSHSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
$sftp = New-SFTPSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey

Invoke-SSHCommand -SSHSession $session -Command 'mkdir -p /tmp && rm -f /tmp/release-v3.3.7.tar.gz' -TimeOut 120000 | Out-Null
Set-SFTPItem -SFTPSession $sftp -Path $archivePath -Destination '/tmp/'

$cmd = @"
set -e
rm -rf /tmp/release-v3.3.7-src
mkdir -p /tmp/release-v3.3.7-src
tar -xzf /tmp/release-v3.3.7.tar.gz -C /tmp/release-v3.3.7-src

rsync -a --delete \
  --exclude '.env' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude 'public' \
  /tmp/release-v3.3.7-src/backend/ /home/deploy/inb-staging/backend/

rsync -a --delete \
  --exclude '.env' \
  --exclude 'node_modules' \
  --exclude 'build' \
  /tmp/release-v3.3.7-src/frontend/ /home/deploy/inb-staging/frontend/

rsync -a --delete \
  --exclude '.env' \
  --exclude 'node_modules' \
  /tmp/release-v3.3.7-src/api_oficial/ /home/deploy/inb-staging/api_oficial/

rsync -a --delete \
  --exclude '.env' \
  --exclude 'node_modules' \
  /tmp/release-v3.3.7-src/api_transcricao/ /home/deploy/inb-staging/api_transcricao/

rsync -a --delete \
  --exclude '.env' \
  --exclude 'node_modules' \
  /tmp/release-v3.3.7-src/multiflow_deploy/ /home/deploy/inb-staging/multiflow_deploy/

install -D -o deploy -g deploy -m 644 /tmp/release-v3.3.7-src/HISTORICO_DE_VERSOES.md /home/deploy/inb-staging/HISTORICO_DE_VERSOES.md

chown -R deploy:deploy /home/deploy/inb-staging

su - deploy -c 'cd /home/deploy/inb-staging/backend && npm install --legacy-peer-deps && npm run build'
su - deploy -c 'cd /home/deploy/inb-staging/frontend && npm install --legacy-peer-deps && npm run build'
su - deploy -c 'pm2 restart inb-staging-backend && pm2 restart inb-staging-frontend && pm2 save'
"@

$result = Invoke-SSHCommand -SSHSession $session -Command $cmd -TimeOut 1800000
$result.Output
if ($result.Error) { $result.Error }

Remove-SFTPSession -SFTPSession $sftp | Out-Null
Remove-SSHSession -SSHSession $session | Out-Null

if (Test-Path $archivePath) {
  Remove-Item $archivePath -Force
}
