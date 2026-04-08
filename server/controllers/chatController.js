import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import ChatHistory from "../models/ChatHistory.js";

const SYSTEM_PROMPT =
  "You are a healthcare assistant. Do not give final diagnosis.";

const buildGeminiMessages = (messages) =>
  messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

export const chat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "A user message is required.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "GEMINI_API_KEY is not configured on the server.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const activeConversationId = conversationId || crypto.randomUUID();
    let chatHistory = await ChatHistory.findOne({
      conversationId: activeConversationId,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        conversationId: activeConversationId,
        messages: [],
      });
    }

    chatHistory.messages.push({
      role: "user",
      content: message.trim(),
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildGeminiMessages(chatHistory.messages),
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const aiResponse = response.text?.trim();

    if (!aiResponse) {
      return res.status(502).json({
        message: "Gemini returned an empty response.",
      });
    }

    chatHistory.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    await chatHistory.save();

    return res.status(200).json({
      conversationId: chatHistory.conversationId,
      response: aiResponse,
      history: chatHistory.messages,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Chat request failed.",
      error: error.message,
    });
  }
};
