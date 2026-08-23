const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(
    `export PATH=/usr/local/bin:/usr/bin:/bin:$PATH; cd /home/u783286479/domains/youroffers.eu/hbuilds/current/nodejs; node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); Promise.all([p.product.count(), p.category.count(), p.blog.count()]).then(console.log).catch(console.error).finally(() => p['$disconnect']());"`,
    (err, stream) => {
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stderr.write(d.toString()));
      stream.on('close', () => { conn.end(); });
    }
  );
}).connect({ host: '82.198.228.66', port: 65002, username: 'u783286479', password: 'Fahad@0210' });
