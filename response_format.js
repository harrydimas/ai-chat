export const responseFormat = {
  type: "json_schema",
  json_schema: {
    name: "sentiment_analysis_response",
    schema: {
      type: "object",
      properties: {
        output_text: {
          type: "string",
          description: "Answer to the user's question",
        },
        sentiment: {
          type: "string",
          description: "The sentiment of the input message, e.g., positive, negative, neutral.",
        },
      },
    },
  }
}
export default responseFormat;