const { Client } = require("pg");
require("dotenv").config({ path: "/home/deploy/inb-staging/backend/.env" });
(async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  await client.connect();
  const users = await client.query(`
    select id, name, email, "followMeEnabled", "followMePhone", "followMeWhatsappId", "followMeSchedule"
    from "Users"
    where "followMeEnabled" = true
    order by id desc
  `);
  const whatsapps = await client.query(`
    select id, name, number, status
    from "Whatsapps"
    order by id asc
  `);
  console.log(JSON.stringify({ users: users.rows, whatsapps: whatsapps.rows }, null, 2));
  await client.end();
})().catch(err => {
  console.error(err.stack || err);
  process.exit(1);
});
