const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message
 * @param {string} options.html - HTML content (optional)
 */
const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: `Agricult <${process.env.MAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // Add HTML if provided
    if (options.html) {
        mailOptions.html = options.html;
    }

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail; 