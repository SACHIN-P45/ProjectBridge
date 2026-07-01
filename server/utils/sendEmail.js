const nodemailer = require('nodemailer');
const https = require('https');

// Helper function to make secure HTTPS requests with a strict timeout
const makeHttpsRequest = (url, options, body, timeoutMs = 6000) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      method: options.method || 'POST',
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: options.headers || {},
      timeout: timeoutMs
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          statusCode: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Connection timed out after ${timeoutMs}ms`));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
};

const sendEmail = async (options) => {
  // 1. Use Brevo (Sendinblue) HTTP API if configured
  if (process.env.BREVO_API_KEY) {
    try {
      console.log('⚡ Attempting to send email via Brevo HTTP API...');
      const response = await makeHttpsRequest('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        }
      }, {
        sender: {
          name: process.env.EMAIL_FROM_NAME || 'ProjectBridge',
          email: process.env.EMAIL_FROM || 'placementportal2026@gmail.com'
        },
        to: [{ email: options.to }],
        subject: options.subject,
        textContent: options.text,
        htmlContent: options.html
      });

      if (!response.ok) {
        throw new Error(`Brevo API returned status ${response.statusCode}: ${response.body}`);
      }

      console.log(`✉️ Email successfully sent via Brevo to ${options.to}`);
      return;
    } catch (err) {
      console.error('❌ Brevo HTTP API Error:', err.message);
      console.log('🔄 Falling back to other providers...');
    }
  }

  // 2. Use Resend HTTP API if configured
  if (process.env.RESEND_API_KEY) {
    try {
      console.log('⚡ Attempting to send email via Resend HTTP API...');
      const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      const response = await makeHttpsRequest('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        }
      }, {
        from: `${process.env.EMAIL_FROM_NAME || 'ProjectBridge'} <${fromEmail}>`,
        to: [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      if (!response.ok) {
        throw new Error(`Resend API returned status ${response.statusCode}: ${response.body}`);
      }

      console.log(`✉️ Email successfully sent via Resend to ${options.to}`);
      return;
    } catch (err) {
      console.error('❌ Resend HTTP API Error:', err.message);
      console.log('🔄 Falling back to other providers...');
    }
  }

  // 3. Use SendGrid HTTP API if configured
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log('⚡ Attempting to send email via SendGrid HTTP API...');
      const response = await makeHttpsRequest('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
        }
      }, {
        personalizations: [{ to: [{ email: options.to }] }],
        from: {
          email: process.env.EMAIL_FROM || 'placementportal2026@gmail.com',
          name: process.env.EMAIL_FROM_NAME || 'ProjectBridge'
        },
        subject: options.subject,
        content: [
          { type: 'text/plain', value: options.text },
          { type: 'text/html', value: options.html }
        ]
      });

      if (!response.ok) {
        throw new Error(`SendGrid API returned status ${response.statusCode}: ${response.body}`);
      }

      console.log(`✉️ Email successfully sent via SendGrid to ${options.to}`);
      return;
    } catch (err) {
      console.error('❌ SendGrid HTTP API Error:', err.message);
      console.log('🔄 Falling back to other providers...');
    }
  }

  // 4. Fallback to Nodemailer SMTP (e.g. Gmail SMTP for Localhost development)
  const isSmtpConfigured = 
    process.env.EMAIL_HOST && 
    process.env.EMAIL_PORT && 
    process.env.EMAIL_USER && 
    process.env.EMAIL_PASS;

  if (!isSmtpConfigured) {
    console.log('\n==================================================');
    console.log('📬 [EMAIL SIMULATION] SMTP / HTTP Credentials Not Configured');
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.text}`);
    console.log('==================================================\n');
    return;
  }

  console.log('⚡ Attempting to send email via Nodemailer SMTP...');
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
    connectionTimeout: 4000, // Fail fast (4s) if Render blocks the port, instead of hanging
    greetingTimeout: 4000,
    socketTimeout: 5000
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
    console.error('❌ Nodemailer SMTP Error sending email:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
