const nodemailer = require('nodemailer');

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function createTransport() {
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure =
    process.env.SMTP_SECURE === 'true' || String(port) === '465';

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * @param {string} to
 * @param {string} resetLink
 * @param {string} [fullName]
 */
async function sendPasswordResetEmail(to, resetLink, fullName = '') {
  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    '"Risk Assessment" <noreply@localhost>';

  const greeting = fullName ? `Hi ${fullName},` : 'Hello,';

  const text = `${greeting}

We received a request to reset your password for the Risk Assessment Tool.

Open this link in your browser (valid for 1 hour):
${resetLink}

If you did not request this, you can ignore this email.

`;

  const safeHref = resetLink.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const html = `
  <p>${escapeHtml(greeting)}</p>
  <p>We received a request to reset your password for the <strong>Risk Assessment Tool</strong>.</p>
  <p><a href="${safeHref}">Reset your password</a></p>
  <p style="color:#666;font-size:13px;">This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
  `;

  const transporter = createTransport();
  await transporter.sendMail({
    from,
    to,
    subject: process.env.EMAIL_SUBJECT_RESET || 'Password reset — Risk Assessment Tool',
    text,
    html,
  });
}

module.exports = {
  isSmtpConfigured,
  sendPasswordResetEmail,
};
