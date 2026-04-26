$ErrorActionPreference = 'Stop'
Import-Module Posh-SSH
$sec = ConvertTo-SecureString '@Ubuntu24.04' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential('root', $sec)
$session = New-SSHSession -ComputerName '31.97.95.41' -Credential $cred -AcceptKey
$inspectDb = @"
su - deploy -c 'cd /home/deploy/inb-staging/backend && cat > /tmp/inspect_followme.js <<'"'"'NODE'"'"'
const { Client } = require("pg");
require("dotenv").config();
(async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
  await client.connect();
  const users = await client.query('select id, name, "followMeEnabled", "followMePhone", "followMeWhatsappId", "followMeSchedule" from "Users" order by id desc limit 10');
  console.log(JSON.stringify(users.rows, null, 2));
  await client.end();
})().catch(err => { console.error(err.stack || err); process.exit(1); });
NODE
node /tmp/inspect_followme.js'
"@
$logsCmd = @"
su - deploy -c "sh -lc 'pm2 logs inb-staging-backend --lines 120 --nostream | tail -n 120'"
"@
$r1 = Invoke-SSHCommand -SSHSession $session -Command $inspectDb -TimeOut 180000
$r2 = Invoke-SSHCommand -SSHSession $session -Command $logsCmd -TimeOut 180000
$result = [PSCustomObject]@{
  DbExitStatus = $r1.ExitStatus
  DbError = ($r1.Error -join "`n")
  DbOutput = ($r1.Output -join "`n")
  LogsExitStatus = $r2.ExitStatus
  LogsError = ($r2.Error -join "`n")
  LogsOutput = ($r2.Output -join "`n")
}
$result | ConvertTo-Json -Depth 4
Remove-SSHSession -SSHSession $session | Out-Null
