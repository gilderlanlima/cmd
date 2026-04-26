$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH
$sec = ConvertTo-SecureString '@Ubuntu24.04' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $sec)
$session = New-SSHSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
$sftp = New-SFTPSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
Invoke-SSHCommand -SSHSession $session -Command 'mkdir -p /tmp/codex-settings-perf && rm -f /tmp/codex-settings-perf/settings-index.js /tmp/codex-settings-perf/plans-index.js /tmp/codex-settings-perf/SocketWorker.js' -TimeOut 120000 | Out-Null
Copy-Item 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\pages\Settings\index.js' 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\pages\Settings\settings-index.js' -Force
Copy-Item 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\components\PlansManager\index.js' 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\components\PlansManager\plans-index.js' -Force
Set-SFTPItem -SFTPSession $sftp -Path 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\pages\Settings\settings-index.js' -Destination '/tmp/codex-settings-perf/'
Set-SFTPItem -SFTPSession $sftp -Path 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\components\PlansManager\plans-index.js' -Destination '/tmp/codex-settings-perf/'
Set-SFTPItem -SFTPSession $sftp -Path 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\services\SocketWorker.js' -Destination '/tmp/codex-settings-perf/'
Remove-Item 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\pages\Settings\settings-index.js' -Force
Remove-Item 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\components\PlansManager\plans-index.js' -Force
$cmd = @"
install -D -o deploy -g deploy -m 644 /tmp/codex-settings-perf/settings-index.js /home/deploy/inb-staging/frontend/src/pages/Settings/index.js
install -D -o deploy -g deploy -m 644 /tmp/codex-settings-perf/plans-index.js /home/deploy/inb-staging/frontend/src/components/PlansManager/index.js
install -D -o deploy -g deploy -m 644 /tmp/codex-settings-perf/SocketWorker.js /home/deploy/inb-staging/frontend/src/services/SocketWorker.js
su - deploy -c 'cd /home/deploy/inb-staging/frontend && npm run build'
su - deploy -c 'pm2 restart inb-staging-frontend && pm2 save'
"@
$result = Invoke-SSHCommand -SSHSession $session -Command $cmd -TimeOut 1200000
$result.Output
if ($result.Error) { $result.Error }
Remove-SFTPSession -SFTPSession $sftp | Out-Null
Remove-SSHSession -SSHSession $session | Out-Null
