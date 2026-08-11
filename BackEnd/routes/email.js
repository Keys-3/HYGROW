import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

console.log('[EMAIL ROUTE INIT] SMTP_HOST is:', process.env.SMTP_HOST);

// Configure the transport
// For production, you should use environment variables like process.env.SMTP_HOST
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'bernadette.kassulke43@ethereal.email',
    pass: process.env.SMTP_PASS || 'TebS87t9bXk9aPSt1x'
  }
});

// Since we are using ethereal email as fallback, let's create a test account if env vars are missing
// Note: In a real production app, you'd throw an error if SMTP env vars are missing.
let currentTransporter = transporter;
if (!process.env.SMTP_HOST) {
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error('Failed to create a testing account. ' + err.message);
      return;
    }
    currentTransporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
    console.log(`Created Ethereal test account: ${account.user}`);
  });
}

router.post('/send', async (req, res) => {
  const { to, subject, text, replyTo, cc, attachments } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ message: 'Missing required fields: to, subject, or text' });
  }

  try {
    console.log(`[EMAIL ROUTE] Sending email to: ${to}, with Subject: ${subject}`);
    const info = await currentTransporter.sendMail({
      from: '"Farm Help App" <noreply@farmhelp.app>',
      to,
      cc: cc || undefined,
      replyTo: replyTo || undefined,
      subject,
      text,
      attachments: attachments || undefined,
    });

    console.log('Message sent: %s', info.messageId);
    
    // Preview only available when sending through an Ethereal account
    if (!process.env.SMTP_HOST) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('[EMAIL ROUTE] Successfully sent via production SMTP to: ', to);
    }

    res.status(200).json({ message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

export default router;
