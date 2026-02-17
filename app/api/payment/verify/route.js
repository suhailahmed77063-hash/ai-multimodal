import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userEmail,
      planName,
      credits,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 }
      );
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update user credits in database
    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (user) {
        const currentCredits = user.credits || 0;
        const currentMessages = user.remainingMsg || 0;

        await prisma.user.update({
          where: { email: userEmail },
          data: {
            credits: currentCredits + (credits || 0),
            remainingMsg: currentMessages + Math.floor((credits || 0) / 10),
            plan: planName || "Pro",
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
          },
        });

        // Create payment record
        await prisma.payment.create({
          data: {
            userId: user.id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: credits ? credits / 10 : 0,
            planName: planName || "Pro",
            status: "completed",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and credits added successfully",
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
