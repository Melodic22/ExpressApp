const res = require('express/lib/response');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const encryption = require("./encryption");


//opens the database
async function getDatabase() {
    const dbPromise = sqlite.open({
        filename: 'db.sqlite3',
        driver: sqlite3.Database})
    let db = await dbPromise
    // await db.run("PRAGMA foreign_keys = ON");
    await db.migrate()
    return db;
}

//function to populate the database with dummy entries 
async function populate() {
    //add users
    let salt = crypto.pseudoRandomBytes(24).toString('hex');
    let hash = await encryption.hashPassword('passpasspass', salt)
    let newUser = await createUser('Bob', 'Smith', 'bob.smith63@outlook.com', hash, salt);  //user_id = 1
    await createStudent(1);

    salt = crypto.pseudoRandomBytes(24).toString('hex');
    hash = await encryption.hashPassword('passpasspass', salt)
    newUser = await createUser('Megan', 'Adams', 'megan.adams25@outlook.com', hash, salt);  //user_id = 2
    await createStudent(2);

    salt = crypto.pseudoRandomBytes(24).toString('hex');
    hash = await encryption.hashPassword('passpasspass', salt)
    newUser = await createUser('Robert', 'James', 'robert.james331@outlook.com', hash, salt);  //user_id = 3
    await createStaff(3);

    //add some addresses                                                                                  (UEA) //address_id = 1
    await addAddress('3 Langton Close', null, null, 'Norwich', 'Norfolk', 'NR5 8RU', 'United Kingdom'); //address_id = 2
    await addAddress('75 Imaginary Road', 'Cottenham', null, 'Norwich', 'Norfolk', 'NR3 7TU', 'United Kingdom'); //address_id = 3

    //add some locations                                   (Online) //location_id = 1
    await createLocation('UEA Campus', 'SCI', 2.37, 1);       //location_id = 2
    await createLocation('UEA Campus', 'SCI', 2.38, 1);       //location_id = 3
    await createLocation('UEA Campus', 'NewSci', 2.1, 1);     //location_id = 4
    await createLocation('My House', null, null, 2);        //location_id = 5
    await createLocation('Community Centre', null, null, 3);//location_id = 6

    //add online events //date in form dd/mm/yyyy
    await createEvent('DSS Lecture', 'DSS Lecture', 1, '18/05/2022', '12:00', '13:00', 1);      //event_id = 1

    //await createEvent('Meeting with friend', 'A meeting with Megan', 4, '18/05/2022', '15:00', '16:00', 1);      //event_id = 2
    //await dummy_addParticipant(1, 2);

    await createEvent('Work Meeting', 'Meeting to discuss next steps', 3, '20/05/2022', '15:30', '16:00', 2);      //event_id = 3
    await dummy_addParticipant(2, 1);

    await createReservation('15/05/2022', '12:00', '12:30', 1, 3);  //slot_id = 1   //time_id = 4
    let newEvent = await createEventFromReservation('Advisor Meeting', `Meeting between student and advisor`, 1, 4, 3);
    await addParticipant(newEvent.lastID, 1);
    await removeReservationById(1);
    //create res with bob

    await createReservation('18/05/2022', '12:00', '12:30', 1, 3);  //slot_id = 1   //time_id = 5
    newEvent = await createEventFromReservation('Advisor Meeting', `Meeting between student and advisor`, 1, 5, 3);
    await addParticipant(newEvent.lastID, 1);
    await removeReservationById(1);


    /*
        await createReservation('30/04/2022', '16:45', '17:45', 1, 1);
    await createReservation('29/04/2022', '15:45', '17:45', 1, 1);
    await createReservation('28/04/2022', '15:45', '17:45', 1, 2);
    await createReservation('27/04/2022', '16:45', '17:45', 1, 2);
    await createReservation('26/04/2022', '14:45', '16:00', 1, 2);

    //duplicate time entry, slot_id:1 and slot_id:6 should both reference time_id 1
    await createReservation('30/04/2022', '16:45', '17:45', 1, 1);
    */
}

