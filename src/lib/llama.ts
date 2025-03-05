
import { toast } from 'sonner';

const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Sends a follow-up question to the llama-3-70b model
 * @param messages Array of chat messages
 * @returns The AI response text
 */
export async function askFollowUpQuestion(messages: ChatMessage[]): Promise<string | null> {
  try {
    const payload = {
      model: "llama-3-70b-8192", // Using llama-3-70b model as requested
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.9
    };

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GROQ API error: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    return aiResponse;
  } catch (error) {
    console.error("Error asking follow-up question:", error);
    toast.error("Failed to get AI response. Please try again.");
    return null;
  }
}
