import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { config } from "dotenv";
import Groq from "groq-sdk";
import path from "node:path";

config({ path: path.resolve("..", "..", ".env") });

const res = await generateText({
  model: groq("openai/gpt-oss-120b"),
  prompt: "What is the fastest way to india",
});

console.log(res, res.text, res.reasoning, res.reasoningText);
