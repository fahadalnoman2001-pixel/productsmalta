const https = require('https');

async function test() {
  for (let i = 1; i <= 3; i++) {
    const start = Date.now();
    await new Promise((resolve) => {
      https.get(
        'https://youroffers.eu/sitemap.xml',
        { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c.toString()));
          res.on('end', () => {
            const duration = (Date.now() - start) / 1000;
            console.log(`Run ${i}: HTTP ${res.statusCode} | Time: ${duration.toFixed(3)}s | Content-Type: ${res.headers['content-type']}`);
            const matches = body.match(/<lastmod>([^<]+)<\/lastmod>/g) || [];
            console.log('  First <lastmod>:', matches[0]);
            resolve();
          });
        }
      );
    });
  }
}

test();
