const nodemailer = require('nodemailer');

const otp = nodemailer.createTransport({
    host: 'mail.fawqdhakiun.com', // ganti dengan host SMTP dari provider hosting kamu
    port: 465, // biasanya 465 (SSL) atau 587 (TLS)
    secure: true, // true untuk port 465, false untuk 587
    auth: {
        user: 'otp@fawqdhakiun.com',
        pass: 'otpFauko0903'
    }
});
const cs = nodemailer.createTransport({
    host: 'mail.fawqdhakiun.com', // ganti dengan host SMTP dari provider hosting kamu
    port: 465, // biasanya 465 (SSL) atau 587 (TLS)
    secure: true, // true untuk port 465, false untuk 587
    auth: {
        user: 'cs@fawqdhakiun.com',
        pass: 'csFauko0903'
    }
});

// Fungsi kirim email
async function sendMail({ to, subject, text, html }) {
    let info
    if (subject === 'OTP') {
        info = await otp.sendMail({
            from: '"Fawq Dhakiun" <otp@fawqdhakiun.com>',
            to,
            subject,
            text,
            html
        });

    } else {

        info = await cs.sendMail({
            from: '"Fawq Dhakiun" <cs@fawqdhakiun.com>',
            to,
            subject,
            text,
            html
        });
    }

    console.log('Message sent: %s', info.response);
    return info;
}

module.exports = sendMail;
