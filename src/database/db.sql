--
-- DROP DATABASE cribbage
-- CREATE DATABASE cribbage
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'English_United States.1252'
--     LC_CTYPE = 'English_United States.1252'
--     TABLESPACE = pg_default
--    CONNECTION LIMIT = -1;

--  installation Directory: /Library/PostgreSQL/13
-- Server Installation Directory: /Library/PostgreSQL/13
-- Data Directory: /Library/PostgreSQL/13/data
-- Database Port: 5432
-- Database Superuser: postgres
-- Operating System Account: postgres
-- Database Service: postgresql-13
-- Command Line Tools Installation Directory: /Library/PostgreSQL/13
-- pgAdmin4 Installation Directory: /Library/PostgreSQL/13/pgAdmin 4
-- Stack Builder Installation Directory: /Library/PostgreSQL/13

drop table usr cascade;
drop table passwd cascade;

CREATE TABLE usr (
    id serial primary key,
    email character varying(128) NOT NULL UNIQUE,
    firstName character varying(128) NOT NULL,
    lastName character varying(128) NOT NULL,
    timestampCreated timestamptz NOT NULL,
    timestampModified timestamptz NOT NULL,
    timestampDeleted timestamptz,
    isDeleted boolean NOT NULL
);

CREATE TABLE passwd (
    id serial primary key,
    id_usr integer references usr(id) on delete cascade,
    salt character(32) NOT NULL,
    passwd character(256) NOT NULL,
    iter integer NOT NULL,
    timestampCreated timestamp with time zone NOT NULL,
    timestampModified timestamp with time zone NOT NULL
);

CREATE TABLE room (
    id serial primary key,
    id_owner integer references usr(id) on delete cascade,
    name character varying(256) NOT NULL,
    timestampCreated timestamp with time zone NOT NULL,
    timestampModified timestamp with time zone NOT NULL,
    UNIQUE (id_owner, name)
);


--ALTER TABLE passwd
--DROP CONSTRAINT passwd_id_usr_fkey;
--ALTER TABLE passwd ADD CONSTRAINT passwd_id_usr_fkey
--   FOREIGN KEY (id_usr)
--   REFERENCES usr(id)
--   ON DELETE CASCADE;

--_____________________________________________________________________________
-- Stored Procedures (Functions)
--_____________________________________________________________________________

--
-- createRoom: create a new cribbage room
--
DROP FUNCTION createRoom(integer, varchar);
CREATE OR REPLACE FUNCTION createRoom(
	id_owner integer,
	name varchar
)
RETURNS room
AS $$
DECLARE myRow room%ROWTYPE;
DECLARE curtime timestamptz = current_timestamp;
BEGIN
  INSERT INTO room(id_owner, name, timestampCreated, timestampModified)
	VALUES (id_owner, name, curtime, curtime)
  RETURNING * INTO myRow;
  RETURN myRow;
END
$$
LANGUAGE 'plpgsql';


CREATE TABLE usr (
    id serial primary key,
    email character varying(128) NOT NULL UNIQUE,
    firstName character varying(128) NOT NULL,
    lastName character varying(128) NOT NULL,
    timestampCreated timestamptz NOT NULL,
    timestampModified timestamptz NOT NULL,
    timestampDeleted timestamptz,
    isDeleted boolean NOT NULL
);


DROP FUNCTION updateUser(integer, varchar, varchar, varchar);
CREATE OR REPLACE FUNCTION updateUser(
    userid integer,
    newemail varchar, 
    newfirstName varchar,
    newlastName varchar 
)
RETURNS int 
AS $$
DECLARE cName text;
DECLARE rc int;
--DECLARE myRow usr%ROWTYPE;
DECLARE curtime timestamptz = current_timestamp;
BEGIN
  UPDATE usr SET 
    email = newemail,
    firstName = newfirstName,
    lastName = newlastName,
    timestampModified = current_timestamp 
  WHERE
    id = userid AND
    isDeleted = false;
  --RETURNING * INTO myRow;
  GET DIAGNOSTICS rc = ROW_COUNT;
  RETURN rc;
  EXCEPTION
    WHEN UNIQUE_VIOLATION THEN
      GET STACKED DIAGNOSTICS cName := CONSTRAINT_NAME;
      IF cName = 'usr_email_key' THEN
      ELSE
        RAISE;
      END IF;
      RETURN -1;
  --RETURN myRow;
END
$$
LANGUAGE 'plpgsql';


--
-- createUser: create a new cribbage user
--

DROP FUNCTION createUser(varchar,varchar,varchar,varchar,varchar,integer);
CREATE OR REPLACE FUNCTION createUser(
	email varchar,
  firstName varchar,
  lastName varchar,
	salt varchar,
	encrypted_password varchar,
	crypt_iters integer
)
RETURNS usr
AS $$
DECLARE cName text;
DECLARE myRow usr%ROWTYPE;
DECLARE curtime timestamptz = current_timestamp;
BEGIN
  BEGIN
    INSERT INTO usr(email, firstName, lastName, timestampCreated, timestampModified, timestampDeleted, isDeleted)
    VALUES (email, firstName, lastName, curtime, curtime, NULL, false)
    RETURNING * INTO myRow;
    EXCEPTION
      WHEN UNIQUE_VIOLATION THEN
        GET STACKED DIAGNOSTICS cName := CONSTRAINT_NAME;
        IF cName = 'usr_email_key' THEN
          RAISE 'attempt to insert duplicate usr with email %', email
            USING ERRCODE = 'ST001';
          RETURN myRow;
        ELSE
          RAISE;
        END IF;
  END;
  BEGIN
    -- Insert password information
    INSERT INTO passwd( id_usr, salt, passwd, iter, timestampCreated, timestampModified)
    VALUES (myRow.id, salt, encrypted_password, crypt_iters, curtime, curtime);
    RETURN myRow;
  END;
END
$$
LANGUAGE 'plpgsql';


-- Password for testUser is '1FiddleSticks!'
SELECT * FROM createUser(
  'testUser@test.com',
  'Test',
  'User', 
  '1ba8640d6040885447708fc033ee737e', 
  '2319c92a30e2bf2f8ab1e1d2c767265522fae630e6e2a625cbebd7ad97253ff8051b3057978d584efab91eef4723d0d0ab80bb151247a9cae7002ace55523ab8a068dc6074595a3c51e1ae803c22bbf8a764fbf96231c02cb58213bcedab8c0181128fd47479064cc6d77d1f0dc3220d01caeefbe94df24774b373687f04eba3', 
  100000);

DELETE from usr where email LIKE 'goo%';


INSERT into usr(id,email,firstName,lastName,timeStampCreated,
timestampModified, timeStampDeleted, isDeleted) 
VALUES (1,'steve@bozo.com','Steve','Bozo',CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, false);

SELECT * from usr;

INSERT into usr(id,email,firstName,lastName,timeStampCreated,
timestampModified, timeStampDeleted, isDeleted) 
VALUES (2,'steve@bozo.com','Steve','Bozo',CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, false);



--INSERT INTO usr( email, active, validated, timestampcreated, timestampmodified)
--VALUES
--  ('testUser@test.com', true, false, current_timestamp, current_timestamp);
