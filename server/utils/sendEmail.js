const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if SMTP is configured
  const isSmtpConfigured = 
    process.env.EMAIL_HOST && 
    process.env.EMAIL_PORT && 
    process.env.EMAIL_USER && 
    process.env.EMAIL_PASS;

  if (!isSmtpConfigured) {
    console.log('\n==================================================');
    console.log('📬 [EMAIL SIMULATION] SMTP Credentials Not Configured');
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.text}`);
    console.log('==================================================\n');
    
    if (options.html) {
      try {
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(path.join(__dirname, '..', 'email-preview.html'), options.html);
        console.log(`📝 Local HTML preview saved to server/email-preview.html`);
      } catch (err) {
        console.error('Failed to write email-preview.html:', err);
      }
    }
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
    // For Gmail we might need this to avoid self-signed certificate errors:
    tls: {
      rejectUnauthorized: false
    }
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
    console.log(`✉️ Email successfully sent to ${options.to}`);
  } catch (err) {
    console.error('❌ Nodemailer Error sending email:', err);
    throw err;
  }
};

module.exports = sendEmail;
