import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { model, msg, parentModel } = await req.json();

  try {
    /* Send POST request using Axios */
    const response = await axios.post(
      "https://kravixstudio.com/api/v1/chat",
      {
        message: msg, // Messages to AI
        aiModel: model, // Selected AI model
        outputType: "text" // 'text' or 'json'
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.KRAVIXSTUDIO_API_KEY
        }
      }
    );

    console.log(response.data);

    return NextResponse.json({
      ...response.data,
      model: parentModel
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.response?.data || "Request Failed" },
      { status: error.response?.status || 500 }
    );
  }
}
