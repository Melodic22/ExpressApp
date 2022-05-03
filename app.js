// Requiring module
const express = require('express');
const { request } = require('http');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3');
const { response } = require('express');
const dbTools = require("./frontend/public/javascripts/dbTools");

// Creating express object
const app = express();

const db = new sqlite3.Database('./db.sqlite3');
//enable foreign keys

async function populateDatabase() {

    // db.serialize(() => {
    //     db.run("PRAGMA foreign_keys = ON");
    //     db.run("INSERT INTO BookingSlots VALUES (1, 2, 3, 4)");
    
    // });

    // await dbTools.test();

    //db.run("INSERT INTO BookingSlots VALUES (1, 2, 3, 4)");

    //create online reservations
    await dbTools.createReservation('30/04/2022', '16:45', '17:45', 1, 1);
    await dbTools.createReservation('29/04/2022', '15:45', '17:45', 1, 1);
    await dbTools.createReservation('28/04/2022', '15:45', '17:45', 1, 2);
    await dbTools.createReservation('27/04/2022', '16:45', '17:45', 1, 2);
    await dbTools.createReservation('26/04/2022', '14:45', '16:00', 1, 2);

    //duplicate time entry, slot_id:1 and slot_id:6 should both reference time_id 1
    await dbTools.createReservation('30/04/2022', '16:45', '17:45', 1, 1);
};

async function databaseTesting() {

    
    //should keep time_id:1 as it's referenced by both slot_id:1 and 6
};

//populateDatabase();
//databaseTesting();

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("frontend/public"));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
const ejs = require('express');
const { redirect } = require('express/lib/response');
const { time } = require('console');
const { all } = require('express/lib/application');
//specify where the views are stored
app.set('views', __dirname + '/frontend/public');
//specify the view engine
app.set('view engine', 'ejs');



/* start of routes */

app.get('/calendar', async function (req, res) {
    console.log('/calendar called');
    if (req.session.loggedin) {
    
        console.log('current username: ' + req.session.username);
                
        let user_id = await dbTools.getUserIdByEmail(req.session.email);
        console.log(`\n\nUser_id in /calendar is ${user_id.user_id}\n\n`);

        //for use elsewhere in the program when accessing the db (not ac globally accessible - need to fix)
        req.session.user_id = user_id.user_id;

        let bookedEvents = await dbTools.getBookedEventsByUserId(req.session.user_id);
        //console.log(bookedEvents);
        let participantEvents = await dbTools.getBookedEventsByParticipantId(req.session.user_id);
        //console.log(participantEvents);
        let bookedSlots = await dbTools.getBookedSlotsByUserId(req.session.user_id);
        //console.log(bookedSlots);
        let allEvents = bookedEvents.concat(bookedSlots);
        allEvents = allEvents.concat(participantEvents);
        //sort all events in order of time_start so they can be displayed in order
        allEvents.sort((a, b) => a.time_start.localeCompare(b.time_start));
        //console.log(allEvents);

        res.render('calendar', {
            username : req.session.username,
            accountType : req.session.type,
            bookedEvents : bookedEvents,
            bookedSlots : bookedSlots,
            participantEvents : participantEvents,
            allEvents : allEvents
        });

        } else {
            res.redirect('/');
        }        
    
});

app.get('/outlook', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/public/outlook.html'));
});

app.get('/outlooks', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/public/outlook_2.html'));
});

//loads up signup page
app.get('/', (req, res) => {

    if (req.session.loggedin) {
        res.redirect('/calendar');
    } else {
        res.render('signup');
    }
    
});

//logout page and redirect to homepage (signup page)
app.get('/logout', (req, res) => {
    req.session.loggedin = false;
    res.redirect('/');
});

//redirect from invalid login details
app.get('/login', (req, res) => {
    res.render('login', {
        message : ''
    });

});

