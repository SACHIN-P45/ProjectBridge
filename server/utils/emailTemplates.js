/**
 * ProjectBridge — Premium Transactional Email Templates
 * Each export is a function that returns { subject, html, text }
 */

/* ─────────────────────────────────────────────
   BASE LAYOUT  (dark-capable, inbox-tested)
───────────────────────────────────────────── */
const base = ({ previewText = '', accentColor = '#6366f1', accentLight = '#eff6ff', icon, badge, badgeColor = '#6366f1', title, bodyHtml, footerHtml = '', clientUrl = process.env.CLIENT_URL || 'http://localhost:5173' }) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>ProjectBridge</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <!-- Preview text (hidden) -->
  <div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
    body{margin:0;padding:0;width:100%!important;background:#f1f5f9}
    @media only screen and (max-width:620px){
      .wrap{width:100%!important;padding:0 16px!important}
      .card{border-radius:16px!important;padding:32px 20px!important}
      .hero-icon{width:64px!important;height:64px!important;font-size:28px!important;line-height:64px!important}
      .title{font-size:20px!important}
      .cta-btn{padding:14px 28px!important;font-size:14px!important}
      .info-row td{display:block!important;width:100%!important;border-bottom:1px solid #f1f5f9!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Inter',system-ui,-apple-system,sans-serif;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#f1f5f9;">
<tr><td align="center" style="padding:40px 10px;">

  <table class="wrap" border="0" cellpadding="0" cellspacing="0" width="580" style="max-width:580px;width:100%;">

    <!-- HEADER LOGO -->
    <tr><td align="center" style="padding-bottom:28px;">
      <a href="${clientUrl}" style="text-decoration:none;">
        <span style="font-family:'Outfit','Inter',sans-serif;font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-0.6px;">
          Project<span style="color:${accentColor};">Bridge</span>
        </span><br>
        <span style="font-size:10px;color:#94a3b8;letter-spacing:2.5px;text-transform:uppercase;font-weight:700;">Connect · Build · Deliver</span>
      </a>
    </td></tr>

    <!-- CARD -->
    <tr><td class="card" style="background:#ffffff;border-radius:24px;padding:48px 40px;border:1px solid #e2e8f0;box-shadow:0 4px 6px -1px rgba(0,0,0,0.04),0 20px 40px -10px rgba(0,0,0,0.06);">

      <!-- HERO ICON -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
      <tr><td align="center">
        <div class="hero-icon" style="display:inline-block;width:80px;height:80px;border-radius:50%;background:${accentLight};line-height:80px;text-align:center;font-size:36px;vertical-align:middle;">
          ${icon}
        </div>
        ${badge ? `<br><span style="display:inline-block;margin-top:14px;padding:4px 14px;border-radius:999px;background:${badgeColor}1a;border:1px solid ${badgeColor}33;font-size:11px;font-weight:700;color:${badgeColor};letter-spacing:1.2px;text-transform:uppercase;">${badge}</span>` : ''}
      </td></tr>
      </table>

      ${bodyHtml}

      ${footerHtml}

    </td></tr>

    <!-- FOOTER -->
    <tr><td align="center" style="padding-top:24px;padding-bottom:8px;">
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:20px;">
        &copy; 2026 ProjectBridge. All rights reserved.<br>
        <a href="${clientUrl}" style="color:#94a3b8;text-decoration:underline;">Visit Platform</a>
        &nbsp;·&nbsp;
        <a href="${clientUrl}/settings" style="color:#94a3b8;text-decoration:underline;">Notification Settings</a>
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>
`;

/* Reusable building blocks */
const heading = (text) =>
  `<h1 class="title" style="margin:0 0 14px;font-family:'Outfit','Inter',sans-serif;font-size:24px;font-weight:800;color:#0f172a;letter-spacing:-0.4px;text-align:center;">${text}</h1>`;

const para = (text) =>
  `<p style="margin:0 0 22px;font-size:15px;line-height:26px;color:#475569;text-align:center;">${text}</p>`;

const ctaBtn = (link, text, bg = '#6366f1') =>
  `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
  <tr><td align="center">
    <a class="cta-btn" href="${link}" target="_blank" style="display:inline-block;padding:16px 40px;background:${bg};color:#ffffff;font-size:15px;font-weight:700;border-radius:12px;text-decoration:none;font-family:'Inter',sans-serif;letter-spacing:-0.1px;box-shadow:0 8px 20px ${bg}55;">
      ${text}
    </a>
  </td></tr>
  </table>`;

const infoTable = (rows, accentColor = '#6366f1') =>
  `<table border="0" cellpadding="0" cellspacing="0" width="100%" class="info-row" style="background:#f8fafc;border-radius:14px;margin-bottom:28px;overflow:hidden;border:1px solid #e2e8f0;">
  ${rows.map(([label, value], i) => `
  <tr style="${i > 0 ? 'border-top:1px solid #f1f5f9;' : ''}">
    <td style="padding:14px 20px;font-size:12.5px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;width:40%;">${label}</td>
    <td style="padding:14px 20px;font-size:14px;font-weight:600;color:#0f172a;text-align:right;">${value}</td>
  </tr>`).join('')}
  </table>`;

const alertBox = (text, type = 'info') => {
  const palette = {
    success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', label: '✅' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', label: '⚠️' },
    info:    { bg: '#eff6ff', border: '#6366f1', text: '#1e40af', label: '💡' },
    danger:  { bg: '#fff1f2', border: '#ef4444', text: '#991b1b', label: '🚨' },
  }[type] || palette.info;
  return `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${palette.bg};border-left:4px solid ${palette.border};border-radius:4px 14px 14px 4px;margin-bottom:28px;">
  <tr><td style="padding:16px 20px;font-size:13.5px;line-height:22px;color:${palette.text};font-weight:500;">
    ${palette.label} ${text}
  </td></tr>
  </table>`;
};

const divider = () =>
  `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;"><tr><td style="border-top:1px solid #f1f5f9;"></td></tr></table>`;

/* ═══════════════════════════════════════════════════════════
   1. DEVELOPER SUBMITS BID  →  student gets notified
═══════════════════════════════════════════════════════════ */
const newBidEmail = ({ studentName, projectTitle, developerName, bidAmount, deliveryDays, proposal, viewLink, clientUrl }) => ({
  subject: `💼 New Bid Received on "${projectTitle}"`,
  text: `Hi ${studentName}, ${developerName} submitted a bid of ₹${bidAmount.toLocaleString()} (${deliveryDays} days) on your project "${projectTitle}". Review it: ${viewLink}`,
  html: base({
    previewText: `${developerName} just bid ₹${bidAmount.toLocaleString()} on "${projectTitle}"`,
    accentColor: '#6366f1',
    accentLight: '#eff6ff',
    icon: '💼',
    badge: 'New Bid Received',
    badgeColor: '#6366f1',
    clientUrl,
    bodyHtml: `
      ${heading(`You got a new bid, ${studentName}!`)}
      ${para(`<strong>${developerName}</strong> has submitted a proposal on your project. Review their bid and decide if it's the right fit.`)}
      ${infoTable([
        ['Project', `<span style="color:#6366f1;">${projectTitle}</span>`],
        ['Developer', developerName],
        ['Bid Amount', `<span style="color:#22c55e;font-size:16px;">₹${Number(bidAmount).toLocaleString()}</span>`],
        ['Delivery', `${deliveryDays} Days`],
      ])}
      ${proposal ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Proposal Snippet</p>
        <p style="margin:0;font-size:14px;line-height:22px;color:#334155;font-style:italic;">"${proposal.slice(0, 180)}${proposal.length > 180 ? '…' : ''}"</p>
      </div>` : ''}
      ${ctaBtn(viewLink, 'Review This Bid →')}
      ${alertBox('You can accept or decline bids from your project dashboard. Once accepted, work begins immediately.', 'info')}
    `,
  }),
});

/* ═══════════════════════════════════════════════════════════
   2. STUDENT ACCEPTS BID  →  developer gets notified
═══════════════════════════════════════════════════════════ */
const bidAcceptedEmail = ({ developerName, projectTitle, studentName, bidAmount, deliveryDays, dashboardLink, clientUrl }) => ({
  subject: `🎉 Your bid was accepted! — "${projectTitle}"`,
  text: `Congratulations ${developerName}! ${studentName} accepted your bid of ₹${bidAmount.toLocaleString()} for "${projectTitle}". Delivery in ${deliveryDays} days. Dashboard: ${dashboardLink}`,
  html: base({
    previewText: `🎉 ${studentName} accepted your bid on "${projectTitle}"! Time to get to work.`,
    accentColor: '#22c55e',
    accentLight: '#f0fdf4',
    icon: '🎉',
    badge: 'Bid Accepted',
    badgeColor: '#22c55e',
    clientUrl,
    bodyHtml: `
      ${heading(`Congratulations, ${developerName}!`)}
      ${para(`<strong>${studentName}</strong> accepted your bid on <strong>"${projectTitle}"</strong>. Your chat room is ready — start collaborating now!`)}
      ${infoTable([
        ['Project', `<span style="color:#6366f1;">${projectTitle}</span>`],
        ['Client', studentName],
        ['Your Fee', `<span style="color:#22c55e;font-size:16px;">₹${Number(bidAmount).toLocaleString()}</span>`],
        ['Deadline', `${deliveryDays} Days`],
        ['Status', '<span style="color:#22c55e;font-weight:700;">● In Progress</span>'],
      ], '#22c55e')}
      ${ctaBtn(dashboardLink, 'Go to My Dashboard →', '#22c55e')}
      ${alertBox('Payment is held in escrow by ProjectBridge and will be released once you deliver the project and the student approves it.', 'success')}
    `,
  }),
});

/* ═══════════════════════════════════════════════════════════
   3. STUDENT PAYS (initial 50%)  →  developer gets notified
═══════════════════════════════════════════════════════════ */
const paymentReceivedEmail = ({ developerName, projectTitle, amount, paymentType, dashboardLink, clientUrl }) => {
  const isFirst = paymentType === 'first_50';
  return {
    subject: isFirst ? `💰 Initial payment received — "${projectTitle}"` : `🏆 Final payment released — "${projectTitle}"`,
    text: `Hi ${developerName}, you received ₹${amount.toLocaleString()} ${isFirst ? '(initial 50%)' : '(final 50%)'} for "${projectTitle}".`,
    html: base({
      previewText: `₹${amount.toLocaleString()} ${isFirst ? 'initial payment' : 'final payment'} received for "${projectTitle}"`,
      accentColor: '#f59e0b',
      accentLight: '#fffbeb',
      icon: isFirst ? '💰' : '🏆',
      badge: isFirst ? '50% Milestone Paid' : 'Project Complete!',
      badgeColor: isFirst ? '#f59e0b' : '#22c55e',
      clientUrl,
      bodyHtml: `
        ${heading(isFirst ? `Payment Received, ${developerName}!` : `Project Complete! 🏆`)}
        ${para(isFirst
          ? `The initial <strong>50% payment of ₹${amount.toLocaleString()}</strong> for <strong>"${projectTitle}"</strong> is now held in escrow. Start building!`
          : `The final <strong>50% payment of ₹${amount.toLocaleString()}</strong> has been released. Both milestones completed for <strong>"${projectTitle}"</strong>!`
        )}
        ${infoTable([
          ['Project', `<span style="color:#6366f1;">${projectTitle}</span>`],
          ['Amount', `<span style="color:#f59e0b;font-size:16px;">₹${Number(amount).toLocaleString()}</span>`],
          ['Milestone', isFirst ? '1st Payment (50%)' : '2nd Payment (50%)'],
          ['Escrow Status', isFirst ? '<span style="color:#f59e0b;">● Held in Escrow</span>' : '<span style="color:#22c55e;">● Released to You</span>'],
        ], '#f59e0b')}
        ${ctaBtn(dashboardLink, isFirst ? 'Start Working →' : 'View Earnings →', isFirst ? '#f59e0b' : '#22c55e')}
        ${alertBox(
          isFirst
            ? 'This payment is held securely in escrow. Deliver quality work, upload source code, and request final payment.'
            : 'Congratulations on completing another project! Your reputation score has been updated.',
          isFirst ? 'warning' : 'success'
        )}
      `,
    }),
  };
};

/* ═══════════════════════════════════════════════════════════
   4. STUDENT PAYS  →  student gets confirmation receipt
═══════════════════════════════════════════════════════════ */
const paymentConfirmationEmail = ({ studentName, projectTitle, amount, paymentType, dashboardLink, clientUrl }) => {
  const isFirst = paymentType === 'first_50';
  return {
    subject: isFirst ? `✅ Payment confirmed — "${projectTitle}"` : `🎊 Project completed & final payment sent!`,
    text: `Hi ${studentName}, your payment of ₹${amount.toLocaleString()} for "${projectTitle}" was successful.`,
    html: base({
      previewText: `Payment of ₹${amount.toLocaleString()} confirmed for "${projectTitle}"`,
      accentColor: '#6366f1',
      accentLight: '#eff6ff',
      icon: '✅',
      badge: 'Payment Confirmed',
      badgeColor: '#22c55e',
      clientUrl,
      bodyHtml: `
        ${heading(`Payment Confirmed, ${studentName}!`)}
        ${para(isFirst
          ? `Your initial payment of <strong>₹${amount.toLocaleString()}</strong> for <strong>"${projectTitle}"</strong> has been received and held securely in escrow. Your developer has been notified.`
          : `Your final payment of <strong>₹${amount.toLocaleString()}</strong> has been released to your developer. Your project is now complete!`
        )}
        ${infoTable([
          ['Project', `<span style="color:#6366f1;">${projectTitle}</span>`],
          ['Amount Paid', `<span style="color:#22c55e;font-size:16px;">₹${Number(amount).toLocaleString()}</span>`],
          ['Milestone', isFirst ? '1st Payment (50%)' : '2nd & Final Payment (50%)'],
          ['Date', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
          ['Status', '<span style="color:#22c55e;font-weight:700;">✓ Confirmed</span>'],
        ])}
        ${ctaBtn(dashboardLink, 'View My Project →')}
        ${alertBox(
          isFirst
            ? 'Funds are held in secure escrow. They are only released to the developer when you approve the final delivery.'
            : 'Thank you for using ProjectBridge! Please take a moment to leave a review for your developer.',
          isFirst ? 'info' : 'success'
        )}
      `,
    }),
  };
};

/* ═══════════════════════════════════════════════════════════
   5. DEVELOPER UPDATES PROJECT STATUS  →  student notified
═══════════════════════════════════════════════════════════ */
const projectStatusUpdateEmail = ({ studentName, projectTitle, newStatus, progressNote, viewLink, clientUrl }) => {
  const statusConfig = {
    'in-progress': { icon: '🔨', badge: 'In Progress', color: '#6366f1', msg: 'Your developer is actively working on your project.' },
    'delivered':   { icon: '📦', badge: 'Delivered!',  color: '#22c55e', msg: 'Your developer has delivered the project. Review and approve it.' },
    'completed':   { icon: '🏆', badge: 'Completed',   color: '#f59e0b', msg: 'Your project has been marked as completed. Congratulations!' },
    'revision':    { icon: '🔄', badge: 'Revision',    color: '#f59e0b', msg: 'The developer has noted a revision update on your project.' },
  };
  const cfg = statusConfig[newStatus] || { icon: '📋', badge: 'Update', color: '#6366f1', msg: 'Your project has a new status update.' };

  return {
    subject: `${cfg.icon} Project Update: "${projectTitle}" is now ${cfg.badge}`,
    text: `Hi ${studentName}, "${projectTitle}" status changed to ${newStatus}. ${progressNote || ''} View: ${viewLink}`,
    html: base({
      previewText: `"${projectTitle}" is now ${newStatus}. Check the latest update.`,
      accentColor: cfg.color,
      accentLight: `${cfg.color}15`,
      icon: cfg.icon,
      badge: cfg.badge,
      badgeColor: cfg.color,
      clientUrl,
      bodyHtml: `
        ${heading(`Project Update, ${studentName}!`)}
        ${para(cfg.msg)}
        ${infoTable([
          ['Project', `<span style="color:#6366f1;">${projectTitle}</span>`],
          ['New Status', `<span style="color:${cfg.color};font-weight:700;">${cfg.badge}</span>`],
          ['Updated', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
        ], cfg.color)}
        ${progressNote ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid ${cfg.color};border-radius:4px 14px 14px 4px;padding:18px 20px;margin-bottom:28px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Developer Note</p>
          <p style="margin:0;font-size:14px;line-height:22px;color:#334155;">${progressNote}</p>
        </div>` : ''}
        ${ctaBtn(viewLink, 'View Project →', cfg.color)}
      `,
    }),
  };
};

/* ═══════════════════════════════════════════════════════════
   6. ADMIN NOTIFICATION  →  refund request / new dispute
═══════════════════════════════════════════════════════════ */
const adminAlertEmail = ({ adminName = 'Admin', alertType, details, actionLink, clientUrl }) => {
  const types = {
    refund_request: { icon: '⚠️', badge: 'Refund Request', color: '#ef4444', title: 'Refund Request Received' },
    new_user:       { icon: '👤', badge: 'New Registration', color: '#6366f1', title: 'New User Registered' },
    dispute:        { icon: '🚨', badge: 'Dispute Raised', color: '#ef4444', title: 'Dispute Raised' },
    report:         { icon: '📊', badge: 'Admin Report', color: '#0ea5e9', title: 'Platform Report Ready' },
  };
  const cfg = types[alertType] || types.report;

  return {
    subject: `[ProjectBridge Admin] ${cfg.title}`,
    text: `Admin Alert: ${cfg.title}. ${JSON.stringify(details)}. Action: ${actionLink}`,
    html: base({
      previewText: `Admin Alert: ${cfg.title} — action required`,
      accentColor: cfg.color,
      accentLight: `${cfg.color}15`,
      icon: cfg.icon,
      badge: cfg.badge,
      badgeColor: cfg.color,
      clientUrl,
      bodyHtml: `
        ${heading(cfg.title)}
        ${para(`Hi <strong>${adminName}</strong>, a new admin action requires your attention on the ProjectBridge platform.`)}
        ${infoTable(Object.entries(details || {}).map(([k, v]) => [k, String(v)]), cfg.color)}
        ${ctaBtn(actionLink || `${clientUrl}/admin`, 'Go to Admin Panel →', cfg.color)}
        ${alertBox('This is an automated alert from the ProjectBridge system. Take necessary action from the admin panel.', 'warning')}
      `,
    }),
  };
};

/* ═══════════════════════════════════════════════════════════
   7. SOURCE CODE UPLOADED  →  student notified
═══════════════════════════════════════════════════════════ */
const sourceCodeUploadedEmail = ({ studentName, projectTitle, developerName, viewLink, clientUrl }) => ({
  subject: `📦 Source code delivered for "${projectTitle}"`,
  text: `Hi ${studentName}, ${developerName} has uploaded the source code for "${projectTitle}". Review and approve: ${viewLink}`,
  html: base({
    previewText: `${developerName} delivered the source code for "${projectTitle}". Ready to review!`,
    accentColor: '#0ea5e9',
    accentLight: '#f0f9ff',
    icon: '📦',
    badge: 'Delivery Ready',
    badgeColor: '#0ea5e9',
    clientUrl,
    bodyHtml: `
      ${heading(`Your project is ready, ${studentName}!`)}
      ${para(`<strong>${developerName}</strong> has uploaded the source code for <strong>"${projectTitle}"</strong>. Review the delivery and approve it to release the final payment.`)}
      ${infoTable([
        ['Project', `<span style="color:#6366f1;">${projectTitle}</span>`],
        ['Delivered By', developerName],
        ['Delivery Date', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
        ['Action Required', '<span style="color:#ef4444;font-weight:700;">Review &amp; Approve</span>'],
      ], '#0ea5e9')}
      ${ctaBtn(viewLink, 'Review Delivery →', '#0ea5e9')}
      ${alertBox('Once you approve the delivery, the final 50% payment will be released to the developer. Make sure to thoroughly test the code.', 'info')}
    `,
  }),
});

/* ═══════════════════════════════════════════════════════════
   LEGACY COMPAT — used by authController for OTP / reset
═══════════════════════════════════════════════════════════ */
const getEmailTemplate = ({
  title, previewText, leadText, btnLink, btnText,
  icon = '✉️', securityNote, securityNoteType = 'info',
  clientUrl = process.env.CLIENT_URL || 'http://localhost:5173',
}) => {
  const alertType = securityNoteType === 'warning' ? 'warning' : securityNoteType === 'success' ? 'success' : 'info';
  const html = base({
    previewText,
    accentColor: '#6366f1',
    accentLight: '#eff6ff',
    icon,
    clientUrl,
    bodyHtml: `
      ${heading(title)}
      ${para(leadText)}
      ${btnLink && btnText ? ctaBtn(btnLink, btnText) : ''}
      ${securityNote ? alertBox(securityNote, alertType) : ''}
      ${btnLink ? `${divider()}<p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">Having trouble? Copy this link:</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;word-break:break-all;">
          <a href="${btnLink}" style="font-size:12px;color:#6366f1;font-family:Consolas,monospace;word-break:break-all;">${btnLink}</a>
        </div>` : ''}
    `,
  });
  return html;
};

module.exports = {
  getEmailTemplate,
  newBidEmail,
  bidAcceptedEmail,
  paymentReceivedEmail,
  paymentConfirmationEmail,
  projectStatusUpdateEmail,
  adminAlertEmail,
  sourceCodeUploadedEmail,
};
