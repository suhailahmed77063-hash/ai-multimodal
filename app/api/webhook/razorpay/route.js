import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const { entity, event: eventType } = event;

    // Handle payment captured event
    if (eventType === "payment.captured") {
      const payment = entity;
      const { notes, order_id, id: payment_id } = payment;

      if (notes?.userEmail) {
        const user = await prisma.user.findUnique({
          where: { email: notes.userEmail },
        });

        if (user) {
          const currentCredits = user.credits || 0;
          const planCredits = getPlanCredits(notes.planName);

          await prisma.user.update({
            where: { email: notes.userEmail },
            data: {
              credits: currentCredits + planCredits,
              plan: notes.planName || "Pro",
              paymentId: payment_id,
              orderId: order_id,
            },
          });

          // Create payment record
          await prisma.payment.create({
            data: {
              userId: user.id,
              razorpayOrderId: order_id,
              razorpayPaymentId: payment_id,
              amount: payment.amount / 100,
              planName: notes.planName || "Pro",
              status: "completed",
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

function getPlanCredits(planName) {
  const credits = {
    Free: 100,
    Pro: 1000,
    Enterprise: 5000,
  };
  return credits[planName] || 100;
}
