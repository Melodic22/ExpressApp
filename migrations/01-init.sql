PRAGMA foreign_keys = ON;

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
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL
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
    date TEXT NOT NULL,
    time_start TEXT NOT NULL,
    time_finish TEXT NOT NULL,
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
    country TEXT,
    UNIQUE (line_1, line_2, line_3, city, county, postcode, country)
);

--initialise premade locations and participation types
INSERT OR IGNORE INTO Locations VALUES (1, 'Online', null, null, null);
INSERT OR IGNORE INTO Addresses VALUES (1, 'University of East Anglia', 'Norwich Research Park', null, 'Norwich', 'Norfolk', 'NR4 7TJ', 'United Kingdom');
INSERT OR IGNORE INTO ParticipationType VALUES (1, 'null');
INSERT OR IGNORE INTO ParticipationType VALUES (2, 'invited');
INSERT OR IGNORE INTO ParticipationType VALUES (3, 'confirmed');

--initialise testing data

--add users
INSERT OR IGNORE INTO Users VALUES (1, 'Bob', 'Smith', 'bob.smith63@outlook.com', '255bc32723b68496d441646e6d294b6451c582546f157266d5312b9a389ee6807fa0dd580f1fbfa31366e98c143e7176adafd0497dfbbc44327dab5decae0d5c', 'fdb760b9e0432b05df6431d0824ff2513d5e60d45ff53d1d');
INSERT OR IGNORE INTO Students VALUES (1, 1);
INSERT OR IGNORE INTO Users VALUES (2, 'Megan', 'Adams', 'megan.adams25@outlook.com', '3ce40848627c943e75149e8e6fb4a17912a5ea96e1df0bc74573563a3e55df213eebb2becacea3b3016d50e5f9f4b895f6ef5ceb6efcf48198b801a25f399ccb', '31bcf92cfba8274d108e8b2ec1314f378c6a12379af5f428');
INSERT OR IGNORE INTO Students VALUES (2, 2);
INSERT OR IGNORE INTO Users VALUES (3, 'Robert', 'James', 'robert.james331@outlook.com', '0cd9adbe988e336947e8912e69ce90b43d232031d294d32c29b8fa9ddf5b388eb4259090dd05c2be2e56ddf17811e9fd201cc8a8b710df149727c5c66a74ae7a', '7cfeb234378e3fcb4fcc17729bddd67541d4e387f2548dbb');
INSERT OR IGNORE INTO Staff VALUES (1, 3);
INSERT OR IGNORE INTO Users VALUES (4, 'Tyler', 'Drew', 'tyler.drew1@outlook.com', '33fc4b35d16dbf33c974c2357d19ce083b6b8f529b50a03c4977aa1d86f42176f07bd32231032bae29aa0e198012e532921ea35364230a802dd8105de897fbf1', '4f91df561eed18658068c14e75abed08c0acbf6477d5800d');
INSERT OR IGNORE INTO Staff VALUES (2, 4);

--add addresses
INSERT OR IGNORE INTO Addresses VALUES (2, '2 Langdon Avenue', null, null, 'Norwich', 'Norfolk', 'NR10 1KD', 'United Kingdom');
INSERT OR IGNORE INTO Addresses VALUES (3, '75 Imaginary Road', 'Cottenham', null, 'Norwich', 'Norfolk', 'NR3 7TU', 'United Kingdom');

--add locations
INSERT OR IGNORE INTO Locations VALUES (2, 'UEA Campus', 'SCI', 2.37, 1);
INSERT OR IGNORE INTO Locations VALUES (3, 'UEA Campus', 'SCI', 2.38, 1);
INSERT OR IGNORE INTO Locations VALUES (4, 'UEA Campus', 'NewSci', 2.1, 1);
INSERT OR IGNORE INTO Locations VALUES (5, "Robert's House", null, null, 2);
INSERT OR IGNORE INTO Locations VALUES (6, 'Community Centre', null, null, 3);

