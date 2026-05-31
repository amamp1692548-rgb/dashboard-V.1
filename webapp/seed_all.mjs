import mysql from 'mysql2/promise';

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: '',
  });

  await connection.query('CREATE DATABASE IF NOT EXISTS coral_dashboard');
  await connection.query('USE coral_dashboard');

  // KPI Data
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS kpi_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(100),
      value VARCHAR(50),
      yoy VARCHAR(20),
      yoySub VARCHAR(50),
      progress INT,
      positive BOOLEAN
    )
  `);
  
  await connection.execute('TRUNCATE TABLE kpi_data');
  const kpis = [
    ['TOTAL LOCATIONS', '34', 'Active', 'Sensors Deployed', 100, true],
    ['ACTIVE SENSORS', '91.2%', '+2%', 'Compared to last week', 91, true],
    ['ENVIRONMENTAL', '29°C', '8.1 pH', 'Avg Temp & pH Level', 75, true],
    ['ALERTS / NOTIFS', '5', '-12', 'Critical events in 24h', 15, false]
  ];
  for (const kpi of kpis) {
    await connection.execute('INSERT INTO kpi_data (title, value, yoy, yoySub, progress, positive) VALUES (?, ?, ?, ?, ?, ?)', kpi);
  }

  // Profit Loss
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS profit_loss (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(20),
      income INT,
      expense INT
    )
  `);
  
  await connection.execute('TRUNCATE TABLE profit_loss');
  const pls = [
    ['Jan', 10000, 5000],
    ['Feb', 15000, 7000],
    ['Mar', 12000, 8000],
    ['Apr', 20000, 10000],
    ['May', 25000, 12000],
    ['Jun', 30000, 15000]
  ];
  for (const pl of pls) {
    await connection.execute('INSERT INTO profit_loss (name, income, expense) VALUES (?, ?, ?)', pl);
  }

  // Product Sale (Bubbles)
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS product_sale (
      id INT AUTO_INCREMENT PRIMARY KEY,
      val VARCHAR(20)
    )
  `);
  
  await connection.execute('TRUNCATE TABLE product_sale');
  const products = [['45%'], ['82%'], ['31%']];
  for (const p of products) {
    await connection.execute('INSERT INTO product_sale (val) VALUES (?)', p);
  }

  // Sales vs Target
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS sales_vs_target (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(20),
      sales INT,
      target INT
    )
  `);
  
  await connection.execute('TRUNCATE TABLE sales_vs_target');
  const sales = [
    ['1', 12000, 15000],
    ['2', 15000, 15000],
    ['3', 11000, 15000],
    ['4', 18000, 15000],
    ['5', 22000, 15000],
    ['6', 24000, 15000]
  ];
  for (const s of sales) {
    await connection.execute('INSERT INTO sales_vs_target (name, sales, target) VALUES (?, ?, ?)', s);
  }

  console.log('Seeded completely!');
  await connection.end();
}

seed().catch(console.error);
