// utils/emailService.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  // This configuration is for Gmail. You MUST use an "App Password"
  // if you have 2-Factor Authentication enabled on Google.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: `Spot & Sort <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    // In a real app, you might not want to throw here, but just log
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;