//login button
app.post('/login', async (req, res) => {

    console.log('post/login called');
    let email = req.body.email;
    let password = req.body.password;

    //temp validation
    if (email && password) {
        console.log('email and password inputs registered');
        // res.sendFile(path.join(__dirname, 'frontend/public/calendar.html'));
        //db.get("SELECT * FROM Users WHERE email = ? AND password = ?", [email, password], (error, results, fields) => {

        //new code
        let staffAccount = await dbTools.getStaffByEmailPassword(email, password);

        //user is a staff member
        if (staffAccount) {
            console.log('staff member found');
        
            req.session.type = 'staff';
            req.session.loggedin = true;
            req.session.user_id = staffAccount.user_id;
            req.session.username = staffAccount.firstname;
            req.session.lastname = staffAccount.lastname;
            req.session.email = staffAccount.email;

            //redirect
            res.redirect('/calendar');

        } else {
            let studentAccount = await dbTools.getStudentByEmailPassword(email, password);

            //user is a student member
            if (studentAccount) {
                console.log('student member found');

                req.session.type = 'student';
                req.session.loggedin = true;
                req.session.user_id = studentAccount.user_id;
                req.session.username = studentAccount.firstname;
                req.session.lastname = studentAccount.lastname;
                req.session.email = studentAccount.email;

                //redirect
                res.redirect('/calendar');

            } else {
                //invalid user
                res.render('login', {
                    message : 'Email and/or password incorrect. Please try again.'
                });
            }
        }

    } else {
        //no valid credentials were inputted
        console.log('default render');
        res.render('login', {
            message : ''
        });
        res.end();     
    };



        //end of new code

        //check for staff user
    //     db.get("SELECT * \
    //             FROM Users AS u \
    //             INNER JOIN Staff AS s \
    //             ON u.user_id = s.user_id \
    //             WHERE u.email = ? AND u.password = ?", [email, password], (error, results, fields) => {
    //         if (error) {
    //             console.log(error);
    //         } else {
                
    //             if (results) {
    //                 console.log('staff member found');
    //                 //staff user
    //                 req.session.type = 'staff';
    //                 //valid user credentials
    //                 console.log(`results: ${JSON.stringify(results)}`);
    //                 req.session.loggedin = true;
    //                 req.session.user_id = results.user_id;
    //                 req.session.username = results.firstname;
    //                 req.session.email = results.email;

    //                 //redirect
    //                 res.redirect('/calendar');

    //             } else {
    //                 //check for student user
    //                 db.get("SELECT * \
    //                         FROM Users AS u \
    //                         INNER JOIN Students AS s \
    //                         ON u.user_id = s.user_id \
    //                         WHERE u.email = ? AND u.password = ?", [email, password], (error, results, fields) => {

    //                     if (error) {
    //                         console.log(error);
    //                     } 
    //                     else if (results) {
    //                         console.log('student member found');
    //                         //student user
    //                         req.session.type = 'student';
    //                         //valid user credentials
    //                         console.log(`results: ${JSON.stringify(results)}`);
    //                         req.session.loggedin = true;
    //                         req.session.user_id = results.user_id;
    //                         req.session.username = results.firstname;
    //                         req.session.email = results.email;

    //                         //redirect
    //                         res.redirect('/calendar');
    //                     } else {
    //                         //invalid user
    //                         res.render('login', {
    //                             message : 'Email and/or password incorrect. Please try again.'
    //                         });
    //                     }
    //                 });
    //             }

    //         }
    //     });        
    // } else {
    //     //no valid credentials were inputted
    //     console.log('default render');
    //     res.render('login', {
    //         message : ''
    //     });
    //     res.end();     
    // };
});

//create account route
app.post('/signup', async (req, res) => {
    //res.send('sign up page');

    //TODO: verify inputs
    let fname = req.body.firstname;
    let lname = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;
    let type = req.body.account_type;
    console.log(`type of account ${type}`);

    //new

    //check if account with email already exists
    let userExists = await dbTools.getUserIdByEmail(email);
    if (!userExists) {

        let newUser = await dbTools.createUser(fname, lname, email, password);
        if (newUser.error) {
            console.log(error);
        } else {
            let user_id = newUser.lastID;
    
            if (type === 'staff') {
                await dbTools.createStaff(user_id);
            } else {
                await dbTools.createStudent(user_id);
            }
        };
    
        req.session.loggedin = true;
        req.session.username = fname;
        req.session.lastname = lname;
        req.session.email = email;
        res.redirect('/calendar');   
    } else {    //account already exists
        //TEMP: NEEDS TO DISPLAY ERROR MESSAGE SAYING EMAIL ALREADY IN USE
        console.log('account already exists');
        res.redirect('/');
    }   

});

