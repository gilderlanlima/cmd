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
  const ticket = await client.query(`
    select t.id, t.status, t."unreadMessages", t."whatsappId", t."contactId", t."userId", t."queueId", t."updatedAt", c.name as contact_name, c.number as contact_number
    from "Tickets" t
    left join "Contacts" c on c.id = t."contactId"
    where t.id = 86
  `);
  console.log(JSON.stringify(ticket.rows, null, 2));
  await client.end();
})().catch(err => {
  console.error(err.stack || err);
  process.exit(1);
});