//helper functions
async function InsertEventInfo(title, description, location_id) {
    let db = await getDatabase();
    return db.run(`INSERT INTO EventInfo (title, description, location_id) VALUES (?, ?, ?)`, [title, description, location_id]);
}

async function getUserIdByEmail(email) {
    let db = await getDatabase();
    return await db.get(`SELECT user_id FROM Users WHERE email = ?`, [email]);
};

async function getUserByEmail(email) {
    const db = await getDatabase();
    return await db.get(`SELECT * FROM Users WHERE email = ?`, [email]);
};

// async function getBookedEventsByUserId(host_id) {
//     let db = await getDatabase();
//     return await db.all(`SELECT * \
//                         FROM BookedEvents as b \
//                             INNER JOIN TimeInfo as t \
//                                 ON b.time_id = t.time_id \
//                             INNER JOIN EventInfo as e \
//                                 ON e.event_id = b.event_id \
//                             LEFT OUTER JOIN Participations as p \
//                                 ON b.event_id = p.event_id \
//                             LEFT OUTER JOIN ParticipationType as pt \
//                                 ON pt.participation_type_id = p.participation_type_id \
//                             LEFT OUTER JOIN Locations as l \
//                                 ON e.location_id = l.location_id \
//                             LEFT OUTER JOIN Addresses as a \
//                                 ON l.address_id = a.address_id \
//                             WHERE b.host_id = ?`, [host_id]);
// };

async function getBookedEventByEventId(event_id) {
    let db = await getDatabase();
    return await db.get(`SELECT b.event_id, b.host_id, b.time_id, t.date, t.time_start, t.time_finish, e.title, e.description, e.location_id, \
                            l.location_name, l.location_building, l.location_room, l.address_id, a.line_1, a.line_2, a.line_3, a.city, a.county, a.postcode, a.country, \
                            p.participant_id, pt.participation_type_id, pt.participation_type_name \
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
                            WHERE b.event_id = ?`, [event_id]);
};


