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

// db.run("DROP TABLE accounts");
//db.run("DROP TABLE events");

//db.run("INSERT INTO events (user_id, location_id, title, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)", [2, 3, 'test', '17/04/2022', '16:00:00', '17:00:00']);
// db.run("INSERT INTO events (user_id, location_id, title, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)", [2, 4, 'newtest', '18/04/2022', '14:00:00', '14:15:00']);

// db.run("INSERT INTO events (user_id, location_id, title, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)", [1, 3, 'em event', '17/04/2022', '16:00:00', '17:00:00']);
// db.run("INSERT INTO events (user_id, location_id, title, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)", [1, 4, 'em another event', '18/04/2022', '14:00:00', '14:15:00']);

//db.run("INSERT INTO events (user_id, location_id, participants, title, description, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [1, 4, 'matt and em', 'em another event', 'this is a description', '20/04/2022', '14:00:00', '14:15:00']);



db.run('CREATE TABLE IF NOT EXISTS accounts (' +
        'user_id INTEGER PRIMARY KEY NOT NULL,' +
        'firstname TEXT NOT NULL,' +
        'lastname TEXT NOT NULL,' +
        'email TEXT NOT NULL,' +
        'password TEXT NOT NULL' +
        ')'
    );

db.run('CREATE TABLE IF NOT EXISTS events (' +
        'event_id INTEGER PRIMARY KEY NOT NULL,' +
        'user_id INTEGER NOT NULL,' +
        'location_id TEXT NOT NULL,' +
        'participants TEXT,' +       //may have to change to "supervisor_id"
        'title TEXT NOT NULL,' +
        'description TEXT,' +
        'date TEXT NOT NULL,' +    //"YYYY-MM-DD HH:MM:SS.SSS"
        'start_time TEXT NOT NULL,' +    //HH:MM:SS.SSS" 
        'end_time TEXT NOT NULL' +      //HH:MM:SS.SSS"     
        ')'
    );

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
            console.log('hi' + req.session.email);
            //get all events for current user
            db.get("SELECT user_id FROM accounts WHERE email = ?", [req.session.email], (error, results, fields) => {
                let user_id = results.user_id;

                //for use elsewhere in the program when accessing the db
                req.session.user_id = user_id;
                
                console.log('userid: '+user_id);
                db.all("SELECT * FROM events WHERE user_id = ?", [user_id], (error, results, fields) => {
                    console.log(results);
                    // res.send(results);

                    res.render('calendar', {
                        username : req.session.username,
                        results : results
                    })


                });
            },
            
            //pass each event to frontend
            //display event on appropriate day

            //TODO: potentially also display outlook events on the same calendar? (toggle option)

        );

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

app.get('/hi', (req, res) => {
    res.send('A simple Node App is ' + 'running on this server')
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

    //temp authentication
    if (email && password) {
        console.log('if statement true');
        // res.sendFile(path.join(__dirname, 'frontend/public/calendar.html'));
        db.all("SELECT * FROM accounts WHERE email = ? AND password = ?", [email, password], (error, results, fields) => {
            if (error) throw error;

            if (results.length > 0) {
                // Authenticate the user
				req.session.loggedin = true;
                //gonna have to change this to query the database for the current user and find their Firstname
				//req.session.username = email;

                db.get("SELECT firstname FROM accounts WHERE email = ?", [email], (error, results, fields) => {
                    
                    if (error) {
                        console.log(error);
                    } else {
                        req.session.username = results.firstname;
                        req.session.email = email;
                        //redirect
                        res.redirect('/calendar');
                    }     
                });
            } else {
                //invalid user credentials
                res.render('login', {
                    message : 'Email and/or password incorrect. Please try again.'
                });
            }
            //res.end();
            
        });
    } else {
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

    //TOOO: verify inputs
    let fname = req.body.firstname;
    let lname = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;

    //create entry in database
    db.run("INSERT INTO accounts (firstname, lastname, email, password) VALUES (?, ?, ?, ?)", [fname, lname, email, password]);
    //redirect to calendar page
    req.session.loggedin = true;
    req.session.username = fname;
    res.redirect('/calendar');
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
    let sTime = req.body.start;
    let fTime = req.body.end;
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
    

    db.run("INSERT INTO events (user_id, location_id, participants, title, description, date, start_time, end_time)" +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [req.session.user_id, location, participants, title, description, eventDate, sTime, fTime]);

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
})


// Port Number
const PORT = process.env.PORT ||5000;

// Server Setup
app.listen(PORT,console.log(
`Server started on port ${PORT}`));
