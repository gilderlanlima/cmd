$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH
$sec = ConvertTo-SecureString '@Ubuntu24.04' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $sec)
$session = New-SSHSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
$sftp = New-SFTPSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
Invoke-SSHCommand -SSHSession $session -Command 'mkdir -p /tmp/codex-followme-selection && rm -f /tmp/codex-followme-selection/NotifyOnDutyUsersService.ts /tmp/codex-followme-selection/ChatBotListener.ts /tmp/codex-followme-selection/FollowMeHelpers.ts' -TimeOut 120000 | Out-Null
Set-SFTPItem -SFTPSession $sftp -Path 'C:\Users\Gil\Documents\CRM\cmd\backend\src\services\FollowMeServices\NotifyOnDutyUsersService.ts' -Destination '/tmp/codex-followme-selection/'
Set-SFTPItem -SFTPSession $sftp -Path 'C:\Users\Gil\Documents\CRM\cmd\backend\src\services\WbotServices\ChatBotListener.ts' -Destination '/tmp/codex-followme-selection/'
Set-SFTPItem -SFTPSession $sftp -Path 'C:\Users\Gil\Documents\CRM\cmd\backend\src\services\FollowMeServices\FollowMeHelpers.ts' -Destination '/tmp/codex-followme-selection/'
$cmd = @"
install -D -o deploy -g deploy -m 644 /tmp/codex-followme-selection/NotifyOnDutyUsersService.ts /home/deploy/inb-staging/backend/src/services/FollowMeServices/NotifyOnDutyUsersService.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-followme-selection/ChatBotListener.ts /home/deploy/inb-staging/backend/src/services/WbotServices/ChatBotListener.ts
install -D -o deploy -g deploy -m 644 /tmp/codex-followme-selection/FollowMeHelpers.ts /home/deploy/inb-staging/backend/src/services/FollowMeServices/FollowMeHelpers.ts
su - deploy -c 'cd /home/deploy/inb-staging/backend && npm run build'
su - deploy -c 'pm2 restart inb-staging-backend && pm2 save'
"@
$result = Invoke-SSHCommand -SSHSession $session -Command $cmd -TimeOut 900000
$result.Output
if ($result.Error) { $result.Error }
Remove-SFTPSession -SFTPSession $sftp | Out-Null
Remove-SSHSession -SSHSession $session | Out-Null
