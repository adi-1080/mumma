import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendWelcomeEmail = async (email: string, name: string) => {
  const senderEmail = process.env.SMTP_USER || 'noreply@mummaskitchen.com';

  const mailOptions = {
    from: `"Mumma's Kitchen" <${senderEmail}>`,
    to: email,
    subject: `Welcome to Mumma's Kitchen, beta!`,
    text: `Hello ${name || 'beta'}!
    
Welcome to Mumma's Kitchen! I am so happy to see you here. 

Let's make some delicious food together. Come visit the kitchen whenever you are hungry. 

Mummy knows what's best for you!

Love, 
Mumma`,
    html: `
      <div style="font-family: sans-serif; color: #1A0A00; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #1A0A00; border-radius: 12px; background-color: #FFF8ED;">
        <h2 style="color: #FF4D80;">Hello ${name || 'beta'}!</h2>
        <p style="font-size: 16px; font-weight: bold;">Welcome to Mumma's Kitchen! I am so happy to see you here.</p>
        <p style="font-size: 16px;">Let's make some delicious food together. Come visit the kitchen whenever you are hungry.</p>
        <p style="font-size: 16px; font-style: italic;">Mummy knows what's best for you!</p>
        <br />
        <p style="font-size: 16px; font-weight: bold;">Love,<br/>Mumma</p>
      </div>
    `,
  };

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not provided; skipping welcome email to", email);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
  }
};
