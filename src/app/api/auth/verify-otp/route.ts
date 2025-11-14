// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";

export async function POST(request: NextRequest) {
  try {
    const { otp: userOtp } = await request.json();

    if (!userOtp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const otp = cookies.otp;

    if (!otp) {
      return NextResponse.json({ error: "OTP expired or not found" }, { status: 400 });
    }

    if (otp !== userOtp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "OTP verification failed" }, { status: 500 });
  }
}
