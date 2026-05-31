import pymysql
from pypdf import PdfReader
import sys

def main():
    # Parse PDF
    try:
        reader = PdfReader(r"C:\Users\Acer\Documents\Coral dashboard\ค่าต้นแบบ.pdf")
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        print("Error reading PDF:", e)
        return

    lines = text.split("\n")
    data_rows = []
    started = False
    for line in lines:
        line = line.strip()
        if "R S T U V W LABEL" in line:
            started = True
            continue
        if started and line:
            parts = line.split()
            if len(parts) == 7:
                try:
                    row = [float(p) for p in parts]
                    data_rows.append(row)
                except ValueError:
                    pass

    # Connect to DB
    try:
        conn = pymysql.connect(host='localhost', port=3306, user='root', password='')
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS coral_dashboard")
        cursor.execute("USE coral_dashboard")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS spectral_sensor_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                r FLOAT,
                s FLOAT,
                t FLOAT,
                u FLOAT,
                v FLOAT,
                w FLOAT,
                label FLOAT
            )
        """)
        cursor.execute("TRUNCATE TABLE spectral_sensor_data")
        
        for row in data_rows:
            cursor.execute("INSERT INTO spectral_sensor_data (r, s, t, u, v, w, label) VALUES (%s, %s, %s, %s, %s, %s, %s)", tuple(row))
        
        conn.commit()
        conn.close()
        print(f"Database setup and data insertion successful! Inserted {len(data_rows)} rows.")
    except Exception as e:
        print("Database Error:", e)

if __name__ == "__main__":
    main()
