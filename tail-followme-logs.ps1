$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH
$sec = ConvertTo-SecureString '@Ubuntu24.04' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $sec)
$session = New-SSHSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
$cmd = @"
su - deploy -c "sh -lc 'pm2 logs inb-staging-backend --lines 300 --nostream > /tmp/followme_pm2.log 2>&1; grep -F \"[FOLLOW ME]\" /tmp/followme_pm2.log || true'"
"@
$result = Invoke-SSHCommand -SSHSession $session -Command $cmd -TimeOut 240000
$result.Output
if ($result.Error) { $result.Error }
Remove-SSHSession -SSHSession $session | Out-Null
