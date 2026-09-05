import MySQLdb

print("🔍 Testing MySQL connection...")
print("Trying with no password...")

try:
    db = MySQLdb.connect(
        host='localhost',
        user='root',
        passwd='',
        db='aesthetic_girly_gleam'
    )
    print("✅ CONNECTED! No password needed.")
    db.close()
except MySQLdb.OperationalError as e:
    print(f"❌ Failed with no password: {e}")
    
    print("\nTrying with password...")
    password = input("Enter your MySQL password (or press Enter for none): ")
    
    try:
        db = MySQLdb.connect(
            host='localhost',
            user='root',
            passwd=password,
            db='aesthetic_girly_gleam'
        )
        print("✅ CONNECTED! Password is:", password)
        db.close()
        
        # Save to .env
        with open('.env', 'r') as f:
            lines = f.readlines()
        with open('.env', 'w') as f:
            for line in lines:
                if line.startswith('MYSQL_PASSWORD='):
                    f.write(f'MYSQL_PASSWORD={password}\n')
                else:
                    f.write(line)
        print("✅ Password saved to .env")
        
    except Exception as e2:
        print(f"❌ Failed with password: {e2}")