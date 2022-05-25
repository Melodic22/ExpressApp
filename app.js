// Requiring module
const express = require('express');
const { request } = require('http');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3');
const { response } = require('express');
const dbTools = require("./javascripts/dbTools");
const encryption = require("./javascripts/encryption");
const crypto = require('crypto');
const sendMail = require('./javascripts/email');
const validation = require('./javascripts/validation');


// Creating express object
const app = express();

const db = dbTools.getDatabase();

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

app.get('/about', (req, res) => {
    if (req.session.loggedin) {
        res.render('about', {
            username : req.session.username,
            accountType : req.session.type,
            user_id : req.session.user_id
        });
    } else {
        res.redirect('/calendar');
    }
});

app.get('/calendar', async (req, res) => {
    console.log('/calendar called');
    if (req.session.loggedin) {
    
        //console.log('current username: ' + req.session.username);
                
        let user_id = await dbTools.getUserIdByEmail(req.session.email);
        //console.log(`\n\nUser_id in /calendar is ${user_id.user_id}\n\n`);

        //for use elsewhere in the program when accessing the db (not ac globally accessible - need to fix)
        req.session.user_id = user_id.user_id;

        let bookedEvents = await dbTools.getBookedEventsByUserId(req.session.user_id);
        // console.log(bookedEvents);
        // console.log('\n\n\n');
        let participantEvents = await dbTools.getBookedEventsByParticipantId(req.session.user_id);
        // console.log(participantEvents);
        // console.log('\n\n\n');
        let bookedSlots = await dbTools.getBookedSlotsByUserId(req.session.user_id);
        // console.log(bookedSlots);
        // console.log('\n\n\n');
        let allEvents = bookedEvents.concat(bookedSlots);
        allEvents = allEvents.concat(participantEvents);
        //sort all events in order of time_start so they can be displayed in order
        allEvents.sort((a, b) => a.time_start.localeCompare(b.time_start));
        console.log(allEvents);

        res.render('calendar', {
            user_id : req.session.user_id,
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


//loads up signup page
app.get('/', (req, res) => {

    if (req.session.loggedin) {
        res.redirect('/calendar');
    } else {
        res.render('signup', {
            message: ''
        });
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

    //sanitisation
    email = validation.sanitise(email);
    password = validation.sanitise(password);
    console.log(password);

    //validate
    const validEmail = validation.validateEmail(email);

    if (!validEmail) {
        console.log('An invalid email was entered. Please try again.');
        res.render('login', {
            message : 'An invalid email was entered. Please try again.'
        });
    } else if (!password.length > 0) {
        console.log('Please enter a password.');
        res.render('login', {
            message : 'Please enter a password.'
        });
    } else {
        //if email and password are not null
        if (email && password) {
            console.log('email and password inputs registered');

            //new
            const accountExists = await dbTools.getUserByEmail(email);
            console.log(accountExists);
            if (accountExists) {

                const password_salt = accountExists.password_salt;
                console.log(password_salt);
                //calculate password hash using salt
                const calculatedHash = await encryption.hashPassword(password, password_salt)
                console.log(calculatedHash);
        
                //if valid email and password
                if (calculatedHash === accountExists.password_hash) {
                    console.log('valid user');
        
                    const staffAccount = await dbTools.getStaffByEmail(email);
                    const studentAccount = await dbTools.getStudentByEmail(email);
        
                    if (staffAccount) {
                        req.session.type = 'staff';
                        req.session.loggedin = true;
                        req.session.user_id = staffAccount.user_id;
                        req.session.username = staffAccount.firstname;
                        req.session.lastname = staffAccount.lastname;
                        req.session.email = staffAccount.email;
                    } 
                    else if (studentAccount) {
                        req.session.type = 'student';   
                        req.session.loggedin = true;
                        req.session.user_id = studentAccount.user_id;
                        req.session.username = studentAccount.firstname;
                        req.session.lastname = studentAccount.lastname;
                        req.session.email = studentAccount.email;  
                    } else {
                        //user does not belong to either student or staff table
                        console.log('Error: User does not exist as a student or staff member');
        
                        res.render('login', {
                            // message : 'There was an error. Please try again'
                            message : 'Email and/or password incorrect. Please try again.'
                        });
                    }
        
                    //redirect
                    res.redirect('/calendar');
        
                } else {
                    res.render('login', {
                        message : 'Email and/or password incorrect. Please try again.'
                    });
                }

            } else {
                res.render('login', {
                    message : 'Email and/or password incorrect. Please try again.'
                });
            }
            

        } else {
            //no valid credentials were inputted
            console.log('default render');
            res.render('login', {
                message : ''
            });
            res.end();     
        };
    }


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

    

    //sanitisation
    fname = validation.sanitise(fname);
    lname = validation.sanitise(lname);
    email = validation.sanitise(email);
    password = validation.sanitise(password);
    console.log(password);
    type = validation.sanitise(type);
    //validation
    const validfname = validation.validateName(fname);
    const validlname = validation.validateName(lname);
    const validEmail = validation.validateEmail(email);
    const validPass = validation.validatePassword(password);
    const validType = validation.validateType(type);
    console.log(validPass);
    console.log(validEmail);
    if (!validfname || !validlname) {
        console.log('no input for fname and lname');
        res.render('signup', {
            message : 'Please enter your first name and last name.'
        });
    } else if (!validPass) {
        console.log('poor quality password');
        res.render('signup', {
            message : 'Please use a password between 8 and 64 characters and avoid common or easy to guess passwords.'
        });
    } else if (!validEmail) {
        console.log('invalid email');
        res.render('signup', {
            message : 'An invalid email was entered. Please try again.'
        });
    } else if (!validType) {
        console.log('invalid account type');
        res.render('signup', {
            message : 'Please enter your account type.'
        });
    } else {

        //check if account with email already exists
        let userExists = await dbTools.getUserIdByEmail(email);
        if (!userExists) {

            //add password hash and salt
            let salt = crypto.pseudoRandomBytes(24).toString('hex');
            console.log(salt);
            let hash = await encryption.hashPassword(password, salt)
            console.log(hash);

            const newUser = await dbTools.createUser(fname, lname, email, hash, salt);
            // let newUser = await dbTools.createUser(fname, lname, email, password);
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
            req.session.type = type;
            res.redirect('/calendar');   
        } else {    //account already exists
            console.log('account already exists');
            res.render('signup', {
                message : 'That email is already in use. Please try again.'
            });
        }   

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

    //santisation
    title = validation.sanitise(title);
    description = validation.sanitise(description);
    location = validation.sanitise(location);
    participants = validation.sanitise(participants);
    sTime = validation.sanitise(sTime);
    fTime = validation.sanitise(fTime);
    eventDate = validation.sanitiseDate(eventDate);
    
    //validation
    const validTimes = validation.validateTimes(sTime, fTime);
    console.log(validTimes);

    if (!validTimes) {
        res.redirect('/calendar');
    } else {

        if (location === 'Online') {

            console.log(`location is ${location}`);
            var newEvent = await dbTools.createEvent(title, description, 1, eventDate, sTime, fTime, req.session.user_id);
    
        } else if (location === 'UEA Campus') {
    
            console.log(`location is ${location}`);
            var locBuilding = req.body.ev_uea_location_building;
            var locRoom = req.body.ev_uea_location_room;
    
            //santisation
            locBuilding = validation.sanitise(locBuilding);
            locRoom = validation.sanitise(locRoom);
    
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
    
            //sanitisation
            locName = validation.sanitise(locName);
            locLine1 = validation.sanitise(locLine1);
            locLine2 = validation.sanitise(locLine2);
            locLine3 = validation.sanitise(locLine3);
            locCity = validation.sanitise(locCity);
            locCounty = validation.sanitise(locCounty);
            locPostcode = validation.sanitise(locPostcode);
            locCountry = validation.sanitise(locCountry);
    
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
            
            //split the participants list into single emails
            const participantsList = participants.split(", ");
            console.log(participantsList);
    
            for (let i = 0; i < participantsList.length; i++) {
                console.log(participantsList[i]);

                //validate email, ignore the email if invalid
                if (validation.validateEmail(participantsList[i]) === true) {
                    const participant = await dbTools.getUserByEmail(participantsList[i]);
                    await dbTools.inviteParticipant(newEvent.lastID, participant.user_id);
        
                    //email sent to pending participant
                    const email = await sendMail.emailConstructor(req.session.username, req.session.lastname, participant.firstname, participant.lastname, newEvent.lastID);
        
                    sendMail.sendMail(email, participantsList[i]);
                    //sendMail.sendMail(email, 'mattreid22@btopenworld.com');
                }
                
            };
    
        }
    
        res.redirect('/calendar'); 
    }
    

});

app.get('/confirm-attendance/:id', async (req, res) => {

    const event_id = req.params.id;
    console.log(event_id);

    res.render('credentialCheck', {
        message : '',
        event_id : event_id
    });
});

app.post('/confirm-attendance', async (req, res) => {

    //take in login details
    let event_id = req.body.event_id;
    let email = req.body.email;
    let password = req.body.password;
    let attendance = req.body.attendance;
    console.log(event_id);

    //sanitisation
    event_id = validation.sanitise(event_id);
    console.log(event_id);
    email = validation.sanitise(email);
    password = validation.sanitise(password);
    attendance = validation.sanitise(attendance);

    //if email and password are not null
    if (email && password) {
        const accountExists = await dbTools.getUserByEmail(email);
        if (accountExists) {
            const password_salt = accountExists.password_salt;
            const calculatedHash = await encryption.hashPassword(password, password_salt)
            //if valid email and password
            if (calculatedHash === accountExists.password_hash) {
                console.log('valid user');

                if (attendance === 'true') {

                    await dbTools.updateParticipantType(event_id, accountExists.user_id, 3);
                    res.send('<h2>Your attendance for this event has been confirmed.</h2>');
                } else {

                    await dbTools.updateParticipantType(event_id, accountExists.user_id, 1);
                    res.send('<h2>Your decision has been registered. Thanks!</h2>');
                }

            } else {
                res.render('credentialCheck', {
                    message : 'Email and/or password incorrect. Please try again.',
                    event_id : event_id
                });
            }
        } else {
            res.render('credentialCheck', {
                message : 'Email and/or password incorrect. Please try again.',
                event_id : event_id
            });     
        }
    } else {
        //no valid credentials were inputted
        console.log('default render');
        res.render('credentialCheck', {
            message : '',
            event_id : event_id
        });
        res.end();     
    };
});


app.delete('/calendar/reservations/:id', async (req, res) => {
    console.log(`slot_id to delete ${req.params.id}`);
    //remove record from db
    const deleted = await dbTools.deleteReservation(req.params.id);

    if (deleted === true) {
        res.status(204).send();
    } else {
        res.status(500).send();
    }
    res.end();

    
});

app.delete('/calendar/events/:id', async (req, res) => {
    console.log(`event_id to delete ${req.params.id}`);
    //remove record from db
    const deleted = await dbTools.deleteEvent(req.params.id);

    if (deleted === true) {
        res.status(204).send();
    } else {
        res.status(500).send();
    }
    res.end();

    
});

app.delete('/delete-account/:id', async (req, res) => {
    console.log(`user_id to delete ${req.params.id}`);
    
    if (req.session.type === 'student') {
        var deleted = await dbTools.deleteStudentAccount(req.params.id);
    } else {
        var deleted = await dbTools.deleteStaffAccount(req.params.id);
    }

    if (deleted === true) {
        req.session.destroy();
        res.status(204).send();
    } else {
        res.status(500).send();
    }
    res.end();
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

        //sanitisation
        location = validation.sanitise(location);
        sTime = validation.sanitise(sTime);
        fTime = validation.sanitise(fTime);
        slotDate = validation.sanitiseDate(slotDate);

        //validation
        const validTimes = validation.validateTimes(sTime, fTime);
        console.log(validTimes);

        if (!validTimes) {
            //invalid times
            res.redirect('/calendar');
        } else {

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
    
                locName = validation.sanitise(locName);
                locLine1 = validation.sanitise(locLine1);
                locLine2 = validation.sanitise(locLine2);
                locLine3 = validation.sanitise(locLine3);
                locCity = validation.sanitise(locCity);
                locCounty = validation.sanitise(locCounty);
                locPostcode = validation.sanitise(locPostcode);
                locCountry = validation.sanitise(locCountry);
    
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
            res.redirect('/calendar');
        }


    } else {
        res.redirect('/calendar');
    }
     
    
});

app.get('/slots', async (req, res) => {  

    console.log('GET /slots called');

    if (req.session.type === 'student') {
        
        const slots = await dbTools.getAllReservations();
        console.log(slots);
        //pass retrieved data back to calendar
        res.render('slots', {
            username : req.session.username,
            email : req.session.email,
            slots : slots,
            accountType : req.session.type,
            user_id : req.session.user_id
        });
    } else {
        res.redirect('/calendar');
    }


});

//when a reserved slot is confirmed by a user
app.post('/slots/confirm-slot', async (req, res) => {
    console.log('POST /slots/confirm-slot called');

    const currentSlot = await dbTools.getReservationById(req.body.slot_id);
    console.log(`currentSlot ${JSON.stringify(currentSlot)}`);

    //add it to BookedEvents, eventInfo, Locations, addresses, timeinfo, users (host), participations
    const newEvent = await dbTools.createEventFromReservation('Advisor Meeting', `A meeting between ${req.session.username} ${req.session.lastname} and ${currentSlot.firstname} ${currentSlot.lastname}`, currentSlot.location_id,
        currentSlot.time_id, currentSlot.user_id);

    console.log(`user_id: ${req.session.user_id}`);
    await dbTools.addParticipant(newEvent.lastID, req.session.user_id);

    //remove slot booking from Bookingslots
    await dbTools.removeReservationById(currentSlot.slot_id);

    
    //send confirmation emails to both users

    //email sent to student
    let email = `Dear ${req.session.username} ${req.session.lastname}, <br>\
            This is a confirmation email for your meeting with ${req.body.firstname} ${req.body.lastname} \
            on ${req.body.date} \
            from ${req.body.time_start} to ${req.body.time_finish} <br>\
            Your meeting has been added to your calendar on the MyCalendarChum website.`;
    sendMail.sendMail(email, req.session.email);
    //sendMail.sendMail(email, 'mattreid22@btopenworld.com');

    //email sent to staff
    email = `Dear ${req.body.firstname} ${req.body.lastname}, <br>\
    This is a confirmation email for your meeting with ${req.session.username} ${req.session.lastname} \
    on ${req.body.date} \
    from ${req.body.time_start} to ${req.body.time_finish} <br>\
    Your meeting has been added to your calendar on the MyCalendarChum website.`;
    sendMail.sendMail(email, req.body.email);
    //sendMail.sendMail(email, 'mattreid22@btopenworld.com');

    //add the event to each of their personal calendars (should be automatic)
    res.status(201).send();

});
// Port Number
const PORT = process.env.PORT ||5000;

// Server Setup
app.listen(PORT,console.log(
`Server started on port ${PORT}`));