async function getBookedEventsByUserId(host_id) {
    const db = await getDatabase();
    return await db.all(`SELECT b.event_id, b.host_id, b.time_id, t.date, t.time_start, t.time_finish, e.title, e.description, e.location_id, \
                            l.location_name, l.location_building, l.location_room, l.address_id, a.line_1, a.line_2, a.line_3, a.city, a.county, a.postcode, a.country, \
                            p.participant_id, pt.participation_type_id, pt.participation_type_name \
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

async function getBookedEventsByParticipantId(participant_id) {
    let db = await getDatabase();
    return await db.all(`SELECT b.event_id, b.host_id, b.time_id, t.date, t.time_start, t.time_finish, e.title, e.description, e.location_id, \
                            l.location_name, l.location_building, l.location_room, l.address_id, a.line_1, a.line_2, a.line_3, a.city, a.county, a.postcode, a.country, \
                            p.participant_id, pt.participation_type_id, pt.participation_type_name \
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
                            WHERE p.participant_id = ? and p.participation_type_id = ?`, [participant_id, 3]);
};

async function getBookedSlotsByUserId(host_id) {
    let db = await getDatabase();
    return await db.all(`SELECT * \
                        FROM BookingSlots as bs \
                            INNER JOIN Staff as s \
                                ON bs.staff_id = s.staff_id \
                            INNER JOIN TimeInfo as ti \
                                ON bs.time_id = ti.time_id \
                            LEFT OUTER JOIN Locations as l 
                                ON bs.location_id = l.location_id 
                            LEFT OUTER JOIN Addresses as a 
                                ON l.address_id = a.address_id 
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

async function getStaffByEmail(email) {
    let db = await getDatabase();
    return await db.get(`SELECT * \
                        FROM Users AS u \
                        INNER JOIN Staff AS s \
                        ON u.user_id = s.user_id \
                        WHERE u.email = ?`, [email]);
};

async function getStaffByUserId(user_id) {
    const db = await getDatabase();
    return await db.get(`SELECT * FROM Staff WHERE user_id = ?`, [user_id]);
};

async function getStudentByEmailPassword(email, password) {
    let db = await getDatabase();
    return await db.get(`SELECT * \
                        FROM Users AS u \
                        INNER JOIN Students AS s \
                        ON u.user_id = s.user_id \
                        WHERE u.email = ? AND u.password = ?`, [email, password]);
};

async function getStudentByEmail(email) {
    let db = await getDatabase();
    return await db.get(`SELECT * \
                        FROM Users AS u \
                        INNER JOIN Students AS s \
                        ON u.user_id = s.user_id \
                        WHERE u.email = ?`, [email]);
};



async function createUser(firstname, lastname, email, hash, salt) {
    let db = await getDatabase();
    return await db.run(`INSERT INTO Users (firstname, lastname, email, password_hash, password_salt) \
                        VALUES (?, ?, ?, ?, ?)`, [firstname, lastname, email, hash, salt])
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
    
    const timeExists = await db.get(`SELECT * FROM TimeInfo WHERE date=? and time_start=? and time_finish=?`, [eventDate, sTime, fTime]);
    
    if (timeExists) {
        return await db.run(`INSERT INTO BookedEvents (host_id, time_id, event_id) VALUES (?, ?, ?)`, [host_id, timeExists.time_id, EventInfo.lastID]);
    } else {
        const TimeInfo = await db.run(`INSERT INTO TimeInfo (date, time_start, time_finish) VALUES (?, ?, ?)`, [eventDate, sTime, fTime]);
        return await db.run(`INSERT INTO BookedEvents (host_id, time_id, event_id) VALUES (?, ?, ?)`, [host_id, TimeInfo.lastID, EventInfo.lastID]);
    }
    
};

async function createEventFromReservation(title, description, location_id, time_id, host_id) {
    const db = await getDatabase();

    const EventInfo = await db.run(`INSERT INTO EventInfo (title, description, location_id) VALUES (?, ?, ?)`, [title, description, location_id]);
    return await db.run(`INSERT INTO BookedEvents (host_id, time_id, event_id) VALUES (?, ?, ?)`, [host_id, time_id, EventInfo.lastID]);
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

async function getLocationByUEARoom(location, locBuilding, locRoom, address_id) {
    const db = await getDatabase();
    return await db.get(`SELECT location_id FROM Locations WHERE location_name = ? and location_building = ? and location_room = ? and address_id = ?`, 
                        [location, locBuilding, locRoom, address_id]);
};

async function getLocationbyLocNameAddress(location_name, address_id) {
    const db = await getDatabase();
    return await db.get(`SELECT location_id FROM Locations WHERE location_name = ? and address_id = ?`, 
                        [location_name, address_id]);
}

async function getAddress(locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry) {
    const db = await getDatabase();
    return await db.get(`SELECT address_id FROM Addresses WHERE line_1=? and line_2=? and line_3=? and city=? and county=? and postcode=? and country=?`, 
                        [locLine1, locLine2, locLine3, locCity, locCounty, locPostcode, locCountry]);
}

//used for creating dummy data
async function dummy_addParticipant(event_id, participant_id) {
    const db = await getDatabase();
    return await db.run(`INSERT INTO Participations (event_id, participant_id, participation_type_id) VALUES (?, ?, ?)`, [event_id, participant_id, 3]);
}

//for inviting participants when creating a new event
async function inviteParticipant(event_id, participant_id) {
    const db = await getDatabase();
    return await db.run(`INSERT INTO Participations (event_id, participant_id, participation_type_id) VALUES (?, ?, ?)`, [event_id, participant_id, 2]);
};

async function updateParticipantType(event_id, participant_id, participation_type_id) {
    const db = await getDatabase();
    return await db.run(`UPDATE Participations SET participation_type_id = ? WHERE event_id = ? and participant_id = ?`, [participation_type_id, event_id, participant_id]);
}

//for changing an invited participant to a confirmed participant
// async function confirmParticipant(event_id, participant_id) {
//     const db = await getDatabase();
//     //alter statement needed
//     //return await db.run(`INSERT INTO Participations (event_id, participant_id, participation_type_id) VALUES (?, ?, ?)`, [event_id, participant_id, 2]);
// };

//for confirming a participant who has booked a slot with a staff member
async function addParticipant(event_id, participant_id) {
    const db = await getDatabase();
    return await db.run(`INSERT INTO Participations (event_id, participant_id, participation_type_id) VALUES (?, ?, ?)`, [event_id, participant_id, 3]);
};

async function createReservation(slotDate, sTime, fTime, location_id, staff_id) {
    const db = await getDatabase();

    //check if time record entry already exists
    const timeExists = await db.get(`SELECT * FROM TimeInfo WHERE date=? and time_start=? and time_finish=?`, [slotDate, sTime, fTime]);
    if (timeExists) {
        return await db.run(`INSERT INTO BookingSlots (staff_id, time_id, location_id) VALUES (?, ?, ?)`, [staff_id, timeExists.time_id, location_id]);    
    } else {
        const TimeInfo = await db.run(`INSERT INTO TimeInfo (date, time_start, time_finish) VALUES (?, ?, ?)`, [slotDate, sTime, fTime]);
        return await db.run(`INSERT INTO BookingSlots (staff_id, time_id, location_id) VALUES (?, ?, ?)`, [staff_id, TimeInfo.lastID, location_id]);
    }
    
    
};

async function deleteReservation(slot_id) {

    const db = await getDatabase();

    //variables to find if the attributes are referenced by other reservations
    let deleteLocation = true;
    let deleteTime = true;
    let deleteAddress = false;

    
    //find if address_id is referenced by other records
    const addressExists = await db.get(`SELECT address_id FROM Addresses WHERE address_id = (
                                        SELECT address_id FROM Locations WHERE location_id = (
                                            SELECT location_id FROM BookingSlots WHERE slot_id = ?))`, [slot_id]);
    if (addressExists) {
        deleteAddress = true;
        const addressCount = await db.all(`SELECT * FROM Locations WHERE address_id = ?`, [addressExists.address_id]);  
        //if address referenced more than once                                      
        addressCount.length > 1 ? deleteAddress = false : "";
        //if address is UEA
        addressExists.address_id === 1 ? deleteAddress = false : "";
    }
                                    

    //find if location_id is referenced by other records                                  
    const location_id = await db.get(`SELECT location_id FROM Locations WHERE location_id = (
                                        SELECT location_id FROM BookingSlots WHERE slot_id = ?)`, [slot_id]);
    const locationCount = await db.all(`SELECT * FROM BookingSlots WHERE location_id = ?`, [location_id.location_id]);
    //if location referenced more than once
    locationCount.length > 1 ? deleteLocation = false : "";
    //if location is online
    location_id.location_id === 1 ? deleteLocation = false : "";

    //find if time_id is referenced by other records
    const time_id = await db.get(`SELECT time_id FROM TimeInfo WHERE time_id = (
                                    SELECT time_id FROM BookingSlots WHERE slot_id = ?)`, [slot_id]);
    const timeCount = await db.all(`SELECT * FROM BookingSlots WHERE time_id = ?`, [time_id.time_id]);
    //if time_id is referenced more than once
    timeCount.length > 1 ? deleteTime = false : "";

    //start deleting
    await db.run(`DELETE FROM BookingSlots WHERE slot_id = ?`, [slot_id]);
    deleteTime ? await db.run(`DELETE FROM TimeInfo WHERE time_id = ?`, [time_id.time_id]) : "";
    deleteLocation ? await db.run(`DELETE FROM Locations WHERE location_id = ?`, [location_id.location_id]) : "";
    deleteAddress ? await db.run(`DELETE FROM Addresses WHERE address_id = ?`, [addressExists.address_id]) : "";

    return true;

};

async function deleteEvent(event_id) {
    const db = await getDatabase();

    //variables to find if the attributes are referenced by other reservations
    let deleteLocation = true;
    let deleteTime = true;
    let deleteAddress = false;

    const addressExists = await db.get(`SELECT address_id FROM Addresses WHERE address_id = (
                                        SELECT address_id FROM Locations WHERE location_id = (
                                        SELECT location_id FROM EventInfo WHERE event_id = ?))`, [event_id]);
    if (addressExists) {
        deleteAddress = true;
        const addressCount = await db.all(`SELECT * FROM Locations WHERE address_id = ?`, [addressExists.address_id]);  
        //if address referenced more than once                                      
        addressCount.length > 1 ? deleteAddress = false : "";
        //if address is UEA
        addressExists.address_id === 1 ? deleteAddress = false : "";
    }


    const location_id = await db.get(`SELECT location_id FROM Locations WHERE location_id = (
                                        SELECT location_id FROM EventInfo WHERE event_id = ?)`, [event_id]);
    const locationCount = await db.all(`SELECT * FROM EventInfo WHERE location_id = ?`, [location_id.location_id]);
    //if location referenced more than once
    locationCount.length > 1 ? deleteLocation = false : "";
    //if location is online
    location_id.location_id === 1 ? deleteLocation = false : "";


    const time_id = await db.get(`SELECT time_id FROM TimeInfo WHERE time_id = (
                                    SELECT time_id FROM BookedEvents WHERE event_id = ?)`, [event_id]);
    const timeCount = await db.all(`SELECT * FROM BookedEvents WHERE time_id = ?`, [time_id.time_id]);
    //if time_id is referenced more than once
    timeCount.length > 1 ? deleteTime = false : "";

    //start deleting
    await db.run(`DELETE FROM Participations WHERE event_id = ?`, [event_id]);
    await db.run(`DELETE FROM BookedEvents WHERE event_id =?`, [event_id]);
    await db.run(`DELETE FROM EventInfo WHERE event_id = ?`, [event_id]);
    deleteTime ? await db.run(`DELETE FROM TimeInfo WHERE time_id = ?`, [time_id.time_id]) : "";
    deleteLocation ? await db.run(`DELETE FROM Locations WHERE location_id = ?`, [location_id.location_id]) : "";
    deleteAddress ? await db.run(`DELETE FROM Addresses WHERE address_id = ?`, [addressExists.address_id]) : "";

    return true;
};

async function removeReservationById(slot_id) {
    const db = await getDatabase();
    return await db.run(`DELETE FROM BookingSlots WHERE slot_id = ?`, [slot_id]);
}

async function getAllReservations() {
    const db = await getDatabase();
    return await db.all(`SELECT slot_id, s.staff_id, ti.time_id, l.location_id, date, time_start, time_finish, s.user_id, firstname, lastname, email \
                            FROM BookingSlots as bs \
                            INNER JOIN Staff as s \
                                ON bs.staff_id = s.staff_id \
                            INNER JOIN TimeInfo as ti \
                                ON bs.time_id = ti.time_id\
                            INNER JOIN Users as u\
                                ON s.user_id = u.user_id\
                            INNER JOIN Locations as l \
                                ON bs.location_id = l.location_id \
                            LEFT JOIN Addresses as a \
                                ON l.address_id = a.address_id \
                            ORDER BY s.staff_id ASC`);
};

async function getReservationById(slot_id) {
    const db = await getDatabase();
    return await db.get(`SELECT * \
                            FROM BookingSlots as bs \
                            INNER JOIN Staff as s \
                                ON bs.staff_id = s.staff_id \
                            INNER JOIN TimeInfo as ti \
                                ON bs.time_id = ti.time_id\
                            INNER JOIN Users as u\
                                ON s.user_id = u.user_id\
                            INNER JOIN Locations as l \
                                ON bs.location_id = l.location_id \
                            LEFT JOIN Addresses as a \
                                ON l.address_id = a.address_id \
                            WHERE bs.slot_id = ?`, [slot_id]);
}



module.exports = {
    getDatabase, InsertEventInfo, getUserIdByEmail, getBookedEventsByUserId, getBookedSlotsByUserId, getStaffByEmailPassword, 
    getStudentByEmailPassword, createUser, createStaff, createStudent, createEvent, inviteParticipant, createReservation,
    getLocationByUEARoom, createLocation, getAddress, addAddress, getStaffByUserId, getAllReservations, getReservationById,
    addParticipant, removeReservationById, createEventFromReservation, deleteReservation, deleteEvent, getLocationbyLocNameAddress,
    getBookedEventsByParticipantId, getUserByEmail, getStaffByEmail, getStudentByEmail, getBookedEventByEventId, updateParticipantType,
    populate
}