//create personal event
app.post('/calendar/create-event', async (req, res) => {
    console.log('calendar/create-event POST called');

    //take form data from create event
    let title = req.body.title;
    let description = req.body.description;
    let location = req.body.location;
    let participants = req.body.participants;
    let sTime = req.body.s;
    let fTime = req.body.e;
    let eventDate = req.body.eventdate;
    
    console.log(title);
    console.log(description);
    console.log(location);
    console.log(participants);
    console.log(sTime);
    console.log(fTime);
    console.log(req.session.user_id);

    if (location === 'Online') {

        console.log(`location is ${location}`);
        var newEvent = await dbTools.createEvent(title, description, 1, eventDate, sTime, fTime, req.session.user_id);

    } else if (location === 'UEA Campus') {

        console.log(`location is ${location}`);
        var locBuilding = req.body.ev_uea_location_building;
        var locRoom = req.body.ev_uea_location_room;

        console.log(locBuilding);
        console.log(locRoom);

        const locationExists = await dbTools.getLocationByUEARoom(location, locBuilding, locRoom, 1);
        if (locationExists) {
            let location_id = locationExists.location_id;
            var newEvent = await dbTools.createEvent(title, description, location_id, eventDate, sTime, fTime, req.session.user_id);

        } else {    //create new location if doesn't already exist
            const UEALocation = await dbTools.createLocation('UEA Campus', locBuilding, locRoom, 1);
            var newEvent = await dbTools.createEvent(title, description, UEALocation.lastID, eventDate, sTime, fTime, req.session.user_id);
        }

    } else {    //for "Other" input

        console.log(`location is ${location}`);
        var locName = req.body.ev_other_location_name;
        var locLine1 = req.body.location_line_1;
        var locLine2 = req.body.location_line_2;
        var locLine3 = req.body.location_line_3;
        var locCity = req.body.location_city;
        var locCounty = req.body.location_county;
        var locPostcode = req.body.location_postcode;
        var locCountry = req.body.location_country;

        console.log(locName);
        console.log(locLine1);
        console.log(locLine2);
        console.log(locLine3);
        console.log(locCity);
        console.log(locCounty);
        console.log(locPostcode);
        console.log(locCountry);

        const AddressExists = await dbTools.getAddress(locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry);
        if (AddressExists) {
            const newLocation = await dbTools.createLocation(locName, null, null, AddressExists.address_id);
            var newEvent = await dbTools.createEvent(title, description, newLocation.lastID, eventDate, sTime, fTime, req.session.user_id);

        } else {    //create new address if doesn't already exist
            const newAddress = await dbTools.addAddress(locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry);
            const newLocation = await dbTools.createLocation(locName, locBuilding, locRoom, newAddress.lastID);
            var newEvent = await dbTools.createEvent(title, description, newLocation.lastID, eventDate, sTime, fTime, req.session.user_id);
        }


    }

    if (participants) { //works for 1 participant only
        const participant_id = await dbTools.getUserIdByEmail(participants);
        await dbTools.inviteParticipant(newEvent.lastID, participant_id.user_id);
    }

    res.redirect('/calendar'); 
    //res.status(201).end();

});

                
app.post('/calendar/edit-event', (req, res) => {
    console.log('calendar/edit-event POST called');

    //take form data from create event
    let title = req.body.title;
    let description = req.body.description;
    //temp loc
    let location = req.body.location;
    let participants = req.body.participants;
    let sTime = req.body.start;
    let fTime = req.body.end;
    let event_id = req.body.eventid;
    
    //not registering title from form
    console.log(title);
    console.log(description);
    //temp loc
    console.log(location);
    console.log(participants);
    console.log(sTime);
    console.log(fTime);
    console.log(req.session.user_id);

    db.run("UPDATE events SET location_id=? , participants=?, title=?, description=?, start_time=?, end_time=? WHERE event_id=?", [location, participants, title, description, sTime, fTime, event_id]);

    res.redirect('/calendar');
});

