import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

export const sendEmail = async ({ email, subject, message }) => {
  try {
    const mailOptions = {
      from: '"Cement Management System" <mulerwalle@gmail.com>',
      to: email,
      subject: subject,
      html: message
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}; 