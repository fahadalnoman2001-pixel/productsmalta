const { Client } = require("ssh2");

const CONFIG = {
  host: "82.198.228.66",
  port: 65002,
  username: "u783286479",
  password: "Fahad@0210",
  remotePath: "/home/u783286479/domains/youroffers.eu/hbuilds/current/nodejs"
};

const DB_URL = "mysql://u783286479_bestdeals:LHG*WyH%3Bo0@127.0.0.1:3306/u783286479_bestdeals";

async function main() {
  console.log("=== Syncing Remote Database Schema: AdminVerificationCode ===");

  const rawScript = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: { db: { url: '${DB_URL}' } }
    });

    async function run() {
      console.log('1. Creating AdminVerificationCode table if not exists...');
      await prisma.$executeRawUnsafe(\`
        CREATE TABLE IF NOT EXISTS \\\`AdminVerificationCode\\\` (
          \\\`id\\\` VARCHAR(191) NOT NULL,
          \\\`code\\\` VARCHAR(32) NOT NULL,
          \\\`targetEmail\\\` VARCHAR(191) NOT NULL,
          \\\`targetName\\\` VARCHAR(191) NULL,
          \\\`targetPassword\\\` TEXT NOT NULL,
          \\\`targetRole\\\` VARCHAR(191) NOT NULL DEFAULT 'admin',
          \\\`requestedBy\\\` VARCHAR(191) NOT NULL,
          \\\`sentToEmail\\\` VARCHAR(191) NOT NULL,
          \\\`expiresAt\\\` DATETIME(3) NOT NULL,
          \\\`usedAt\\\` DATETIME(3) NULL,
          \\\`createdAt\\\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\\\`id\\\`),
          INDEX \\\`AdminVerificationCode_code_idx\\\` (\\\`code\\\`),
          INDEX \\\`AdminVerificationCode_targetEmail_idx\\\` (\\\`targetEmail\\\`),
          INDEX \\\`AdminVerificationCode_expiresAt_idx\\\` (\\\`expiresAt\\\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      \`);
      console.log('  ✓ AdminVerificationCode table ready on remote DB');

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
