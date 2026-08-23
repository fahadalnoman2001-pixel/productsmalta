const https = require('https');

async function testSitemap() {
  console.log('=== 1. Inspecting Sitemap XML Head & Trailing Slash on Homepage ===');
  await new Promise((resolve) => {
    https.get('https://youroffers.eu/sitemap.xml', (res) => {
      let body = '';
      res.on('data', (c) => (body += c.toString()));
      res.on('end', () => {
        console.log('Content-Type:', res.headers['content-type']);
        console.log('First 15 lines:\n' + body.split('\n').slice(0, 15).join('\n'));
        resolve();
      });
    });
  });

  console.log('\n=== 2. Testing Stability & Response Time across 4 fetches ===');
  for (let i = 1; i <= 4; i++) {
    const start = Date.now();
    await new Promise((resolve) => {
      https.get(
        'https://youroffers.eu/sitemap.xml',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
          }
        },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c.toString()));
          res.on('end', () => {
            const duration = (Date.now() - start) / 1000;
            const firstLastMod = (body.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
            const totalUrls = (body.match(/<url>/g) || []).length;
            console.log(
              `Fetch ${i}: HTTP ${res.statusCode} | Time: ${duration.toFixed(3)}s | Total URLs: ${totalUrls} | First lastmod: ${firstLastMod}`
            );
            resolve();
          });
        }
      );
    });
  }
}

testSitemap();
