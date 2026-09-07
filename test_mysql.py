import pymysql

passwords = ['', 'root', 'admin', 'password', '123456', 'root1234', 'mysql']
connected = False

for pwd in passwords:
    try:
        conn = pymysql.connect(host='localhost', user='root', password=pwd, port=3306)
        print(f"SUCCESS: Connected to MySQL with password: '{pwd}'")
        with conn.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS date_validation_db;")
            print("Database 'date_validation_db' created/verified in MySQL!")
        conn.close()
        connected = True
        break
    except Exception as e:
        print(f"Failed with password '{pwd}': {e}")

if not connected:
    print("Could not connect with default passwords.")
