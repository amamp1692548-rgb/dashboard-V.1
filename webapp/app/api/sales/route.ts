import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // เปลี่ยนมาดึงข้อมูลผ่านหลังบ้านบน Render (เปลี่ยนเส้นทางท้ายลิงก์เป็น /sales)
    const response = await fetch('https://my-dashboard-backend-se3n.onrender.com/sales', {
      cache: 'no-store' // บังคับให้ดึงข้อมูลใหม่ล่าสุดเสมอ
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // ส่งข้อมูลยอดขายกลับไปให้หน้าแดชบอร์ด
    return NextResponse.json(data);

  } catch (error) {
    console.error("Database/Backend error in sales route:", error);
    return NextResponse.json({ error: 'Failed to fetch sales data จาก Render' }, { status: 500 });
  }
}