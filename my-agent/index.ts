import {generateText} from "ai";
import {google} from "@ai-sdk/google";

const result = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: "what is an AI agent?",
});

console.log(result.text);