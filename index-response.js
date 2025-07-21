import { OpenAI } from "openai";
import { config } from "dotenv";
import { responseFormat } from "./response_format.js"
config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const model = process.env.OPENAI_MODEL || "gpt-4.1-nano";

let responseId = null;

async function sendChatMessage(message) {
  const response = await client.responses.create({
    stream: true,
    model: model,
    previous_response_id: responseId,
    input: [
      {
        role: "system",
        content: `
          You are a helpful assistant.
          Only reply if the user's question is about animals or animal behavior, classification, habitats, or characteristics.
          If the question is unrelated to animals, reply with "I don't understand. {sentiment: unknown}".
          Always end your valid reply with {sentiment: positive|neutral|negative|unknown}.
          `,
      },
      { role: "user", content: message },
    ],
    // response_format: responseFormat,
  });

  let printDelta = true;
  let sentiment = null;
  let usage = null;
  for await (const event of response) {
    // console.log(JSON.stringify(event, null, 2));
    if (event.type === 'response.output_text.delta' && printDelta) {
      printDelta = !event.delta.includes('{');
      if (printDelta) {
        process.stdout.write(event.delta);
      }
    } else if (event.type === 'response.output_text.done') {
      const match = event.text.match(/\{sentiment:\s*(positive|neutral|negative|unknown)\}/i);
      if (match) {
        sentiment = match[1].toLowerCase();
      }
    } else if (event.type === 'response.completed') {
      responseId = event.response.id;
      usage = event.response.usage;
    }
  }

  console.log('\n');
  console.log(sentiment);
  console.log(responseId);
  console.log(usage);
}

// sendChatMessage("What is the capital of France?");
await sendChatMessage("What is elephant?");
await sendChatMessage("Are they eat meat?");
await sendChatMessage("Are they can have money?");
// await sendChatMessage("What is the capital of France?");
// await sendChatMessage("Are they eat meat?");

