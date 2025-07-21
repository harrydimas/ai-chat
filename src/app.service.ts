import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { from, Observable } from "rxjs";
import { filter, map, switchMap } from "rxjs/operators";

@Injectable()
export class AppService {
  private client;
  private model;
  private responseId = null;

  constructor() {
    this.client = new OpenAI({
      apiKey: Bun.env.OPENAI_API_KEY,
    });
    this.model = Bun.env.OPENAI_MODEL || "gpt-4.1-nano";
  }

  async sendChatMessage(message: string): Promise<Observable<string>> {
    let printDelta = true;
    let sentiment: string | null = null;
    let usage: any = null;

    return from(
      this.client.responses.create({
        stream: true,
        model: this.model,
        previous_response_id: this.responseId,
        input: [
          {
            role: "system",
            content: `
          You are a helpful assistant.
          Only reply if the user's greeting or question is about animals or animal behavior, classification, habitats, or characteristics.
          If the question is unrelated to animals, reply with "I don't understand. {sentiment: unknown}".
          Always end your valid reply with {sentiment: positive|neutral|negative|unknown}.
        `,
          },
          { role: "user", content: message },
        ],
      }),
    ).pipe(
      switchMap((response: any) => from(response)),
      filter((event: any) => {
        return event?.type;
      }),
      map((event: any) => {
        if (event.type === "response.output_text.delta" && printDelta) {
          printDelta = !event.delta.includes("{");
          if (printDelta) return event.delta;
        } else if (event.type === "response.output_text.done") {
          const match = event.text.match(
            /\{sentiment:\s*(positive|neutral|negative|unknown)\}/i,
          );
          if (match) sentiment = match[1].toLowerCase();
          console.log("Sentiment:", sentiment);
        } else if (event.type === "response.completed") {
          this.responseId = event.response.id;
          usage = event.response.usage;
          console.log("Response ID:", this.responseId);
          console.log("Usage:", usage);
        }

        return null; // fallback
      }),
      filter((text: string | null) => text !== null), // remove nulls
    );
  }
}
