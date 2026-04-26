$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH
$sec = ConvertTo-SecureString '@Ubuntu24.04' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $sec)
$session = New-SSHSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
$sftp = New-SFTPSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
Invoke-SSHCommand -SSHSession $session -Command 'mkdir -p /tmp/codex-followme-debug && rm -f /tmp/codex-followme-debug/ticket-inspect.js' -TimeOut 120000 | Out-Null
Set-SFTPItem -SFTPSession $sftp -Path 'C:\Users\Gil\Documents\CRM\cmd\ticket-inspect.js' -Destination '/tmp/codex-followme-debug/'
$cmd = @"
install -D -o deploy -g deploy -m 644 /tmp/codex-followme-debug/ticket-inspect.js /home/deploy/inb-staging/backend/ticket-inspect.js
su - deploy -c 'cd /home/deploy/inb-staging/backend && node ticket-inspect.js'
rm -f /home/deploy/inb-staging/backend/ticket-inspect.js
"@
$result = Invoke-SSHCommand -SSHSession $session -Command $cmd -TimeOut 240000
$result.Output
if ($result.Error) { $result.Error }
Remove-SFTPSession -SFTPSession $sftp | Out-Null
Remove-SSHSession -SSHSession $session | Out-Null
