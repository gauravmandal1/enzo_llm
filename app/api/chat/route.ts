import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { DynamicTool, DynamicStructuredTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import axios from "axios";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";

export const runtime = "edge";

export async function POST(req: Request, res: Response) {
  const { messages } = await req.json();

  const model = new ChatOpenAI({ temperature: 0, streaming: true });

  const { stream, handlers } = LangChainStream();

  async function fetchData(phone: string) {
    const apiUrl =
      "https://db.https://db.ezobooks.in/kappa/reports/allItems.in/kappa/reports/allItems";

    // try {
    //   const response = await axios.post(apiUrl, {
    //     phone: phone,
    //   }, {
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });
    //   console.log(response)
    //   return response;
    // } catch (error) {
    //   console.log(error)
    //   throw new Error('Failed to fetch data from the API');
    // }
    try {
      const response = {
        items: [
          {
            itemName: "Samosa",
            sellPrice: 15,
            stock: -1,
          },
          {
            itemName: "Chicken Biryani (Dum) (Half)",
            sellPrice: 140,
            stock: 0,
          },
          {
            itemName: "Chicken Biryani (Dum) (Full)",
            sellPrice: 250,
            stock: 0,
          },
        ],
      };

      return response.items;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch data from the API");
    }
  }

  const pastMessages = [
    new SystemMessage(
      "You are a helpful assistant for Ezo application.Ezo is a billing app. It is available on play store.Ezo is made for all retail business. Ezo provides 2 types of printers for billing, 1 is battery printer and 2nd is non battery printer.Battery printer costs 2999. and non battery printer costs 2499. Ezo application comes with 1 year licence on first purchase of printer. For subsequent years charges are 599 per year.Ezo is suitable for restaurants, garmet shops, medicals, schools, hospitals, computer shops, internet cafes."
    ),
    new HumanMessage("hii i am gaurav"),
    new AIMessage("Hii gaurav nice to meet you enzo assistant here!"),
  ];

  const memory = new BufferMemory({
    chatHistory: new ChatMessageHistory(pastMessages),
  });
  const customerData = new DynamicTool({
    name: "customerData",
    description: "Show user data",
    func: async () => {
      const phone = "7588763862";
      const data = await fetchData(phone);
      return `use this ${data}} extract itemName and show user list of this data`;
    },
  });
  const enzo = new DynamicTool({
    name: "enzo",
    description: "return who i am",
    func: async () => {
      console.log("Triggered foo function");
      return "Hii enzo Ezo is a billing app";
    },
  });
  const tools = [enzo, customerData];
  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "chat-conversational-react-description",
  });
  console.log("here after executer");
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

// Ezo is a billing app. It is available on play store.
//          Ezo is made for all retail business.
//          Ezo provides 2 types of printers for billing, 1 is battery printer and 2nd is non battery printer.
//          Battery printer costs 2999. and non battery printer costs 2499.
//          Ezo application comes with 1 year licence on first purchase of printer.
//          For subsequent years charges are 599 per year.
//          Ezo is suitable for restaurants, garmet shops, medicals, schools, hospitals, computer shops, internet cafes
