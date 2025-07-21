import { OpenAI } from "openai";
import { responseFormat } from "./response_format.js"

const client = new OpenAI({
  apiKey: Bun.env.OPENAI_API_KEY
});
const model = Bun.env.OPENAI_MODEL || "gpt-4.1-nano";

const chatHistory = [];

async function sendChatMessage(message) {
  chatHistory.push({ role: "user", content: message });
  const response = await client.chat.completions.create({
    stream: true,
    model: model,
    messages: [
      {
        role: "system",
        content: `
          You are a helpful assistant.
          Only reply if the user's question is about animals or animal behavior, classification, habitats, or characteristics.
          If the question is unrelated to animals, reply with "I don't understand. {sentiment: unknown}".
          Always end your valid reply with {sentiment: positive|neutral|negative|unknown}.
          `,
      },
      ...chatHistory,
    ],
    // response_format: responseFormat,
  });

  let resp = "";
  let sentiment = "";
  let buffer = "";
  let printMessage = true

  for await (const chunk of response) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      resp += content;
      buffer += content;

      const match = buffer.match(/\{sentiment:\s*(positive|neutral|negative|unknown)\}/i);
      if (match) {
        sentiment = match[1].toLowerCase();
        resp = resp.replace(match[0], "").trim();
        buffer = "";
      }

      if (printMessage) {
        printMessage = !content.includes("{");
      }

      if (printMessage) {
        console.log('message: ', content);
      }
    }
  }

  if (sentiment !== "unknown") {
    chatHistory.push({ role: "assistant", content: resp });
  } else {
    chatHistory.pop();
  }

  console.log("Final Response:", resp);
  console.log("Sentiment:", sentiment);
}

// sendChatMessage("What is the capital of France?");
await sendChatMessage("What is elephant?");
await sendChatMessage("Are they can have money?");
await sendChatMessage("What is the capital of France?");
await sendChatMessage("Are they eat meat?");

