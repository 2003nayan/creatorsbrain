// mistral-saba-24b

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { currentUser } from "@clerk/nextjs/server";
import { getVideoDetails } from "@/actions/getVideoDetails";
// import fetchTranscript from "../../tools/fetchTranscript";
// import { generateImage } from "../../tools/generateImage";
// import { getVideoIdFromUrl } from "@/lib/getVideoIdFromUrl";
// import generateTitle from "../../tools/generateTitle";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  console.log("✅ Received POST request to /api/chat");

  const { messages, videoId } = await req.json(); // Extracts messages (chat history) and videoId (target video) from the request body.
  console.log("🎥 Video ID:", videoId);
  console.log("📝 Raw Messages:", messages);

  const user = await currentUser();
  if (!user) {
    console.error("⛔ No current user found.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } // Checks if a user is logged in. If not, it returns a 401 error response.

  const videoDetails = await getVideoDetails(videoId);
  console.log("✅ Video details fetched successfully:", videoDetails);

  const systemMessage = `You are an AI agent ready to accept questions from the user about ONE specific video. The video ID in question is ${videoId} but you'll refer to this as ${videoDetails?.title || "Selected Video"}. Use emojis to make the conversation more engaging. ...`;
  // Creates a system prompt that tells the AI to answer questions about the video. Uses the video title if available.

  const chatMessages = [
    { role: "system", content: systemMessage },
    ...messages.map((msg: any) => ({
      role: msg.role,
      content:
        msg.content ?? (Array.isArray(msg.parts) ? msg.parts.join(" ") : ""),
    })),
  ]; // Creates an array of messages to send to the AI. Starts with the system message. Then it maps the user’s messages, ensuring content is extracted correctly (either from msg.content or msg.parts).

  console.log("📦 Final Messages to Groq:", chatMessages);

  const response = await openai.chat.completions.create({
    model: "mistral-saba-24b",
    messages: chatMessages,
    stream: true,
  }); // Sends a streaming request to the Groq API using the mistral-saba-24b model. The stream: true option allows it to receive the AI’s response in chunks as it's generated.

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      console.log("🚀 Starting stream...");
      let buffer = "";

      for await (const chunk of response) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          buffer += content;

          // Send buffer when it reaches a reasonable size or contains complete sentences
          if (
            buffer.length >= 10 ||
            buffer.includes(".") ||
            buffer.includes("!") ||
            buffer.includes("?")
          ) {
            console.log("📤 Sending buffer:", buffer);
            controller.enqueue(encoder.encode(buffer));
            buffer = "";
          }
        }
      }

      // Send any remaining content in the buffer
      if (buffer.length > 0) {
        console.log("📤 Sending final buffer:", buffer);
        controller.enqueue(encoder.encode(buffer));
      }

      console.log("✅ Stream finished.");
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  }); // Sends the stream back to the browser or frontend client with the appropriate content type.
}
