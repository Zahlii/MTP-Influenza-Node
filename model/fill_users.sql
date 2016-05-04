USE c4nenns;
DROP PROCEDURE IF EXISTS DATA;
DELIMITER $$  
CREATE PROCEDURE DATA()
BEGIN
	DECLARE n INT Default 10;
	DECLARE a INT Default 0;
    DECLARE year INT Default 1980;
    DECLARE gender VARCHAR(1) Default "M";
	simple_loop: LOOP
		SET a=a+1;
        SET year = FLOOR(1980 + (RAND() * 35));
        SET gender = IF(RAND()>0.51,"M","F");
		INSERT INTO user(mail,birth_year,password_hash,full_name,gender) VALUES ("test@it.com",year,"abc","def",gender);
		IF a>=n THEN
			LEAVE simple_loop;
		END IF;
	END LOOP simple_loop;
END $$

CALL DATA();