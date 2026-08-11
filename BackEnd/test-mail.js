import "dotenv/config";
import nodemailer from "nodemailer";

async function main() {
  console.log("Using SMTP_HOST:", process.env.SMTP_HOST);
  console.log("Using SMTP_USER:", process.env.SMTP_USER);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER || 'bernadette.kassulke43@ethereal.email',
      pass: process.env.SMTP_PASS || 'TebS87t9bXk9aPSt1x'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Farm Help App" <noreply@farmhelp.app>',
      to: "prithvis3804@gmail.com",
      subject: "Test email from Antigravity",
      text: "This is a test email.",
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error sending mail:", err);
  }
}

main();
