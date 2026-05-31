import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: '',
      database: 'coral_dashboard',
    });
    
    const [kpiRows] = await connection.execute('SELECT * FROM kpi_data ORDER BY id ASC');
    const [profitLossRows] = await connection.execute('SELECT * FROM profit_loss ORDER BY id ASC');
    const [productSaleRows] = await connection.execute('SELECT * FROM product_sale ORDER BY id ASC');
    const [mapRows] = await connection.execute('SELECT * FROM reef_locations ORDER BY id ASC');
    
    await connection.end();
    
    return NextResponse.json({
      kpi: kpiRows,
      profitLoss: profitLossRows,
      productSale: productSaleRows,
      mapData: mapRows
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
