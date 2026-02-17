import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId, model, modelId, role, content, tokensUsed } = await req.json();

    if (!userId || !model || !role || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        userId,
        model,
        modelId: modelId || model,
        role,
        content,
        tokensUsed: tokensUsed || null,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Chat save error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save message" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const model = searchParams.get("model");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const where = { userId };
    if (model) {
      where.model = model;
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: limit,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Chat fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
