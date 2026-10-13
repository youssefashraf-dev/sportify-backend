const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmails = async (options) => {
    const mailOpt = {
        to: options.email,
        from: {
            email: process.env.EMAIL_USER,
            name: process.env.EMAIL_FROM_NAME || 'Support',
        },
        subject: options.subject,
        text: options.message,
        html: options.html || undefined,
    };

    await sgMail.send(mailOpt);
};

module.exports = sendEmails;
