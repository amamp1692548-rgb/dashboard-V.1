import pymysql
from pypdf import PdfReader
import os

def seed_database():
    # 1. Parse PDF for Spectral Data
    pdf_path = r"C:\Users\Acer\Documents\Coral dashboard\ค่าต้นแบบ.pdf"
    spectral_data_rows = []
    if os.path.exists(pdf_path):
        try:
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            lines = text.split("\n")
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
                            spectral_data_rows.append(row)
                        except ValueError:
                            pass
        except Exception as e:
            print("Error reading PDF:", e)
    else:
        print(f"PDF not found at {pdf_path}")

    # 2. Connect and Seed
    try:
        conn = pymysql.connect(host='localhost', port=3307, user='root', password='')
        cursor = conn.cursor()
        
        # Use new database name to avoid corrupted tablespace issues
        cursor.execute("CREATE DATABASE IF NOT EXISTS coral_dashboard_new")
        cursor.execute("USE coral_dashboard_new")

        # Drop tables if they exist
        tables_to_drop = ['kpi_data', 'profit_loss', 'product_sale', 'reef_locations', 'spectral_sensor_data', 'sales_vs_target']
        for table in tables_to_drop:
            cursor.execute(f"DROP TABLE IF EXISTS {table}")

        # Table: kpi_data
        cursor.execute("""
            CREATE TABLE kpi_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100),
                value VARCHAR(50),
                yoy VARCHAR(20),
                yoySub VARCHAR(50),
                progress INT,
                positive BOOLEAN
            )
        """)
        kpis = [
            ('TOTAL LOCATIONS', '34', 'Active', 'Sensors Deployed', 100, True),
            ('ACTIVE SENSORS', '91.2%', '+2%', 'Compared to last week', 91, True),
            ('ENVIRONMENTAL', '29°C', '8.1 pH', 'Avg Temp & pH Level', 75, True),
            ('ALERTS / NOTIFS', '5', '-12', 'Critical events in 24h', 15, False)
        ]
        cursor.executemany('INSERT INTO kpi_data (title, value, yoy, yoySub, progress, positive) VALUES (%s, %s, %s, %s, %s, %s)', kpis)

        # Table: profit_loss
        cursor.execute("""
            CREATE TABLE profit_loss (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(20),
                income INT,
                expense INT
            )
        """)
        pls = [
            ('Jan', 10000, 5000), ('Feb', 15000, 7000), ('Mar', 12000, 8000),
            ('Apr', 20000, 10000), ('May', 25000, 12000), ('Jun', 30000, 15000)
        ]
        cursor.executemany('INSERT INTO profit_loss (name, income, expense) VALUES (%s, %s, %s)', pls)

        # Table: product_sale
        cursor.execute("""
            CREATE TABLE product_sale (
                id INT AUTO_INCREMENT PRIMARY KEY,
                val VARCHAR(20)
            )
        """)
        products = [('45%',), ('82%',), ('31%',)]
        cursor.executemany('INSERT INTO product_sale (val) VALUES (%s)', products)

        # Table: reef_locations
        cursor.execute("""
            CREATE TABLE reef_locations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                lat FLOAT,
                lng FLOAT,
                health_score INT DEFAULT 100
            )
        """)
        import random
        locations = [
            ("เกาะราชา", 7.6025, 98.3711), ("เกาะเฮ", 7.7439, 98.3744), ("เกาะไม้ท่อน", 7.7611, 98.4794),
            ("เกาะโหลน", 7.7981, 98.3644), ("หมู่เกาะสิมิลัน (เกาะเจ็ด)", 8.5772, 97.6436),
            ("หินหัวกะโหลก (สิมิลัน)", 8.5447, 97.6533), ("หมู่เกาะสุรินทร์", 9.4125, 97.8631),
            ("เกาะตาชัย", 9.0700, 97.8100), ("หมู่เกาะพีพี", 7.7407, 98.7784),
            ("เกาะไก่", 7.9547, 98.8106), ("เกาะปอดะ", 7.9714, 98.8103),
            ("เกาะห้า", 7.4267, 98.8894), ("เกาะกระดาน", 7.3086, 99.2553),
            ("เกาะมุก", 7.3719, 99.2953), ("เกาะเชือก", 7.4111, 99.2547),
            ("เกาะไหง", 7.4117, 99.2081), ("หมู่เกาะหลีเป๊ะ", 6.4886, 99.3025),
            ("เกาะตะรุเตา", 6.6111, 99.6583), ("เกาะอาดัง-ราวี", 6.5500, 99.2833),
            ("เกาะกำใหญ่", 9.4833, 98.3667), ("เกาะกำนุ้ย", 9.4500, 98.4000),
            ("เกาะล้าน (ชลบุรี)", 12.9231, 100.7753), ("เกาะคราม (ชลบุรี)", 12.7000, 100.8667),
            ("เกาะทะลุ (ประจวบ)", 11.0747, 99.5583), ("เกาะล้าน (จันทบุรี)", 12.4431, 102.0542),
            ("เกาะช้าง (ตราด)", 12.0333, 102.3500), ("เกาะกูด (ตราด)", 11.6500, 102.5667),
            ("เกาะหมาก (ตราด)", 11.8167, 102.4833), ("เกาะเต่า", 10.0956, 99.8403),
            ("เกาะนางยวน", 10.1186, 99.8153), ("เกาะสมุย", 9.5120, 100.0136),
            ("เกาะพะงัน", 9.7333, 100.0333), ("หมู่เกาะอ่างทอง", 9.6167, 99.6667),
            ("เกาะกระ (นครศรีฯ)", 8.4167, 100.7333), ("เกาะโลซิน", 7.3333, 101.9667)
        ]
        # Seed with random health scores for demonstration
        locations_with_health = [(name, lat, lng, random.randint(10, 100)) for name, lat, lng in locations]
        cursor.executemany("INSERT INTO reef_locations (name, lat, lng, health_score) VALUES (%s, %s, %s, %s)", locations_with_health)

        # Table: spectral_sensor_data
        cursor.execute("""
            CREATE TABLE spectral_sensor_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                r FLOAT, s FLOAT, t FLOAT, u FLOAT, v FLOAT, w FLOAT, label FLOAT
            )
        """)
        if spectral_data_rows:
            cursor.executemany("INSERT INTO spectral_sensor_data (r, s, t, u, v, w, label) VALUES (%s, %s, %s, %s, %s, %s, %s)", [tuple(r) for r in spectral_data_rows])

        # Table: sales_vs_target
        cursor.execute("""
            CREATE TABLE sales_vs_target (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(20), sales INT, target INT
            )
        """)
        sales = [('1', 12000, 15000), ('2', 15000, 15000), ('3', 11000, 15000), ('4', 18000, 15000), ('5', 22000, 15000), ('6', 24000, 15000)]
        cursor.executemany('INSERT INTO sales_vs_target (name, sales, target) VALUES (%s, %s, %s)', sales)

        conn.commit()
        conn.close()
        print("Database fully seeded and tables recreated!")
    except Exception as e:
        print("Database Error:", e)

if __name__ == "__main__":
    seed_database()
