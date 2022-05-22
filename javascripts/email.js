const req = require('express/lib/request');
const nodemailer = require('nodemailer');
const dbTools = require("./dbTools");

//create email content constructor

async function emailConstructor(hFirstName, hLastName, pFirstName, pLastName, event_id) {
    
    const event = await dbTools.getBookedEventByEventId(event_id);
    
    let locationInfo = '';

    //constructor for different address types
    if (event.location_id === 1) {
        locationInfo = `<li>Location: Online`;
    } else {
        if (event.location_name === 'UEA Campus') {
            locationInfo = `<li>Location: ${event.location_name}, ${event.location_building}, ${event.location_room}
                            <li>Address: ${event.line_1}, ${event.line_2}, ${event.city}, ${event.county}, ${event.city}, ${event.country}, ${event.postcode}`;
        } else {
            const line2 = event.line_2 === '' ? '' : `${event.line_2},`
            const line3 = event.line_3 === '' ? '' : `${event.line_3},`
            const county = event.county === '' ? '' : `${event.county},`
            const country = event.country === '' ? '' : `${event.country}`
            locationInfo = `<li>Location: ${event.location_name}
                            <li>Address: ${event.line_1}, ${line2} ${line3} ${event.city}, ${county} ${event.postcode}, ${country}`;
        }
    }

    //email constructor
    const email = 
    `<p>Dear ${pFirstName} ${pLastName},</p>\
    <p>You have been invited to an event by ${hFirstName} ${hLastName}.
    The details of the event are below:</p>
        <ul>
            <li>Title: ${event.title}
            <li>Description: ${event.description}
            <li>Time: ${event.time_start} to ${event.time_finish}
            ${locationInfo}
        </ul>

    <p>Please confirm your attendance by clicking on the following link:</p>
    <a href=http://localhost:5000/confirm-attendance/${event.event_id}> Click here</a>

    <p>Kind regards,</p> 
    <p>MyCalendarChum</p>`

    return email;
}


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

module.exports = {sendMail, emailConstructor};