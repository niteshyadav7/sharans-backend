import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email verification
export const sendVerificationEmail = async (user, verificationToken) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Sharans E-Commerce'}" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Sharans!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Thank you for registering with Sharans E-Commerce. Please verify your email address to activate your account.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Sharans E-Commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Sharans E-Commerce'}" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 10 minutes</li>
                <li>If you didn't request a password reset, please ignore this email</li>
                <li>Your password will remain unchanged</li>
              </ul>
            </div>
            <p>For security reasons, we recommend choosing a strong password that you haven't used before.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Sharans E-Commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Sharans E-Commerce'}" <${process.env.EMAIL_FROM}>`,
    to: user.email,
    subject: 'Welcome to Sharans E-Commerce!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Sharans!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Your email has been verified successfully! Welcome to Sharans E-Commerce.</p>
            <p>You can now enjoy all the features of our platform:</p>
            <ul>
              <li>Browse our wide range of products</li>
              <li>Add items to your cart</li>
              <li>Apply discount coupons</li>
              <li>Place orders with COD or online payment</li>
              <li>Track your orders</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}" class="button">Start Shopping</a>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Sharans E-Commerce. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email
  }
};

// Generic Send Email
export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Sharans E-Commerce'}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

