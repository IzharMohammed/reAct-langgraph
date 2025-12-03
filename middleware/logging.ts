import { createMiddleware } from "langchain";

export const loggingMiddleware = createMiddleware({
    name: "LoggingMiddleware",
    wrapToolCall: async (request, handler) => {
        const startTime = Date.now();
        console.log(`🔧 Tool: ${request.toolCall.name}`);
        console.log(`📥 Input:`, request.toolCall.args);

        const result = await handler(request);

        const duration = Date.now() - startTime;
        console.log(`✅ Completed in ${duration}ms`);
        console.log(`📤 Output:`, result);

        return result;
    }
});

