import { StreamingTextResponse } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { DynamicTool, DynamicStructuredTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";


export const runtime = "edge";

export async function POST(req: Request, res: Response) {

  const { messages } = await req.json();
  const model = new ChatOpenAI({ temperature: 0, streaming: true });

  const userItem = new DynamicTool({
    name: "show him his items",
    description: "Show user his items",
    func: async () => {
      const apiUrl = "https://db.ezobooks.in/kappa/reports/allItems";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "7588763862",
        }),
      });
      const data = await response.json()
      return JSON.stringify(data);
      
    },
  });
  const enzo = new DynamicTool({
    name: "enzo",
    description: "return who i am",
    func: async () => {
      console.log("Triggered enzo function");
      return "Hii enzo Ezo is a billing app";
    },
  });
  const intrestedCustomer = new DynamicTool({
    name: "intrested Customer",
    description: "show intrested customer sales number",
    func: async () => {
      console.log("Triggered customerfunction function");
      return "Ask interested user to contact sales team on phone : 7588763862.";
    },
  });
  const tools = [enzo, intrestedCustomer, userItem];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "chat-conversational-react-description",
    agentArgs: {
      systemMessage:
        "You are a helpful assistant for Ezo application.Ezo is a billing app. It is available on play store.Ezo is made for all retail business. Ezo provides 2 types of printers for billing, 1 is battery printer and 2nd is non battery printer.Battery printer costs 2999. and non battery printer costs 2499. Ezo application comes with 1 year licence on first purchase of printer. For subsequent years charges are 599 per year.Ezo is suitable for restaurants, garmet shops, medicals, schools, hospitals, computer shops, internet cafes.",
    },
    verbose: false,
  });

  const input = messages[messages.length - 1].content;

  const result = await executor.run(input);

  const chunks = result.split(" ");

  const responseStream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        const bytes = new TextEncoder().encode(chunk + " ");
        controller.enqueue(bytes);
        await new Promise((r) =>
          setTimeout(r, Math.floor(Math.random() * 20 + 10))
        );
      }
      controller.close();
    },
  });
  return new StreamingTextResponse(responseStream);
}