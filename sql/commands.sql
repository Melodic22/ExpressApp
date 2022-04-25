--PRAGMA FOREIGN_keys;
PRAGMA foreign_keys = ON;
--PRAGMA FOREIGN_keys;

-- DROP TABLE ParticipationType;
-- DROP TABLE Participations;
-- DROP TABLE BookedEvents;
-- DROP TABLE TimeInfo;
-- DROP TABLE EventInfo;
-- DROP TABLE Locations;
-- DROP TABLE Addresses;

--THIS IS THE ORDER EVENTS MUST BE DELETED
-- DELETE FROM Addresses;
-- DELETE FROM participations;
-- DELETE FROM ParticipationType;
-- DELETE FROM BookedEvents;
-- DELETE FROM TimeInfo;
-- DELETE FROM EventInfo;
-- DELETE FROM Locations;
-- DELETE FROM Addresses;


SELECT * FROM BookingSlots as bs 
    INNER JOIN Staff as s 
        ON bs.staff_id = s.staff_id 
    INNER JOIN TimeInfo as ti 
        ON bs.time_id = ti.time_id
    INNER JOIN Users as u
        ON s.user_id = u.user_id
    ORDER BY staff_id ASC;

    --slot_id, staff_id, time_id, user_id, date, time_start, time_finish, firstname, lastname, email

SELECT slot_id, s.staff_id, ti.time_id, date, time_start, time_finish, s.user_id, firstname, lastname, email FROM BookingSlots as bs 
    INNER JOIN Staff as s 
        ON bs.staff_id = s.staff_id 
    INNER JOIN TimeInfo as ti 
        ON bs.time_id = ti.time_id
    INNER JOIN Users as u
        ON s.user_id = u.user_id
    ORDER BY s.staff_id ASC;

-- DELETE FROM Students WHERE user_id=6;
-- DELETE FROM Users WHERE user_id=6;








