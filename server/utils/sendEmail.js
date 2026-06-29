const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Use Resend HTTP API if configured (Highly recommended for Render / Serverless)
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${process.env.EMAIL_FROM_NAME || 'ProjectBridge'} <${fromEmail}>`,
          to: [options.to],
          subject: options.subject,
          text: options.text,
          html: options.html,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }

      console.log(`✉️ Email successfully sent via Resend HTTP API to ${options.to}`);
      return;
    } catch (err) {
      console.error('❌ Resend HTTP API Error:', err.message);
      console.log('🔄 Falling back to SMTP...');
    }
  }

  // 2. Fallback to SMTP
  const isSmtpConfigured = 
    process.env.EMAIL_HOST && 
    process.env.EMAIL_PORT && 
    process.env.EMAIL_USER && 
    process.env.EMAIL_PASS;

  if (!isSmtpConfigured) {
    console.log('\n==================================================');
    console.log('📬 [EMAIL SIMULATION] SMTP / Resend Credentials Not Configured');
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.text}`);
    console.log('==================================================\n');
    return;
  }

  // Create transporter
  const port = parseInt(process.env.EMAIL_PORT, 10);
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: port,
    secure: secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'ProjectBridge'} <${process.env.EMAIL_FROM || 'noreply@projectbridge.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully sent via SMTP to ${options.to}`);
  } catch (err) {
    console.error('❌ Nodemailer Error sending email:', err);
    throw err;
  }
};

module.exports = sendEmail;