//TODO:
app.delete('/calendar/reservations/:id', async (req, res) => {
    console.log(`slot_id to delete ${req.params.id}`);
    //remove record from db
    await dbTools.deleteReservation(req.params.id);


    res.status(204).send();
    res.end();
    
});

app.delete('/calendar/events/:id', async (req, res) => {
    console.log(`event_id to delete ${req.params.id}`);
    //remove record from db
    // await dbTools.deleteEvent(req.params.id);

    //redirect TODO
    
});

app.post('/calendar/create-reservation', async (req, res) => {
    console.log('/calendar/create-reservation POST called');


    //new
    const staffMember = await dbTools.getStaffByUserId(req.session.user_id);

    if (staffMember) {
            
        //take form data from create res
        let location = req.body.location;
        let sTime = req.body.start;
        let fTime = req.body.end;
        let slotDate = req.body.slotdate;
        let staff_id = staffMember.staff_id;       
        console.log(sTime);
        console.log(fTime);
        console.log(req.session.user_id);
        console.log(`user_id: ${req.session.user_id}`);
        console.log(location);

        if (location === 'Online') {
            //create online reservation (location_id=1)
            console.log(`location is ${location}`);
            var newRes = await dbTools.createReservation(slotDate, sTime, fTime, 1, staff_id);
        } else if (location === 'UEA Campus') {
            //create reservation on campus with a building and room specified
            console.log(`location is ${location}`);
            var locBuilding = req.body.res_uea_location_building;
            var locRoom = req.body.res_uea_location_room;
            console.log(locBuilding);
            console.log(locRoom);

            const locationExists = await dbTools.getLocationByUEARoom(location, locBuilding, locRoom, 1);
            if (locationExists) {
                let location_id = locationExists.location_id;
                console.log(`fTime: ${fTime}`);
                var newRes = await dbTools.createReservation(slotDate, sTime, fTime, location_id, staff_id);

            } else {    //create new location if doesn't already exist
                const UEALocation = await dbTools.createLocation('UEA Campus', locBuilding, locRoom, 1);
                console.log(`fTime: ${fTime}`);
                var newRes = await dbTools.createReservation(slotDate, sTime, fTime, UEALocation.lastID, staff_id);
            }

        } else {    //for "Other" input
            console.log(`location is ${location}`);
            var locName = req.body.res_other_location_name;
            var locLine1 = req.body.location_line_1;
            var locLine2 = req.body.location_line_2;
            var locLine3 = req.body.location_line_3;
            var locCity = req.body.location_city;
            var locCounty = req.body.location_county;
            var locPostcode = req.body.location_postcode;
            var locCountry = req.body.location_country;
            console.log(locName);
            console.log(locLine1);
            console.log(locLine2);
            console.log(locLine3);
            console.log(locCity);
            console.log(locCounty);
            console.log(locPostcode);
            console.log(locCountry);

            //create reservation in custom location and address
            const AddressExists = await dbTools.getAddress(locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry);
            if (AddressExists) {
                console.log(`address already exists`);

                //check if loc exists
                const locationExists = await dbTools.getLocationbyLocNameAddress(locName, AddressExists.address_id);
                console.log(`here`);
                if (locationExists) {
                    console.log(`location already exists`);
                    var newRes = await dbTools.createReservation(slotDate, sTime, fTime, locationExists.location_id, staff_id);
                } else {    //loc doesn't already exist

                    const newLocation = await dbTools.createLocation(locName, null, null, AddressExists.address_id);
                    console.log(`here2`);
                    var newRes = await dbTools.createReservation(slotDate, sTime, fTime, newLocation.lastID, staff_id);
                    console.log(`here3`);
                }

            } else {    //create new address if doesn't already exist
                const newAddress = await dbTools.addAddress(locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry);
                const newLocation = await dbTools.createLocation(locName, locBuilding, locRoom, newAddress.lastID);
                var newRes = await dbTools.createReservation(slotDate, sTime, fTime, newLocation.lastID, staff_id);
            }
        }



    } else {    //NOT A STAFF MEMBER TODO
        //temp - doesn't deal with issue of not being a staff member
        //res.redirect('/calendar');
        //TODO:

        // current user is not a staff member and therefore cannot create reserved timeslots
        // res.render('calendar', {
        //     not_staff_error_message : 'Sorry, you cannot create reserved timeslots as you are a student.',
        //     showReservationMenu : true
        // })
    }
     
    res.redirect('/calendar');
});

