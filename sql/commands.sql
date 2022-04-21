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
DELETE FROM Addresses;
DELETE FROM participations;
DELETE FROM ParticipationType;
DELETE FROM BookedEvents;
DELETE FROM TimeInfo;
DELETE FROM EventInfo;
DELETE FROM Locations;
-- DELETE FROM Addresses;








