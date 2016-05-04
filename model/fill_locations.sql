USE c4nenns;

DROP PROCEDURE IF EXISTS DATA_LOC;
DELIMITER $$  
CREATE PROCEDURE DATA_LOC()
BEGIN
	DECLARE n INT Default 500; -- amount of health reports
    DECLARE n2 INT Default 10; -- avg. amount of locations per health report
    DECLARE n3 INT Default 10; -- determines the actual random amount of locations
	DECLARE a INT Default 0;
    DECLARE a2 INT Default 0;
    DECLARE lat FLOAT Default 49;
    DECLARE lng FLOAT Default 8;
    DECLARE uid INT Default 0;
    DECLARE date TIMESTAMP Default current_timestamp();
    DECLARE date2 TIMESTAMP Default current_timestamp();
    DECLARE lid INT Default 0;
    DECLARE isSick TINYINT(1) DEFAULT 0;
    DECLARE health_score FLOAT DEFAULT 100;
	simple_loop: LOOP -- loop all health reports
		SET a=a+1;
        SET lat = 49+RAND();
        SET lng = 8+RAND();
        SET isSick = ROUND(RAND()-0.3);
        SET health_score = IF(isSick=1,RAND()*80,100);
        SET date = FROM_UNIXTIME(UNIX_TIMESTAMP('2016-04-10 00:00:00') + FLOOR(0 + (RAND() * 30*86400)));
        SELECT id INTO uid FROM user ORDER BY RAND() LIMIT 1; -- grab random user
		INSERT INTO location(user_id,lat,lng,time_observed) VALUES (uid,lat,lng,date); -- first observation location
        INSERT INTO health_report(user_id,location_id,is_sick,health_score,is_newly_infected) VALUES (uid,LAST_INSERT_ID(),isSick,health_score,isSick); -- add health report with generated location
        SET a2=0;
        SET n3 = ROUND(RAND()*n2+3); -- define actual number of locations per report
        simple_loop2: LOOP -- loop all locations per report
			SET a2=a2+1;
			SET lat = 49+RAND();
			SET lng = 8+RAND();
			SET date2 = FROM_UNIXTIME(UNIX_TIMESTAMP(date) + FLOOR(0 + (RAND() * 1*86400))); -- add new location within 1 days after report
			INSERT INTO location(user_id,lat,lng,time_observed) VALUES (uid,lat,lng,date2); -- add new location
			IF a2>=n3 THEN
				LEAVE simple_loop2;
			END IF;
		END LOOP simple_loop2;
		IF a>=n THEN
			LEAVE simple_loop;
		END IF;
	END LOOP simple_loop;
END $$
CALL DATA_LOC();