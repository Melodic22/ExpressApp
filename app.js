// Requiring module
const express = require('express');
const { request } = require('http');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3');
const { response } = require('express');

// Creating express object
const app = express();

const db = new sqlite3.Database('./db.sqlite3');
//enable foreign keys
db.run("PRAGMA foreign_keys = ON")

// db.run("DROP TABLE accounts");
//db.run("DROP TABLE events");

//db.run("INSERT INTO events (user_id, location_id, title, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)", [2, 3, 'test', '17/04/2022', '16:00:00', '17:00:00']);
// db.run("INSERT INTO events (user_id, location_id, title, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)", [2, 4, 'newtest', '18/04/2022', '14:00:00', '14:15:00']);

// db.run("INSERT INTO events (user_id, location_id, title, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)", [1, 3, 'em event', '17/04/2022', '16:00:00', '17:00:00']);
// db.run("INSERT INTO events (user_id, location_id, title, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)", [1, 4, 'em another event', '18/04/2022', '14:00:00', '14:15:00']);

//db.run("INSERT INTO events (user_id, location_id, participants, title, description, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [1, 4, 'matt and em', 'em another event', 'this is a description', '20/04/2022', '14:00:00', '14:15:00']);



// db.run('CREATE TABLE IF NOT EXISTS accounts (' +
//         'user_id INTEGER PRIMARY KEY NOT NULL,' +
//         'firstname TEXT NOT NULL,' +
//         'lastname TEXT NOT NULL,' +
//         'email TEXT NOT NULL,' +
//         'password TEXT NOT NULL' +
//         ')'
//     );

// db.run('CREATE TABLE IF NOT EXISTS events (' +
//         'event_id INTEGER PRIMARY KEY NOT NULL,' +
//         'user_id INTEGER NOT NULL,' +
//         'location_id TEXT NOT NULL,' +
//         'participants TEXT,' +       //may have to change to "supervisor_id"
//         'title TEXT NOT NULL,' +
//         'description TEXT,' +
//         'date TEXT NOT NULL,' +    //"YYYY-MM-DD HH:MM:SS.SSS"
//         'start_time TEXT NOT NULL,' +    //HH:MM:SS.SSS" 
//         'end_time TEXT NOT NULL' +      //HH:MM:SS.SSS"     
//         ')'
//     );

// db.get("INSERT INTO accounts (id, username, password, email) VALUES (1, 'test', 'test', 'test@test.com')");

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
//specify where the views are stored
app.set('views', __dirname + '/frontend/public');
//specify the view engine
app.set('view engine', 'ejs');

