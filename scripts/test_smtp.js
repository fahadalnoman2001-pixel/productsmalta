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
  console.log("1. Verifying SMTP connection to smtp.hostinger.com:465...");
  await transporter.verify();
  console.log("  ✓ SMTP connection verified!");

  console.log("2. Sending test email with structured sender...");
  const info = await transporter.sendMail({
    from: {
      name: "YourOffers Security",
      address: "noreplay@youroffers.eu"
    },
    to: "fahadalnoman2001@gmail.com",
    subject: "🔐 [Test] Confirmation Code: 1234567890",
    text: "Test email from YourOffers.eu",
    html: "<b>Test email from YourOffers.eu</b>"
  });

  console.log("  ✓ Test email sent successfully! Message ID:", info.messageId);
}

test().catch(err => {
  console.error("✗ SMTP Send Error:", err);
});