--add timeInfo
INSERT OR IGNORE INTO TimeInfo VALUES (1, '18/05/2022', '12:00', '12:30');
INSERT OR IGNORE INTO TimeInfo VALUES (2, '18/05/2022', '16:00', '16:30');
INSERT OR IGNORE INTO TimeInfo VALUES (3, '18/05/2022', '14:00', '15:30');
INSERT OR IGNORE INTO TimeInfo VALUES (4, '20/05/2022', '15:00', '15:30');
INSERT OR IGNORE INTO TimeInfo VALUES (5, '20/05/2022', '16:00', '16:30');
INSERT OR IGNORE INTO TimeInfo VALUES (6, '10/05/2022', '12:00', '12:15');
INSERT OR IGNORE INTO TimeInfo VALUES (7, '10/05/2022', '10:00', '10:30');
INSERT OR IGNORE INTO TimeInfo VALUES (8, '12/05/2022', '10:00', '10:30');
INSERT OR IGNORE INTO TimeInfo VALUES (9, '13/05/2022', '10:00', '10:45');
INSERT OR IGNORE INTO TimeInfo VALUES (10, '14/05/2022', '10:00', '10:15');
INSERT OR IGNORE INTO TimeInfo VALUES (11, '17/05/2022', '09:00', '10:00');

--add reservations
INSERT OR IGNORE INTO BookingSlots VALUES (1, 1, 1, 1);
INSERT OR IGNORE INTO BookingSlots VALUES (2, 1, 5, 2);
INSERT OR IGNORE INTO BookingSlots VALUES (3, 2, 1, 3);
INSERT OR IGNORE INTO BookingSlots VALUES (4, 2, 3, 4);

--add eventInfo
INSERT OR IGNORE INTO EventInfo VALUES (1, 'Lecture', 'DSS Lecture', 1);
INSERT OR IGNORE INTO EventInfo VALUES (2, 'Lecture', 'DSA Lecture', 1);
INSERT OR IGNORE INTO EventInfo VALUES (3, 'Lecture', '3YP Lecture', 4);
INSERT OR IGNORE INTO EventInfo VALUES (4, 'Lecture', 'AI Lecture', 4);
INSERT OR IGNORE INTO EventInfo VALUES (5, 'Party', "Robert's Birthday party", 5);   --hosted by robert
INSERT OR IGNORE INTO EventInfo VALUES (6, 'BBQ', "Megan's Barbeque", 6);   --hosted by megan
INSERT OR IGNORE INTO EventInfo VALUES (7, 'Job Interview', 'Job interview with Google', 1);

--add 'booked advisor meetings' eventInfo
INSERT OR IGNORE INTO EventInfo VALUES (8, 'Advisor Meeting', 'A meeting between Bob Smith and Robert James', 3);
INSERT OR IGNORE INTO EventInfo VALUES (9, 'Advisor Meeting', 'A meeting between Bob Smith and Robert James', 3);
INSERT OR IGNORE INTO EventInfo VALUES (10, 'Advisor Meeting', 'A meeting between Megan Adams and Tyler Drew', 2);
INSERT OR IGNORE INTO EventInfo VALUES (11, 'Advisor Meeting', 'A meeting between Megan Adams and Tyler Drew', 1);

--add participations
INSERT OR IGNORE INTO Participations VALUES (5, 1, 3);
INSERT OR IGNORE INTO Participations VALUES (5, 2, 3);
INSERT OR IGNORE INTO Participations VALUES (5, 4, 3);
INSERT OR IGNORE INTO Participations VALUES (6, 3, 3);
INSERT OR IGNORE INTO Participations VALUES (6, 1, 3);

-- add 'booked advisor meeting' participations
INSERT OR IGNORE INTO Participations VALUES (8, 1, 3);
INSERT OR IGNORE INTO Participations VALUES (9, 1, 3);
INSERT OR IGNORE INTO Participations VALUES (10, 2, 3);
INSERT OR IGNORE INTO Participations VALUES (11, 2, 3);

--add bookedEvents
INSERT OR IGNORE INTO BookedEvents VALUES (1, 2, 1);
INSERT OR IGNORE INTO BookedEvents VALUES (1, 4, 2);
INSERT OR IGNORE INTO BookedEvents VALUES (1, 7, 3);
INSERT OR IGNORE INTO BookedEvents VALUES (2, 4, 4);
INSERT OR IGNORE INTO BookedEvents VALUES (3, 2, 5);
INSERT OR IGNORE INTO BookedEvents VALUES (2, 6, 6);
INSERT OR IGNORE INTO BookedEvents VALUES (3, 7, 7);

-- add 'booked advisor meetings' BookedEvents
INSERT OR IGNORE INTO BookedEvents VALUES (3, 8, 8);
INSERT OR IGNORE INTO BookedEvents VALUES (3, 9, 9);
INSERT OR IGNORE INTO BookedEvents VALUES (4, 10, 10);
INSERT OR IGNORE INTO BookedEvents VALUES (4, 11, 11);