app.get('/slots', async (req, res) => {  

    console.log('GET /slots called');

    const slots = await dbTools.getAllReservations();
    console.log(slots);
    //pass retrieved data back to calendar
    res.render('slots', {
        username : req.session.username,
        email : req.session.email,
        slots : slots
    });

    // db.all("SELECT slot_id, s.staff_id, ti.time_id, date, time_start, time_finish, s.user_id, firstname, lastname, email \
    //         FROM BookingSlots as bs \
    //         INNER JOIN Staff as s \
    //             ON bs.staff_id = s.staff_id \
    //         INNER JOIN TimeInfo as ti \
    //             ON bs.time_id = ti.time_id\
    //         INNER JOIN Users as u\
    //             ON s.user_id = u.user_id\
    //         ORDER BY s.staff_id ASC;", (error, results) => {

    //             //pass retrieved data back to calendar
    //             res.render('slots', {
    //                 username : req.session.username,
    //                 email : req.session.email,
    //                 slots : results
    //             });
    //     })

});

//when a reserved slot is confirmed by a user
app.post('/slots/confirm-slot', async (req, res) => {
    console.log('POST /slots/confirm-slot called');

    const currentSlot = await dbTools.getReservationById(req.body.slot_id);
    console.log(`currentSlot ${JSON.stringify(currentSlot)}`);

    //add it to BookedEvents, eventInfo, Locations, addresses, timeinfo, users (host), participations
    const newEvent = await dbTools.createEventFromReservation('Advisor Meeting', `A meeting between you and ${currentSlot.firstname} ${currentSlot.lastname}`, currentSlot.location_id,
        currentSlot.time_id, currentSlot.user_id);

    console.log(`user_id: ${req.session.user_id}`);
    await dbTools.addParticipant(newEvent.lastID, req.session.user_id);

    //remove slot booking from Bookingslots
    await dbTools.removeReservationById(currentSlot.slot_id);

    
    //send confirmation emails to both users
    const sendMail = require('./frontend/public/javascripts/email.js')

    //email sent to student
    let email = `Dear ${req.session.username} ${req.session.lastname}, <br>\
            This is a confirmation email for your meeting with ${req.body.firstname} ${req.body.lastname} \
            on ${req.body.date} \
            from ${req.body.time_start} to ${req.body.time_finish} <br>\
            Your meeting has been added to your calendar on the MyCalendarChum website, \
            and will also be added to your Outlook Calendar once I've implemented it`;
    // sendMail.sendMail(email, req.session.email);
    sendMail.sendMail(email, 'mattreid22@btopenworld.com');

    //email sent to staff
    email = `Dear ${req.body.firstname} ${req.body.lastname}, <br>\
    This is a confirmation email for your meeting with ${req.session.username} ${req.session.lastname} \
    on ${req.body.date} \
    from ${req.body.time_start} to ${req.body.time_finish} <br>\
    Your meeting has been added to your calendar on the MyCalendarChum website, \
    and will also be added to your Outlook Calendar once I've implemented it`;
    // sendMail.sendMail(email, req.body.email);
    sendMail.sendMail(email, 'mattreid22@btopenworld.com');

    //add the event to each of their personal calendars (should be automatic)
    // res.redirect('/calendar');
    res.status(201).send();
    //add the event to each of their outlook calendars

});
// Port Number
const PORT = process.env.PORT ||5000;

// Server Setup
app.listen(PORT,console.log(
`Server started on port ${PORT}`));
