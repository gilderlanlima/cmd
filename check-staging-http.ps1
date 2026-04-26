$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH
$sec = ConvertTo-SecureString '@Ubuntu24.04' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $sec)
$session = New-SSHSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
$cmd = "curl -I -s http://127.0.0.1:3001/login | head -n 1"
$result = Invoke-SSHCommand -SSHSession $session -Command $cmd -TimeOut 120000
$result.Output
Remove-SSHSession -SSHSession $session | Out-Null
