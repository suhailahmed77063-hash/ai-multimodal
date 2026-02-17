import axios from "axios";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { aj, freeUserLimiter } from "@/config/Arcjet";

export async function POST(req) {
  try {
    const { model, msg, parentModel, userEmail, userId } = await req.json();

    if (!model || !msg?.length) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Check user and apply rate limiting
    let user = null;
    if (userEmail) {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      
      if (user) {
        // Check credits
        const credits = user.credits || 0;
        if (credits <= 0) {
          return NextResponse.json(
            { error: "Insufficient credits. Please upgrade your plan." },
            { status: 402 }
          );
        }

        // Apply stricter rate limiting for free users
        if (user.plan === "Free" || !user.plan) {
          const decision = await freeUserLimiter.protect(req, {
            userId: user.id,
          });
          
          if (decision.isDenied()) {
            return NextResponse.json(
              { 
                error: "Rate limit exceeded. Free users are limited to 3 requests per minute. Please upgrade for higher limits.",
                rateLimited: true 
              },
              { status: 429 }
            );
          }
        }
      }
    }

    console.log("➡ Sending To Kravix:", {
      message: msg[0]?.content,
      aiModel: model,
    });

    const response = await axios.post(
      "https://kravixstudio.com/api/v1/chat",
      {
        message: msg[0]?.content || "",
        aiModel: model,
        outputType: "text",
      },
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.KRAVIXSTUDIO_API_KEY}`,
        },
      }
    );

    console.log("✅ Kravix Success:", response.data);

    // Deduct credits and save message
    if (user) {
      const currentCredits = user.credits || 0;
      const creditsToDeduct = response.data?.creditsDeducted || 1;
      
      await prisma.user.update({
        where: { email: userEmail },
        data: {
          credits: Math.max(0, currentCredits - creditsToDeduct),
          remainingMsg: Math.max(0, (user.remainingMsg || 0) - 1),
        },
      });

      // Save chat message
      if (userId || user.id) {
        await prisma.chatMessage.create({
          data: {
            userId: userId || user.id,
            model: parentModel || model,
            modelId: model,
            role: "user",
            content: msg[0]?.content || "",
          },
        });
        
        await prisma.chatMessage.create({
          data: {
            userId: userId || user.id,
            model: parentModel || model,
            modelId: model,
            role: "assistant",
            content: response.data?.aiResponse || "",
            tokensUsed: response.data?.tokensUsed || null,
          },
        });
      }
    }

    return NextResponse.json({
      aiResponse: response.data?.aiResponse || "No response",
      tokensUsed: response.data?.tokensUsed || 0,
      creditsDeducted: response.data?.creditsDeducted || 0,
      remainingCredits: response.data?.remainingCredits || 0,
      model: parentModel,
    });

  } catch (error) {

    console.error("🔥 EXTERNAL API ERROR 🔥");
    console.error("Code:", error.code);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    // DNS / Server unreachable
    if (error.code === "ENOTFOUND") {
      return NextResponse.json(
        { error: "AI server unreachable. Try again." },
        { status: 503 }
      );
    }

    // Timeout
    if (error.code === "ECONNABORTED") {
      return NextResponse.json(
        { error: "Request timeout. Try again." },
        { status: 504 }
      );
    }

    // External 500 error
    if (error.response?.status === 500) {
      return NextResponse.json(
        { error: "AI provider internal error." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: error.response?.data?.error || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
