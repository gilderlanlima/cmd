$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH
$sec = ConvertTo-SecureString '@Ubuntu24.04' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $sec)
$session = New-SSHSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
$sftp = New-SFTPSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
Invoke-SSHCommand -SSHSession $session -Command 'mkdir -p /tmp/codex-hotfix-plans && rm -f /tmp/codex-hotfix-plans/index.js' -TimeOut 120000 | Out-Null
Set-SFTPItem -SFTPSession $sftp -Path 'C:\Users\Gil\Documents\CRM\cmd\frontend\src\components\PlansManager\index.js' -Destination '/tmp/codex-hotfix-plans/'
$cmd = @"
install -D -o deploy -g deploy -m 644 /tmp/codex-hotfix-plans/index.js /home/deploy/inb-staging/frontend/src/components/PlansManager/index.js
su - deploy -c 'cd /home/deploy/inb-staging/frontend && npm run build'
su - deploy -c 'pm2 restart inb-staging-frontend && pm2 save'
"@
$result = Invoke-SSHCommand -SSHSession $session -Command $cmd -TimeOut 1200000
$result.Output
if ($result.Error) { $result.Error }
Remove-SFTPSession -SFTPSession $sftp | Out-Null
Remove-SSHSession -SSHSession $session | Out-Null
