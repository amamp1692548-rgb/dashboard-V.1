import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // แก้ไขตรงนี้: วิ่งไปดึงจากท่อ /dashboard แทน เพื่อไม่ให้เจอ 404
    const response = await fetch('https://my-dashboard-backend-se3n.onrender.com/dashboard', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // โค้ดเดิมฝั่งหน้าบ้านของคุณอาจจะต้องการแค่ส่วนของ productSale
    // ถ้าหน้าจอแสดงผลมีปัญหา ให้ลองใช้บรรทัดนี้: return NextResponse.json(data.productSale || data);
    return NextResponse.json(data);

  } catch (error) {
    console.error("Backend error in sales route:", error);
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}