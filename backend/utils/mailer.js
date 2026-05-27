const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function isSmtpConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function sendPasswordResetEmail(to, resetLink, fullName = '') {
  const greeting = fullName ? `Hi ${fullName},` : 'Hello,';

  await resend.emails.send({
    from: 'Risk Assessment Tool <onboarding@resend.dev>',
    to: [to],
    subject: 'Password Reset — Risk Assessment Tool',
    html: `
      <p>${greeting}</p>
      <p>We received a request to reset your password for the <strong>Risk Assessment Tool</strong>.</p>
      <p><a href="${resetLink}" style="background:#009dff;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">Reset Password</a></p>
      <p style="color:#666;font-size:13px;">This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
    `,
  });
}

module.exports = {
  isSmtpConfigured,
  sendPasswordResetEmail,
};