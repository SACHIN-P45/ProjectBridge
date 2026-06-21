/**
 * Generates a premium, responsive HTML email template for ProjectBridge transactional emails.
 * 
 * @param {Object} params
 * @param {string} params.title - The main heading in the card.
 * @param {string} params.previewText - Preheader preview text.
 * @param {string} params.leadText - Descriptive text above the button.
 * @param {string} [params.btnLink] - Action button URL.
 * @param {string} [params.btnText] - Action button text.
 * @param {string} [params.icon="✉️"] - Emoji icon displayed inside the circle header.
 * @param {string} [params.securityNote] - Text for the warning/info box.
 * @param {string} [params.securityNoteType="success"] - Type of note box: 'success' (green), 'warning' (amber), 'info' (blue).
 * @param {string} [params.clientUrl] - Base client URL.
 * @returns {string} Fully styled HTML string.
 */
const getEmailTemplate = ({
  title,
  previewText,
  leadText,
  btnLink,
  btnText,
  icon = '✉️',
  securityNote,
  securityNoteType = 'success',
  clientUrl = 'http://localhost:5173'
}) => {
  // Determine color coding for security notes
  let noteBg = '#f0fdf4'; // Default green
  let noteBorder = '#22c55e';
  let noteText = '#166534';
  let noteLabel = '🔑 Security Note:';

  if (securityNoteType === 'warning') {
    noteBg = '#fffbeb'; // Amber
    noteBorder = '#f59e0b';
    noteText = '#b45309';
    noteLabel = '⚠️ Security Warning:';
  } else if (securityNoteType === 'info') {
    noteBg = '#eff6ff'; // Blue
    noteBorder = '#3b82f6';
    noteText = '#1d4ed8';
    noteLabel = '💡 Info:';
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <!-- Preview text in inbox -->
      <span style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        ${previewText}
      </span>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 100% !important;
          background-color: #f8fafc;
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        img {
          border: 0;
          outline: none;
          text-decoration: none;
        }
        table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        a {
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            padding: 20px !important;
          }
          .content-card {
            padding: 32px 20px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px 40px 10px;">
            <!-- Email Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="540" class="email-container" style="max-width: 540px; width: 100%;">
              
              <!-- Logo Section -->
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="color: #0f172a; font-family: 'Outfit', 'Inter', system-ui, sans-serif; font-size: 30px; font-weight: 800; letter-spacing: -0.8px;">
                        Project<span style="color: #6366f1;">Bridge</span>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 4px; font-size: 11px; color: #94a3b8; letter-spacing: 1.8px; text-transform: uppercase; font-weight: 700; font-family: 'Inter', sans-serif;">
                        Connect · Build · Deliver
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content Card -->
              <tr>
                <td class="content-card" style="background-color: #ffffff; border-radius: 20px; padding: 48px 40px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);">
                  
                  <!-- Icon Header -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                    <tr>
                      <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="background-color: #eff6ff; width: 72px; height: 72px; border-radius: 50%; font-size: 32px; line-height: 72px; text-align: center; vertical-align: middle; box-shadow: inset 0 2px 4px rgba(59,130,246,0.06);">
                              ${icon}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Heading -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding-bottom: 18px;">
                        <h1 style="margin: 0; font-family: 'Outfit', 'Inter', system-ui, sans-serif; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.4px;">
                          ${title}
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Lead description text -->
                    <tr>
                      <td align="center" style="padding-bottom: 28px;">
                        <p style="margin: 0; font-size: 15px; line-height: 24px; color: #475569; text-align: center; font-weight: 400;">
                          ${leadText}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Button CTA (Optional) -->
                  ${btnLink && btnText ? `
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 36px;">
                    <tr>
                      <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); box-shadow: 0 10px 20px -5px rgba(99,102,241,0.4);">
                              <a href="${btnLink}" target="_blank" style="font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 12px; display: inline-block; font-family: 'Inter', system-ui, sans-serif; letter-spacing: -0.1px;">
                                ${btnText}
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                  <!-- Alert Box (Optional) -->
                  ${securityNote ? `
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${noteBg}; border-left: 4px solid ${noteBorder}; border-radius: 4px 12px 12px 4px; margin-bottom: 32px;">
                    <tr>
                      <td style="padding: 16px 20px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="font-size: 13.5px; line-height: 22px; color: ${noteText}; font-weight: 500;">
                              <strong>${noteLabel}</strong> ${securityNote}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                  <!-- Divider & Monospace URL fallback -->
                  ${btnLink ? `
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="border-top: 1px solid #f1f5f9; padding-bottom: 28px;"></td>
                    </tr>
                  </table>

                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="left">
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8; font-weight: 500; font-family: 'Inter', sans-serif;">
                          Having trouble? Copy and paste this URL into your browser:
                        </p>
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 0; word-break: break-all;">
                          <a href="${btnLink}" target="_blank" style="font-size: 12px; line-height: 18px; color: #6366f1; font-family: Consolas, Monaco, monospace; text-decoration: none; word-break: break-all; font-weight: 500;">
                            ${btnLink}
                          </a>
                        </div>
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                </td>
              </tr>
              
              <!-- Footer Section -->
              <tr>
                <td align="center" style="padding-top: 28px; padding-bottom: 24px;">
                  <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 18px; font-family: 'Inter', sans-serif;">
                    &copy; 2026 ProjectBridge. All rights reserved.
                  </p>
                  <p style="margin: 8px 0 0 0; font-size: 11.5px; color: #cbd5e1; line-height: 18px; font-family: 'Inter', sans-serif;">
                    You are receiving this security transaction email because you are a registered user of <a href="${clientUrl}" style="color: #94a3b8; text-decoration: underline;">ProjectBridge</a>.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = {
  getEmailTemplate
};
