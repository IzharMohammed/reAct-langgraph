import { ChatGroq } from "@langchain/groq";
import { createAgent, createMiddleware, tool, ToolMessage } from "langchain";
import z from "zod";
import readline from "node:readline/promises";
import dotenv from 'dotenv'

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const add = tool(({ a, b }) => {
    console.log("Adding", a, b);
    return a + b;
}, {
    name: "add",
    description: "Add two numbers",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    }),
});

const multiply = tool(({ a, b }) => {
    console.log("Multiplying", a, b);
    return a * b;
}, {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    }),
});

const divide = tool(({ a, b }) => {
    console.log("Dividing", a, b);
    if (b === 0) {
        throw new Error("Division by zero is not allowed!");
    }
    return a / b;
}, {
    name: "divide",
    description: "Divide two numbers",
    schema: z.object({
        a: z.number().describe("First number (dividend)"),
        b: z.number().describe("Second number (divisor) - cannot be zero"),
    }),
});

const testError = tool(({ errorType }) => {
    console.log("Testing error type:", errorType);

    switch (errorType) {
        case "generic":
            throw new Error("This is a generic error for testing!");
        case "validation":
            throw new Error("Validation failed: Input is invalid!");
        case "timeout":
            throw new Error("Operation timed out!");
        case "network":
            throw new Error("Network error: Could not connect to service!");
        default:
            throw new Error("Unknown error type!");
    }
}, {
    name: "testError",
    description: "A test tool that throws different types of errors. Use this to test error handling.",
    schema: z.object({
        errorType: z.enum(["generic", "validation", "timeout", "network"])
            .describe("Type of error to throw: generic, validation, timeout, or network"),
    }),
});

const model = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    temperature: 0,
    apiKey: process.env.GROQ_API_KEY,
});

const handleToolErrors = createMiddleware({
    name: "HandleToolErrors",
    wrapToolCall: async (request, handler) => {
        try {
            console.log("Tool call:", request.toolCall);

            return await handler(request);
        } catch (error) {
            console.log("Tool error:", error);
            // Return a custom error message to the model
            return new ToolMessage({
                content: `Tool error: Please check your input and try again. (${error})`,
                tool_call_id: request.toolCall.id!,
            });
        }
    },
});

const agent = createAgent({
    model,
    tools: [add, multiply, divide, testError],
    middleware: [handleToolErrors],
});



async function main() {
    while (true) {
        const input = await rl.question("User: ");

        if (input === "exit") break;

        const result = await agent.invoke({
            messages: [
                {
                    role: "user",
                    content: input,
                },
            ],
        });

        console.log("Agent: ", result.messages[result.messages.length - 1].content);
    }

    rl.close();
}

main();