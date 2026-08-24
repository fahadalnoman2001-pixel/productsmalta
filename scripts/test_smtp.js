const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "noreplay@youroffers.eu",
    pass: "R0d|>0;V&"
  }
});

async function test() {
  console.log("Verifying SMTP connection to smtp.hostinger.com:465...");
  await transporter.verify();
  console.log("✓ SMTP Server is ready to send messages!");
}

test().catch(err => {
  console.error("✗ SMTP Error:", err);
});
