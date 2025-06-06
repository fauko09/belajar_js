const nodemailer = require('nodemailer');

const otp = nodemailer.createTransport({
    port: 465, // biasanya 465 (SSL) atau 587 (TLS)
    secure: true, // true untuk port 465, false untuk 587
    auth: {
    
    }
});
const cs = nodemailer.createTransport({
    port: 465, // biasanya 465 (SSL) atau 587 (TLS)
    secure: true, // true untuk port 465, false untuk 587
    auth: {
 
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
