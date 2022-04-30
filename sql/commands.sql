--PRAGMA FOREIGN_keys;
PRAGMA foreign_keys = ON;
--PRAGMA FOREIGN_keys;

-- DROP TABLE Students;
-- DROP TABLE Staff;

-- DROP TABLE Users;

-- DROP TABLE ParticipationType;
-- DROP TABLE Participations;
-- DROP TABLE BookingSlots;
-- DROP TABLE BookedEvents;
-- DROP TABLE TimeInfo;
-- DROP TABLE EventInfo;
-- DROP TABLE Locations;
-- DROP TABLE Addresses;



-- INSERT INTO Users_2 SELECT * FROM Users;



--TO CLEAR ALL EVENT AND SLOT DATA
-- DELETE FROM participations;
-- DELETE FROM BookedEvents;
-- DELETE FROM BookingSlots;
-- DELETE FROM TimeInfo;
-- DELETE FROM EventInfo;
-- DELETE FROM Locations;

--del bookingSlots, timeinfo, locations, addresses order

-- DELETE FROM Addresses WHERE address_id = (SELECT address_id FROM Locations WHERE location_id = (SELECT location_id FROM BookingSlots WHERE slot_id = 5));
-- DELETE FROM Locations WHERE location_id = (SELECT location_id FROM BookingSlots WHERE slot_id = 5);
-- DELETE FROM TimeInfo WHERE time_id = (SELECT time_id FROM BookingSlots WHERE slot_id = 5);
DELETE FROM BookingSlots WHERE slot_id = 4;
-- INSERT INTO BookingSlots VALUES (5, 1, 22, 4);


-- DELETE FROM Staff;
-- DELETE FROM Users;

-- INSERT INTO EventInfo (title, description, location_id) VALUES ('test', 'extra', 1);

--INSERT INTO Locations VALUES (2, 'uea', 'room2', '3.2', null);
--INSERT INTO Locations VALUES (3, 'uea', 'room2', '3.2', null);

--INSERT INTO Locations VALUES (2, 'UEA Campus', 'room2', 3.2, 1);

-- SELECT EXISTS(SELECT location_id FROM Locations WHERE location_name = 'UEA Campus' and location_building = 'room2' and location_room = 3.2);
-- SELECT location_id FROM Locations WHERE EXISTS (SELECT 1 FROM Locations WHERE location_name = 'uea' and location_building = 'room2' and location_room = 3.2);
-- SELECT EXISTS(SELECT location_id FROM Locations WHERE location_name = new.location_name and location_building = new.location_building and location_room = new.location_room)

-- CREATE TRIGGER avoid_duplicate_user_locations
--    BEFORE INSERT
--    ON Locations
--    when exists (select * from Locations where location_name = new.location_name and location_building = new.location_building and location_room = new.location_room)
-- BEGIN
-- SELECT
--      RAISE (ABORT,'duplicate entry');

-- END;

-- INSERT INTO BookingSlots (staff_id, time_id, location_id) VALUES (2, 5, 1);






