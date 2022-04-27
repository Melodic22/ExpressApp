const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');


//opens the database
async function getDatabase() {
    const dbPromise = sqlite.open({
        filename: 'db.sqlite3',
        driver: sqlite3.Database})
    let db = await dbPromise
    //await db.migrate()
    return db;
}

// async function getDatabase() {
//     // const db = new sqlite3.Database('.../db.sqlite3'); 
//     const db = new sqlite3.Database('C:/Users/Matt/Documents/Univerity/Computing/Third Year Project/ExpressApp/db.sqlite3'); 
//     return db;
// }



//helper functions
async function InsertEventInfo(title, description, location_id) {
    let db = await getDatabase();
    return db.run(`INSERT INTO EventInfo (title, description, location_id) VALUES (${title}, ${description}, ${location_id})`);
}

async function getUserIdByEmail(email) {
    let db = await getDatabase();
    // return await db.get(`SELECT user_id FROM Users WHERE email = ?`, [email]);
    return await db.get(`SELECT user_id FROM Users WHERE email = $email`, [email]);
};

async function getBookedEventsByUserId(host_id) {
    let db = await getDatabase();
    return await db.all(`SELECT * \
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
                            WHERE b.host_id = ?`, [host_id]);
};

async function getBookedSlotsByUserId(host_id) {
    let db = await getDatabase();
    return await db.all(`SELECT * \
                        FROM BookingSlots as bs \
                            INNER JOIN Staff as s \
                                ON bs.staff_id = s.staff_id \
                            INNER JOIN TimeInfo as ti \
                                ON bs.time_id = ti.time_id \
                            WHERE s.user_id = ?`, [host_id]);
};

async function getStaffByEmailPassword(email, password) {
    let db = await getDatabase();
    return await db.get(`SELECT * \
                        FROM Users AS u \
                        INNER JOIN Staff AS s \
                        ON u.user_id = s.user_id \
                        WHERE u.email = ? AND u.password = ?`, [email, password]);
};

async function getStaffByUserId(user_id) {
    const db = await getDatabase();
    return await db.get(`SELECT * FROM Staff WHERE user_id=?`, [user_id]);
};

async function getStudentByEmailPassword(email, password) {
    let db = await getDatabase();
    return await db.get(`SELECT * \
                        FROM Users AS u \
                        INNER JOIN Students AS s \
                        ON u.user_id = s.user_id \
                        WHERE u.email = ? AND u.password = ?`, [email, password]);
};

async function createUser(firstname, lastname, email, password) {
    let db = await getDatabase();
    return await db.run(`INSERT INTO Users (firstname, lastname, email, password) \
                        VALUES (?, ?, ?, ?)`, [firstname, lastname, email, password])
};

async function createStaff(user_id) {
    let db = await getDatabase();
    return await db.run(`INSERT INTO Staff (user_id) VALUES (?)`, [user_id]);
};

async function createStudent(user_id) {
    let db = await getDatabase();
    return await db.run(`INSERT INTO Students (user_id) VALUES (?)`, [user_id]);
};

async function createEvent(title, description, location_id, eventDate, sTime, fTime, host_id) {
    const db = await getDatabase();

    const EventInfo = await db.run(`INSERT INTO EventInfo (title, description, location_id) VALUES (?, ?, ?)`, [title, description, location_id]);
    const TimeInfo = await db.run(`INSERT INTO TimeInfo (date, time_start, time_finish) VALUES (?, ?, ?)`, [eventDate, sTime, fTime]);
    return await db.run(`INSERT INTO BookedEvents (host_id, time_id, event_id) VALUES (?, ?, ?)`, [host_id, TimeInfo.lastID, EventInfo.lastID]);
};

async function createLocation(location_name, locBuilding, locRoom, address_id) {
    const db = await getDatabase();
    return await db.run(`INSERT INTO Locations (location_name, location_building, location_room, address_id) VALUES (?, ?, ?, ?)`, 
                [location_name, locBuilding, locRoom, address_id]);
};

async function addAddress(locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry) {
    const db = await getDatabase();
    return await db.run(`INSERT INTO Addresses (line_1, line_2, line_3, city, county, postcode, country) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry]);
}

async function getLocationByUEARoom(location, locBuilding, locRoom) {
    const db = await getDatabase();
    return await db.get(`SELECT location_id FROM Locations WHERE location_name = ? and location_building = ? and location_room = ?`, 
                        [location, locBuilding, locRoom]);
};

async function getAddress(locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry) {
    const db = await getDatabase();
    return await db.get(`SELECT address_id FROM Addresses WHERE line_1=? and line_2=? and line_3=? and city=? and county=? and postcode=? and country=?`, 
                        [locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry]);
}

async function inviteParticipant(event_id, participant_id) {
    const db = await getDatabase();
    return await db.run(`INSERT INTO Participations (event_id, participant_id, participation_type_id) VALUES (?, ?, ?)`, [event_id, participant_id, 2]);
};

async function createReservation(slotDate, sTime, fTime, location_id, staff_id) {
    const db = await getDatabase();
    console.log(`fTime in dbtools: ${fTime}`);
    const TimeInfo = await db.run(`INSERT INTO TimeInfo (date, time_start, time_finish) VALUES (?, ?, ?)`, [slotDate, sTime, fTime]);
    return await db.run(`INSERT INTO BookingSlots (staff_id, time_id, location_id) VALUES (?, ?, ?)`, [staff_id, TimeInfo.lastID, location_id]);
};

async function getAllReservations() {
    const db = await getDatabase();
    return await db.all(`SELECT slot_id, s.staff_id, ti.time_id, date, time_start, time_finish, s.user_id, firstname, lastname, email \
                            FROM BookingSlots as bs \
                            INNER JOIN Staff as s \
                                ON bs.staff_id = s.staff_id \
                            INNER JOIN TimeInfo as ti \
                                ON bs.time_id = ti.time_id\
                            INNER JOIN Users as u\
                                ON s.user_id = u.user_id\
                            ORDER BY s.staff_id ASC;`);
};



module.exports = {
    InsertEventInfo, getUserIdByEmail, getBookedEventsByUserId, getBookedSlotsByUserId, getStaffByEmailPassword, 
    getStudentByEmailPassword, createUser, createStaff, createStudent, createEvent, inviteParticipant, createReservation,
    getLocationByUEARoom, createLocation, getAddress, addAddress, getStaffByUserId, getAllReservations
}