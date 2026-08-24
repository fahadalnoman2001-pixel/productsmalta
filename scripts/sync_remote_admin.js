const { Client } = require("ssh2");
const bcrypt = require("bcryptjs");

const CONFIG = {
  host: "82.198.228.66",
  port: 65002,
  username: "u783286479",
  password: "Fahad@0210",
  remotePath: "/home/u783286479/domains/youroffers.eu/hbuilds/current/nodejs"
};

const DB_URL = "mysql://u783286479_bestdeals:LHG*WyH%3Bo0@127.0.0.1:3306/u783286479_bestdeals";
const SUPER_ADMIN_EMAIL = "fahadalnoman2001@gmail.com";
const SUPER_ADMIN_PASSWORD = "TasminaBinte@19";

async function main() {
  console.log("=== Syncing Remote Database Schema & Super Admin User ===");
  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  const rawScript = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: '${DB_URL}'
        }
      }
    });

    async function run() {
      console.log('1. Creating AdminLog table if not exists...');
      await prisma.$executeRawUnsafe(\`
        CREATE TABLE IF NOT EXISTS \\\`AdminLog\\\` (
          \\\`id\\\` VARCHAR(191) NOT NULL,
          \\\`adminId\\\` VARCHAR(191) NULL,
          \\\`adminEmail\\\` VARCHAR(191) NOT NULL,
          \\\`adminName\\\` VARCHAR(191) NULL,
          \\\`action\\\` VARCHAR(191) NOT NULL,
          \\\`details\\\` TEXT NULL,
          \\\`target\\\` VARCHAR(191) NULL,
          \\\`ip\\\` VARCHAR(191) NULL,
          \\\`userAgent\\\` TEXT NULL,
          \\\`createdAt\\\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\\\`id\\\`),
          INDEX \\\`AdminLog_adminEmail_idx\\\` (\\\`adminEmail\\\`),
          INDEX \\\`AdminLog_action_idx\\\` (\\\`action\\\`),
          INDEX \\\`AdminLog_createdAt_idx\\\` (\\\`createdAt\\\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      \`);
      console.log('  ✓ AdminLog table ready');

      console.log('2. Upserting Super Admin user: ${SUPER_ADMIN_EMAIL}');
      const user = await prisma.user.upsert({
        where: { email: '${SUPER_ADMIN_EMAIL}' },
        update: {
          password: '${hashedPassword}',
          role: 'super_admin',
          name: 'Super Admin'
        },
        create: {
          email: '${SUPER_ADMIN_EMAIL}',
          password: '${hashedPassword}',
          name: 'Super Admin',
          role: 'super_admin'
        }
      });
      console.log('  ✓ Super admin synced with ID:', user.id, 'Role:', user.role);

      console.log('3. Verifying all users in DB:');
      const allUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
      console.log(JSON.stringify(allUsers, null, 2));

      await prisma.$disconnect();
    }

    run().catch(err => {
      console.error('Execution Error:', err);
      process.exit(1);
    });
  `;

  const base64Code = Buffer.from(rawScript).toString("base64");

  const conn = new Client();
  conn
    .on("ready", () => {
      console.log("  ✓ SSH connected to " + CONFIG.host);
      const command = `export PATH=/usr/local/bin:/usr/bin:/bin:$PATH; export DATABASE_URL="${DB_URL}"; cd ${CONFIG.remotePath}; node -e "eval(Buffer.from('${base64Code}', 'base64').toString())"`;

      conn.exec(command, (err, stream) => {
        if (err) {
          console.error("SSH Exec Error:", err);
          conn.end();
          return;
        }

        stream.on("data", d => process.stdout.write(d.toString()));
        stream.stderr.on("data", d => process.stderr.write(d.toString()));
        stream.on("close", (code) => {
          console.log(`\n  ✓ Remote script exited with code: ${code}`);
          conn.end();
        });
      });
    })
    .on("error", err => {
      console.error("SSH Connection Error:", err);
    })
    .connect({
      host: CONFIG.host,
      port: CONFIG.port,
      username: CONFIG.username,
      password: CONFIG.password
    });
}

main().catch(console.error);
