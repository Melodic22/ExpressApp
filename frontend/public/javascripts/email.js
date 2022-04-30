const nodemailer = require('nodemailer');




function sendMail(email, recipient) {

    const transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'mycalendarchum@gmail.com',
            // pass: "1743aaTyze3'afs",
            //pass: "kpryfzbzrggslqlm",
            pass: "uconukbknjmincsl",
        },
    });

    transport.sendMail({
        from: 'mycalendarchum@gmail.com',
        to: recipient,
        subject: 'Meeting Confirmation',
        html: email
    }).catch(error => console.log(error));
};

module.exports = {sendMail};