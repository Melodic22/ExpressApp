CREATE TABLE IF NOT EXISTS Students (
    student_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Staff (
    staff_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY, 
    firstname TEXT NOT NULL, 
    lastname TEXT NOT NULL, 
    email TEXT NOT NULL UNIQUE, 
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS EventInfo (
    event_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    location_id INTEGER NOT NULL,
    FOREIGN KEY(location_id) REFERENCES Locations(location_id)
);

CREATE TABLE IF NOT EXISTS TimeInfo (
    time_id INTEGER PRIMARY KEY,
    date INTEGER NOT NULL,
    time_start INTEGER NOT NULL,
    time_finish INTEGER NOT NULL,
    UNIQUE(date, time_start, time_finish)
);

CREATE TABLE IF NOT EXISTS BookingSlots (
    slot_id INTEGER PRIMARY KEY,
    staff_id INTEGER NOT NULL,
    time_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,    
    FOREIGN KEY(time_id) REFERENCES TimeInfo(time_id),
    FOREIGN KEY(staff_id) REFERENCES Staff(staff_id), 
    FOREIGN KEY(location_id) REFERENCES Locations(location_id)
        
);

CREATE TABLE IF NOT EXISTS BookedEvents (
    host_id INTEGER NOT NULL,
    time_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    FOREIGN KEY (host_id) REFERENCES Users(user_id),
    FOREIGN KEY (time_id) REFERENCES TimeInfo(time_id),
    FOREIGN KEY (event_id) REFERENCES EventInfo(event_id),
    PRIMARY KEY (event_id)
);


CREATE TABLE IF NOT EXISTS Participations (
    event_id INTEGER NOT NULL,
    participant_id INTEGER,
    participation_type_id INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES BookedEvents(event_id),
    FOREIGN KEY (participant_id) REFERENCES Users(user_id),
    FOREIGN KEY (participation_type_id) REFERENCES ParticipationType(participation_type_id),
    PRIMARY KEY (event_id, participant_id, participation_type_id)
);

-- for if confirmed going or invited (optional functionality) etc
CREATE TABLE IF NOT EXISTS ParticipationType (
    participation_type_id INTEGER NOT NULL,
    participation_type_name TEXT NOT NULL,
    PRIMARY KEY (participation_type_id)
);

CREATE TABLE IF NOT EXISTS Locations (
    location_id INTEGER PRIMARY KEY,
    location_name TEXT NOT NULL,
    location_building TEXT,
    location_room REAL,
    address_id INTEGER,
    FOREIGN KEY(address_id) REFERENCES Addresses(address_id),
    UNIQUE (location_name, location_building, location_room, address_id)
);

CREATE TABLE IF NOT EXISTS Addresses (
    address_id INTEGER PRIMARY KEY,
    line_1 TEXT NOT NULL,
    line_2 TEXT,
    line_3 TEXT,
    city TEXT NOT NULL,
    county TEXT,
    postcode TEXT NOT NULL,
    country TEXT
);

--initialise premade locations and participation types
INSERT INTO Locations VALUES (1, 'Online', null, null, null);
INSERT INTO Addresses VALUES (1, 'University of East Anglia', 'Norwich Research Park', null, 'Norwich', 'Norfolk', 'NR4 7TJ', 'United Kingdom');
-- --INSERT INTO Locations VALUES (2, 'Unversity of East Anglia', 1); --has to now also have a building and room number
INSERT INTO ParticipationType VALUES (1, 'null');
INSERT INTO ParticipationType VALUES (2, 'invited');
INSERT INTO ParticipationType VALUES (3, 'confirmed');



-- INSERT INTO accounts VALUES (1, 'Matt', 'Reid', 'matt@matt.com', 'pass');
-- INSERT INTO accounts VALUES (2, 'Em', 'Elliott', 'em@em.com', 'pass');

-- SELECT * FROM ACCOUNTS;

-- INSERT INTO RESERVATIONS VALUES (1, 1, '19/04/2022', '09:00', '09:15');
-- INSERT INTO RESERVATIONS VALUES (2, 2, '19/04/2022', '10:00', '10:15');

-- SELECT * FROM RESERVATIONS;

-- INSERT INTO MEETINGS VALUES (1, 1, 'Matt, Deepesh', 'Advisor Meeting', '');



-- SELECT *
-- FROM reservations AS e
--     INNER JOIN meetings AS m
--     ON e.res_id = m.res_id;
    
    