const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
        secure: Number(process.env.EMAIL_PORT) === 465, // Secure only for 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 ثواني
    greetingTimeout: 10000,   // 10 ثواني
    socketTimeout: 10000,     // 10 ثواني
});

const sendEmails = async (options) => {
    const mailOpt = {
        from: `"${process.env.EMAIL_USER}" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || undefined,
    };
    await transporter.sendMail(mailOpt)
}


module.exports = sendEmails