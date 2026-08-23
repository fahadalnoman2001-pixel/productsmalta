const https = require('https');

function check(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c.toString()));
      res.on('end', () => {
        console.log(`\n================ URL: ${url} (Status: ${res.statusCode}) ================`);
        const htmlLang = (body.match(/<html[^>]*>/) || [''])[0];
        console.log('HTML tag:', htmlLang);

        const links = body.match(/<link[^>]*>/g) || [];
        const altLinks = links.filter(l => l.includes('rel="alternate"') || l.includes('rel="canonical"') || l.includes('hreflang'));
        console.log('Alternate & Canonical Links in <head>:\n' + altLinks.join('\n'));
        resolve();
      });
    });
  });
}

async function run() {
  await check('https://youroffers.eu/');
  await check('https://youroffers.eu/de');
  await check('https://youroffers.eu/fr/products');
  await check('https://youroffers.eu/es/about');
}

run();
