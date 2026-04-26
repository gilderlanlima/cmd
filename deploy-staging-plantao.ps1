$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH

$repo = 'C:\Users\Gil\Documents\CRM\cmd'
$tmp = Join-Path $repo 'tmp-plantao-deploy'
$archive = Join-Path $repo 'plantao-staging.tar.gz'

if (Test-Path $tmp) {
  Remove-Item $tmp -Recurse -Force
}

if (Test-Path $archive) {
  Remove-Item $archive -Force
}

New-Item -ItemType Directory -Path $tmp | Out-Null

$files = @(
  'backend\src\controllers\UserController.ts',
  'backend\src\routes\userRoutes.ts',
  'backend\src\services\FollowMeServices\FollowMeHelpers.ts',
  'backend\src\services\FollowMeServices\NotifyOnDutyUsersService.ts',
  'backend\src\services\UserServices\ListUsersService.ts',
  'backend\src\services\UserServices\UpdateUserFollowMeService.ts',
  'backend\src\services\WbotServices\ChatBotListener.ts',
  'backend\src\services\WbotServices\wbotMessageListener.ts',
  'frontend\src\layout\MainListItems.js',
  'frontend\src\routes\index.js',
  'frontend\src\pages\OnDuty\index.js',
  'frontend\src\components\OnDutyModal\index.js',
  'frontend\src\utils\followMeSchedule.js'
)

foreach ($file in $files) {
  $source = Join-Path $repo $file
  $dest = Join-Path $tmp $file
  $destDir = Split-Path $dest -Parent
  New-Item -ItemType Directory -Path $destDir -Force | Out-Null
  Copy-Item $source $dest -Force
}

tar -czf $archive -C $tmp .

$sec = ConvertTo-SecureString '@Ubuntu24.04' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $sec)
$session = New-SSHSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
$sftp = New-SFTPSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey

Invoke-SSHCommand -SSHSession $session -Command 'rm -rf /tmp/codex-plantao /tmp/plantao-staging.tar.gz && mkdir -p /tmp/codex-plantao' -TimeOut 120000 | Out-Null
Set-SFTPItem -SFTPSession $sftp -Path $archive -Destination '/tmp/'

$cmd = @"
set -e
tar -xzf /tmp/plantao-staging.tar.gz -C /tmp/codex-plantao
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/backend/src/controllers/UserController.ts /home/deploy/inb-staging/backend/src/controllers/UserController.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/backend/src/routes/userRoutes.ts /home/deploy/inb-staging/backend/src/routes/userRoutes.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/backend/src/services/FollowMeServices/FollowMeHelpers.ts /home/deploy/inb-staging/backend/src/services/FollowMeServices/FollowMeHelpers.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/backend/src/services/FollowMeServices/NotifyOnDutyUsersService.ts /home/deploy/inb-staging/backend/src/services/FollowMeServices/NotifyOnDutyUsersService.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/backend/src/services/UserServices/ListUsersService.ts /home/deploy/inb-staging/backend/src/services/UserServices/ListUsersService.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/backend/src/services/UserServices/UpdateUserFollowMeService.ts /home/deploy/inb-staging/backend/src/services/UserServices/UpdateUserFollowMeService.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/backend/src/services/WbotServices/ChatBotListener.ts /home/deploy/inb-staging/backend/src/services/WbotServices/ChatBotListener.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/backend/src/services/WbotServices/wbotMessageListener.ts /home/deploy/inb-staging/backend/src/services/WbotServices/wbotMessageListener.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/frontend/src/layout/MainListItems.js /home/deploy/inb-staging/frontend/src/layout/MainListItems.js
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/frontend/src/routes/index.js /home/deploy/inb-staging/frontend/src/routes/index.js
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/frontend/src/pages/OnDuty/index.js /home/deploy/inb-staging/frontend/src/pages/OnDuty/index.js
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/frontend/src/components/OnDutyModal/index.js /home/deploy/inb-staging/frontend/src/components/OnDutyModal/index.js
install -D -o deploy -g deploy -m 644 /tmp/codex-plantao/frontend/src/utils/followMeSchedule.js /home/deploy/inb-staging/frontend/src/utils/followMeSchedule.js
su - deploy -c 'cd /home/deploy/inb-staging/backend && npm run build'
su - deploy -c 'cd /home/deploy/inb-staging/frontend && npm run build'
su - deploy -c 'pm2 restart inb-staging-backend && pm2 restart inb-staging-frontend && pm2 save'
"@

$result = Invoke-SSHCommand -SSHSession $session -Command $cmd -TimeOut 1800000
$result.Output
if ($result.Error) { $result.Error }

Remove-SFTPSession -SFTPSession $sftp | Out-Null
Remove-SSHSession -SSHSession $session | Out-Null
Remove-Item $tmp -Recurse -Force
Remove-Item $archive -Force
