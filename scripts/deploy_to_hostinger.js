const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const https = require("https");

const CONFIG = {
  host: "82.198.228.66",
  port: 65002,
  username: "u783286479",
  password: "Fahad@0210",
  remotePath: "/home/u783286479/domains/youroffers.eu/hbuilds/current/nodejs"
};

async function main() {
  console.log("=== Step 1: Packaging Standalone Output ===");
  const projectRoot = path.resolve(__dirname, "..");
  const standaloneDir = path.join(projectRoot, ".next", "standalone");
  const staticSrc = path.join(projectRoot, ".next", "static");
  const staticDest = path.join(standaloneDir, ".next", "static");
  const publicSrc = path.join(projectRoot, "public");
  const publicDest = path.join(standaloneDir, "public");
  const prismaSrc = path.join(projectRoot, "prisma");
  const prismaDest = path.join(standaloneDir, "prisma");
  const deployArchive = path.join(projectRoot, "deploy.tar.gz");

  // Copy .next/static
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
    console.log("  ✓ Copied .next/static to standalone");
  }

  // Copy public/
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
    console.log("  ✓ Copied public/ to standalone");
  }

  // Copy prisma/
  if (fs.existsSync(prismaSrc)) {
    fs.cpSync(prismaSrc, prismaDest, { recursive: true, force: true });
    console.log("  ✓ Copied prisma/ to standalone");
  }

  // Create tar.gz from inside .next/standalone
  console.log("  Compressing standalone directory into deploy.tar.gz...");
  execSync(`tar -czf "${deployArchive}" *`, { cwd: standaloneDir, stdio: "inherit" });
  const archiveStats = fs.statSync(deployArchive);
  console.log(`  ✓ Created deploy.tar.gz (${(archiveStats.size / (1024 * 1024)).toFixed(2)} MB)`);

  console.log("\n=== Step 2: Connecting to Hostinger Server via SSH/SFTP ===");
  const conn = new Client();

  conn
    .on("ready", () => {
      console.log("  ✓ SSH Connection Established to " + CONFIG.host);

      conn.sftp((err, sftp) => {
        if (err) {
          console.error("  ✗ SFTP Error:", err);
          conn.end();
          process.exit(1);
        }

        const remoteArchive = `${CONFIG.remotePath}/deploy.tar.gz`;
        console.log(`\n=== Step 3: Uploading ${deployArchive} -> ${remoteArchive} ===`);

        const readStream = fs.createReadStream(deployArchive);
        const writeStream = sftp.createWriteStream(remoteArchive);

        let uploadedBytes = 0;
        readStream.on("data", chunk => {
          uploadedBytes += chunk.length;
          const percent = ((uploadedBytes / archiveStats.size) * 100).toFixed(1);
          process.stdout.write(`\r  Uploading... ${percent}% (${(uploadedBytes / (1024 * 1024)).toFixed(1)} MB)`);
        });

        writeStream.on("close", () => {
          console.log("\n  ✓ Upload complete!");

          console.log("\n=== Step 4: Extracting & Restarting on Hostinger ===");
          const remoteCommands = [
            `export PATH=/usr/local/bin:/usr/bin:/bin:$PATH`,
            `cd "${CONFIG.remotePath}"`,
            `/usr/bin/tar -xzf deploy.tar.gz`,
            `chmod -R +x node_modules/@prisma/engines/* 2>/dev/null || true`,
            `chmod -R +x node_modules/.prisma/client/* 2>/dev/null || true`,
            `mkdir -p tmp`,
            `touch tmp/restart.txt`,
            `pkill -f "next-server" || true`
          ].join(" && ");

          conn.exec(remoteCommands, (execErr, stream) => {
            if (execErr) {
              console.error("  ✗ Remote execution error:", execErr);
              conn.end();
              process.exit(1);
            }

            stream
              .on("close", (code, signal) => {
                console.log(`  ✓ Extraction and Passenger reload completed with code ${code}`);
                conn.end();

                console.log("\n=== Step 5: Verifying Live Endpoints ===");
                setTimeout(() => {
                  verifyEndpoints();
                }, 5000);
              })
              .on("data", data => {
                process.stdout.write(data.toString());
              })
              .stderr.on("data", data => {
                process.stderr.write(data.toString());
              });
          });
        });

        readStream.pipe(writeStream);
      });
    })
    .on("error", err => {
      console.error("  ✗ SSH Connection Error:", err);
      process.exit(1);
    })
    .connect({
      host: CONFIG.host,
      port: CONFIG.port,
      username: CONFIG.username,
      password: CONFIG.password,
      readyTimeout: 30000
    });
}

function checkUrl(url) {
  return new Promise(resolve => {
    https
      .get(url, res => {
        let body = "";
        res.on("data", chunk => (body += chunk.toString()));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      })
      .on("error", err => {
        resolve({ statusCode: 0, error: err.message });
      });
  });
}

async function verifyEndpoints() {
  const tests = [
    { name: "English Root (/)", url: "https://youroffers.eu/" },
    { name: "German Home (/de)", url: "https://youroffers.eu/de" },
    { name: "French Products (/fr/products)", url: "https://youroffers.eu/fr/products" },
    { name: "Spanish Blog (/es/blog)", url: "https://youroffers.eu/es/blog" },
    { name: "German About (/de/about)", url: "https://youroffers.eu/de/about" },
    { name: "Spanish Contact (/es/contact)", url: "https://youroffers.eu/es/contact" },
    { name: "Sitemap XML (/sitemap.xml)", url: "https://youroffers.eu/sitemap.xml" },
    { name: "Admin Login (/admin/login)", url: "https://youroffers.eu/admin/login" }
  ];

  for (const t of tests) {
    const res = await checkUrl(t.url);
    const hasHtmlLang = res.body && /<html[^>]*lang="([^"]*)"/i.exec(res.body);
    const lang = hasHtmlLang ? hasHtmlLang[1] : "N/A";
    const hasHreflang = res.body && res.body.includes('hreflang="');

    if (res.statusCode === 200) {
      console.log(`  ✓ [${res.statusCode}] ${t.name} -> <html lang="${lang}">, hreflang: ${hasHreflang ? "YES" : "NO"}`);
    } else {
      console.log(`  ⚠ [${res.statusCode}] ${t.name} (${res.error || "Non-200 status"})`);
    }
  }

  console.log("\n=== Deployment and Verification Complete! ===");
}

main().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