app.get('/calendar', (req, res) => {
    console.log('/calendar called');
    if (req.session.loggedin) {

        
        //TODO:
            //create personal events database table
            console.log('current username: ' + req.session.username);
            
            //get current user_id
            db.get("SELECT user_id FROM Users WHERE email = ?", [req.session.email], (error, results) => {
                let user_id = results.user_id;
                
                //for use elsewhere in the program when accessing the db (not ac globally accessible - need to fix)
                req.session.user_id = user_id;


                
                console.log('userid in /calendar: '+ req.session.user_id);
                
                //select all confirmed events for current user
                db.serialize(() => {
                    db.all("SELECT * \
                            FROM BookedEvents as b \
                                INNER JOIN TimeInfo as t \
                                    ON b.time_id = t.time_id \
                                INNER JOIN EventInfo as e \
                                    ON e.event_id = b.event_id \
                                LEFT OUTER JOIN Participations as p \
                                    ON b.event_id = p.event_id \
                                LEFT OUTER JOIN ParticipationType as pt \
                                    ON pt.participation_type_id = p.participation_type_id \
                                LEFT OUTER JOIN Locations as l \
                                    ON e.location_id = l.location_id \
                                LEFT OUTER JOIN Addresses as a \
                                    ON l.address_id = a.address_id \
                                WHERE b.host_id = ?", [req.session.user_id], (error, results) => {
                                    let bookedEvents = results;
                                    console.log(bookedEvents);

                                    //select all reserved slots     //may need to also get email of user?
                                    db.all("SELECT * \
                                            FROM BookingSlots as bs \
                                                INNER JOIN Staff as s \
                                                    ON bs.staff_id = s.staff_id \
                                                INNER JOIN TimeInfo as ti \
                                                    ON bs.time_id = ti.time_id \
                                                WHERE s.user_id = ?", [req.session.user_id], (error, results) => {
                                                    let bookedSlots = results;
                                                    console.log(bookedSlots)

                                                    //pass retrieved data back to calendar
                                                    res.render('calendar', {
                                                        username : req.session.username,
                                                        bookedEvents : bookedEvents,
                                                        bookedSlots : bookedSlots
                                                    });
                                                })
                                    

                                    
                                }
                    )
                })
            })

            //TODO: potentially also display outlook events on the same calendar? (toggle option)

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
app.post('/login', (req, res) => {

    console.log('post/login called');
    let email = req.body.email;
    let password = req.body.password;

    //temp validation
    if (email && password) {
        console.log('email and password inputs registered');
        // res.sendFile(path.join(__dirname, 'frontend/public/calendar.html'));
        //db.get("SELECT * FROM Users WHERE email = ? AND password = ?", [email, password], (error, results, fields) => {

        //check for staff user
        db.get("SELECT * \
                FROM Users AS u \
                INNER JOIN Staff AS s \
                ON u.user_id = s.user_id \
                WHERE u.email = ? AND u.password = ?", [email, password], (error, results, fields) => {
            if (error) {
                console.log(error);
            } else {
                
                if (results) {
                    console.log('staff member found');
                    //staff user
                    req.session.type = 'staff';
                    //valid user credentials
                    console.log(`results: ${JSON.stringify(results)}`);
                    req.session.loggedin = true;
                    req.session.user_id = results.user_id;
                    req.session.username = results.firstname;
                    req.session.email = results.email;

                    //redirect
                    res.redirect('/calendar');

                } else {
                    //check for student user
                    db.get("SELECT * \
                            FROM Users AS u \
                            INNER JOIN Students AS s \
                            ON u.user_id = s.user_id \
                            WHERE u.email = ? AND u.password = ?", [email, password], (error, results, fields) => {

                        if (error) {
                            console.log(error);
                        } 
                        else if (results) {
                            console.log('student member found');
                            //student user
                            req.session.type = 'student';
                            //valid user credentials
                            console.log(`results: ${JSON.stringify(results)}`);
                            req.session.loggedin = true;
                            req.session.user_id = results.user_id;
                            req.session.username = results.firstname;
                            req.session.email = results.email;

                            //redirect
                            res.redirect('/calendar');
                        } else {
                            //invalid user
                            res.render('login', {
                                message : 'Email and/or password incorrect. Please try again.'
                            });
                        }
                    });
                }

            }
        });        
    } else {
        //no valid credentials were inputted
        console.log('default render');
        res.render('login', {
            message : ''
        });
        res.end();     
    };
});

//create account route
app.post('/signup', (req, res) => {
    //res.send('sign up page');

    //TODO: verify inputs
    let fname = req.body.firstname;
    let lname = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;
    let type = req.body.account_type;
    console.log(`type of account ${type}`);

    //create entry in database
    db.serialize(() => {
        db.run("INSERT INTO Users (firstname, lastname, email, password) \
                VALUES (?, ?, ?, ?)", [fname, lname, email, password], function (err) {

            if (err) {
                console.log(err);
            }
            //let user_id = db.last_insert_rowid;
            let user_id = this.lastID;
            console.log(`user_id ${user_id}`);
            //req.session.user_id = user_id; //ALSO ADD THIS INTO /LOGIN ? THEN CAN REMOVE FROM CALENDAR

            if (type === 'staff') {
                db.run("INSERT INTO Staff (user_id) VALUES (?)", [user_id]);
            } else {
                db.run("INSERT INTO Students (user_id) VALUES (?)", [user_id]);
            }
        });

        req.session.loggedin = true;
        req.session.username = fname;
        res.redirect('/calendar');                //UNCOMMENT
    });
    

});

//create personal event
app.post('/calendar/create-event', (req, res) => {
    console.log('calendar/create-event POST called');

    //take form data from create event
    let title = req.body.title;
    let description = req.body.description;
    //temp loc
    let location = req.body.location;
    let participants = req.body.participants;
    let sTime = req.body.s;
    let fTime = req.body.e;
    let eventDate = req.body.eventdate;
    
    //not registering title from form
    console.log(title);
    console.log(description);
    //temp loc
    console.log(location);
    console.log(participants);
    console.log(sTime);
    console.log(fTime);
    console.log(req.session.user_id);
    
    db.serialize(() => {
        //for testing purposes, need to add checkbox for "online" so that is formatted correctly

        //create online event
        if (location === 'online') {
            console.log('location is online');
            // db.run("INSERT INTO Locations (name) VALUES (?)", location, function(error) {
            //     let location_id = this.lastID;
            //     console.log(`location_id ${location_id}`);

                //1 is the location_id for 'online'
                db.run("INSERT INTO EventInfo (title, description, location_id) VALUES (?, ?, ?)", [title, description, 1], function(error) {
                    let event_id = this.lastID;
                    console.log(`event_id ${event_id}`);
        
                    db.run("INSERT INTO TimeInfo (date, time_start, time_finish) VALUES (?, ?, ?)", [eventDate, sTime, fTime], function(error) {
                        let time_id = this.lastID;
                        console.log(`time_id ${time_id}`);
            
                        db.run("INSERT INTO BookedEvents (host_id, time_id, event_id) VALUES (?, ?, ?)", [req.session.user_id, time_id, event_id], function(error) {

                            if (participants) {   //assume just 1 participant for now, later will need to manipulate input data
                                //db.run("INSERT INTO ParticipationType (participation_type_name) VALUES (?)", 'invited', function(error, results) {
                                    //let participation_type_id = this.lastID;
                                    //console.log(`participation_type_id ${participation_type_id}`);

                                    db.get("SELECT user_id FROM Users WHERE email=?", [participants], function(error, results) {
                                        let participant_id = results.user_id;
                                        console.log(`participant_id ${participant_id}`);
                                        db.run("INSERT INTO Participations (event_id, participant_id, participation_type_id) VALUES (?, ?, ?)", [event_id, participant_id, 2]);
                                    })
                                //})   
                            } else {    //if no participants
                                db.run("INSERT INTO Participations (event_id, participant_id, participation_type_id) VALUES (?, ?, ?)", [event_id, null, 1]);
                            }



                            
                        });
                    });
                    
                });
                
            //})
        } else if (location === 'UEA') {
            //2 is the location_id for 'UEA'
            db.run("INSERT INTO EventInfo (title, description, location_id) VALUES (?, ?, ?)", [title, description, 2], function(error) {
                let event_id = this.lastID;
                console.log(`event_id ${event_id}`);
    
                db.run("INSERT INTO TimeInfo (date, time_start, time_finish) VALUES (?, ?, ?)", [eventDate, sTime, fTime], function(error) {
                    let time_id = this.lastID;
                    console.log(`time_id ${time_id}`);
        
                    db.run("INSERT INTO BookedEvents (host_id, time_id, event_id) VALUES (?, ?, ?)", [req.session.user_id, time_id, event_id], function(error) {

                        if (participants) {   //assume just 1 participant for now, later will need to manipulate input data
                            //db.run("INSERT INTO ParticipationType (participation_type_name) VALUES (?)", 'invited', function(error, results) {
                                //let participation_type_id = this.lastID;
                                //console.log(`participation_type_id ${participation_type_id}`);

                                db.get("SELECT user_id FROM Users WHERE email=?", [participants], function(error, results) {
                                    let participant_id = results.user_id;
                                    console.log(`participant_id ${participant_id}`);
                                    db.run("INSERT INTO Participations (event_id, participant_id, participation_type_id) VALUES (?, ?, ?)", [event_id, participant_id, 2]);
                                })
                            //})   
                        } else {    //if no participants
                            db.run("INSERT INTO Participations (event_id, participant_id, participation_type_id) VALUES (?, ?, ?)", [event_id, null, 1]);
                        }



                        
                    });
                });
                
            });
        } else {    //location is new location TODO: allow a user to input a new address

            //create offline event with address
            console.log('location is not online');
            db.run("INSERT INTO Addresses (line_1, line_2, line_3, city, county, postcode, country) VALUES (?, ?, ?, ?, ?, ?, ?)", [line_1, line_2, line_3, city, county, postcode, country], function(error) {
                let address_id = this.lastID;
                console.log(`address_id ${address_id}`);

                db.run("INSERT INTO Locations (name, address_id) VALUES (?, ?)", [location, address_id], function(error) {
                    let location_id = this.lastID;
                    console.log(`loc_id ${loc_id}`);
        
                    db.run("INSERT INTO EventInfo (title, description, location_id) VALUES (?, ?, ?)", [title, description, location_id], function(error) {
                        let event_id = this.lastID;
                        console.log(`event_id ${event_id}`);
            
                        db.run("INSERT INTO TimeInfo (date, time_start, time_finish) VALUES (?, ?, ?)", [eventDate, sTime, fTime], function(error) {
                            let time_id = this.lastID;
                            console.log(`time_id ${time_id}`);
                
                            db.run("INSERT INTO BookedEvents (user_id, time_id, event_id) VALUES (?, ?, ?)", [req.session.user_id, time_id, event_id]);
                        });
                        
                    });
                    
                })
            })

        }
        
    })

    res.redirect('/calendar');        
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

app.post('/calendar/create-reservation', (req, res) => {
    console.log('/calendar/create-reservation POST called');

    //TODO: Check if user acount is a staff member or student
    db.get("SELECT staff_id FROM Staff WHERE user_id=?", [req.session.user_id], function(error, results) {
        if (results) {

            //if student:
            let sTime = req.body.start;
            let fTime = req.body.end;
            let slotDate = req.body.slotdate;
            let staff_id = results.staff_id;

            console.log(sTime);
            console.log(fTime);
            console.log(slotDate);
            console.log(`staff_id: ${staff_id}`);
            console.log(`user_id: ${req.session.user_id}`);

            db.run("INSERT INTO TimeInfo (date, time_start, time_finish) VALUES (?, ?, ?)", [slotDate, sTime, fTime], function(error) {
                let time_id = this.lastID;
                console.log(`time_id ${time_id}`);

                db.run("INSERT INTO BookingSlots (staff_id, time_id) VALUES (?, ?)", [staff_id, time_id]);


                res.redirect('/calendar');  
            })
        } else {
            res.redirect('/calendar');
            //TODO:

            // current user is not a staff member and therefore cannot create reserved timeslots
            // res.render('calendar', {
            //     not_staff_error_message : 'Sorry, you cannot create reserved timeslots as you are a student.',
            //     showReservationMenu : true
            // })
        }
    })  

});

app.get('/slots', (req, res) => {

    //select all reserved slots     //may need to also get email of user?
    db.all("SELECT COUNT(staff_id) AS count FROM Staff", (error, results) => {
        console.log(`results ${JSON.stringify(results)}`);
        console.log(results[0]);      
        let staffCount = Object.values(results[0]);
        console.log(staffCount);

        let slots = {};

        for (i=1; i<=staffCount; i++) {
            //console.log(i);
            db.all("SELECT * \
            FROM BookingSlots as bs \
                INNER JOIN Staff as s \
                    ON bs.staff_id = s.staff_id \
                INNER JOIN TimeInfo as ti \
                    ON bs.time_id = ti.time_id \
                WHERE s.staff_id=?", 
                [i], (error, results) => {
                    console.log(JSON.stringify(results));
                    let availableSlots = results;
                    //console.log(JSON.stringify(availableSlots));
                    console.log(`i: ${i}`);
                    slots[i] = results;
    
                    console.log(`slots ${JSON.stringify(slots)}`);
                    //pass retrieved data back to calendar
                    // res.render('slots', {
                    //     username : req.session.username,
                    //     availableSlots : availableSlots
                    // });
            })
           
        }
        console.log(slots);
    })

    // res.render('slots', {
    //     username : req.session.username,
    //     availableSlots : 'test'
    // });

    

});

// Port Number
const PORT = process.env.PORT ||5000;

// Server Setup
app.listen(PORT,console.log(
`Server started on port ${PORT}`));
