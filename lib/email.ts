import { Resend } from 'resend';

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured');
    return null;
  }
  return new Resend(apiKey);
};

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'auth@mummasonlykitchen.com';

const baseEmailStyles = `
  <style>
    .email-container {
      font-family: 'Nunito', sans-serif;
      color: #1A0A00;
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      border: 2.5px solid #1A0A00;
      border-radius: 16px;
      background-color: #FFF8ED;
    }
    .header {
      color: #FF4D80;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .otp-code {
      background: #FFD966;
      color: #1A0A00;
      font-size: 32px;
      font-weight: bold;
      padding: 16px 32px;
      border-radius: 12px;
      border: 2px solid #1A0A00;
      display: inline-block;
      margin: 20px 0;
      letter-spacing: 4px;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .footer {
      font-size: 14px;
      color: #666;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
    }
    .button {
      background: #FF4D80;
      color: white;
      padding: 12px 24px;
      border-radius: 10px;
      text-decoration: none;
      display: inline-block;
      font-weight: bold;
      margin: 16px 0;
    }
  </style>
`;

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn("RESEND_API_KEY not provided; skipping welcome email to", email);
      return;
    }

    await resend.emails.send({
      from: `"Mumma's Kitchen" <${FROM_EMAIL}>`,
      to: email,
      subject: `Welcome to Mumma's Kitchen, beta!`,
      html: `
        ${baseEmailStyles}
        <div class="email-container">
          <div class="header">Hello ${name || 'beta'}!</div>
          <div class="content">
            <p><strong>Welcome to Mumma's Kitchen!</strong> I am so happy to see you here.</p>
            <p>Let's make some delicious food together. Come visit the kitchen whenever you are hungry.</p>
            <p style="font-style: italic;">Mummy knows what's best for you!</p>
          </div>
          <div class="footer">
            <strong>Love,<br/>Mumma</strong>
          </div>
        </div>
      `,
    });
    console.log(`Welcome email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
  }
};

export const sendVerificationEmail = async (email: string, name: string, url: string, otp: string) => {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn("RESEND_API_KEY not provided; skipping verification email to", email);
      return;
    }

    await resend.emails.send({
      from: `"Mumma's Kitchen" <${FROM_EMAIL}>`,
      to: email,
      subject: `Verify your email, beta!`,
      html: `
        ${baseEmailStyles}
        <div class="email-container">
          <div class="header">Hello ${name || 'beta'}!</div>
          <div class="content">
            <p>Mumma needs to make sure this email is really yours. Please verify your email address to continue cooking with me!</p>
            
            ${otp ? `
            <p>Here is your 6-digit verification code:</p>
            <div style="text-align: center;">
              <span class="otp-code">${otp}</span>
            </div>
            ` : ''}

            <p>Or click the button below to verify directly:</p>
            <a href="${url}" class="button">Verify Email</a>
            <p style="font-size: 14px; color: #666;">Or copy this link: ${url}</p>
            <p style="font-size: 14px; color: #666;">This link/code will expire in 5 minutes. If you didn't create an account, you can ignore this email.</p>
          </div>
          <div class="footer">
            <strong>Love,<br/>Mumma</strong>
          </div>
        </div>
      `,
    });
    console.log(`Verification email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
  }
};

export const sendResetPasswordEmail = async (email: string, name: string, url: string, otp: string) => {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn("RESEND_API_KEY not provided; skipping reset password email to", email);
      return;
    }

    await resend.emails.send({
      from: `"Mumma's Kitchen" <${FROM_EMAIL}>`,
      to: email,
      subject: `Reset your password, beta`,
      html: `
        ${baseEmailStyles}
        <div class="email-container">
          <div class="header">Hello ${name || 'beta'}!</div>
          <div class="content">
            <p>Mumma got your request to reset your password. No worries, happens to the best of us!</p>
            
            ${otp ? `
            <p>Here is your 6-digit password reset code:</p>
            <div style="text-align: center;">
              <span class="otp-code">${otp}</span>
            </div>
            ` : ''}

            <p>Or click the button below to reset directly:</p>
            <a href="${url}" class="button">Reset Password</a>
            <p style="font-size: 14px; color: #666;">Or copy this link: ${url}</p>
            <p style="font-size: 14px; color: #666;">This link/code will expire in 5 minutes. If you didn't request this, you can ignore this email.</p>
          </div>
          <div class="footer">
            <strong>Love,<br/>Mumma</strong>
          </div>
        </div>
      `,
    });
    console.log(`Reset password email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send reset password email to ${email}:`, error);
  }
};
