import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ดึงข้อมูลผ่านหลังบ้านบน Render แทนการต่อ MySQL ตรงๆ ในเครื่อง
    const response = await fetch('https://my-dashboard-backend-se3n.onrender.com/dashboard', {
      cache: 'no-store' // บังคับให้ดึงข้อมูลใหม่เสมอ ไม่ใช้ข้อมูลเก่าที่ค้างไว้
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // ส่งข้อมูลกลับไปให้หน้าแดชบอร์ดตามโครงสร้างเดิม
    return NextResponse.json(data);

  } catch (error) {
    console.error("Database/Backend error:", error);
    return NextResponse.json({ error: 'Failed to fetch dataจาก Render' }, { status: 500 });
  }
}