import asyncio
import aiomysql

DB_CONFIG = {
    'host': 'localhost',
    'port': 3307,
    'user': 'root',
    'password': '',
    'db': 'coral_dashboard',
    'autocommit': True,
    'cursorclass': aiomysql.DictCursor
}

async def check_db():
    try:
        pool = await aiomysql.create_pool(**DB_CONFIG)
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                tables = ['kpi_data', 'profit_loss', 'product_sale', 'reef_locations', 'spectral_sensor_data']
                for table in tables:
                    try:
                        await cur.execute(f"SELECT COUNT(*) as count FROM {table}")
                        res = await cur.fetchone()
                        print(f"Table {table}: {res['count']} rows")
                    except Exception as e:
                        print(f"Table {table}: Error or missing ({e})")
        pool.close()
        await pool.wait_closed()
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_db())
