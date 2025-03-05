
import { toast } from 'sonner';

const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Analyzes an image using GROQ's LLaMA vision model
 * @param imageBase64 The base64 encoded image
 * @returns Analysis results including cleaning tasks and priorities
 */
export async function analyzeImageWithGroq(imageBase64: string): Promise<{
  tasks: Array<{ title: string; priority: number; description?: string }>;
  summary: string;
} | null> {
  try {
    // Format for GROQ API
    const payload = {
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image of a room that needs cleaning. Identify up to 5 specific cleaning tasks that need to be done, list them in priority order (1 being highest priority), and provide a brief description for each. Format your response as a JSON object with 'tasks' array (each with 'title', 'priority', and 'description') and a brief 'summary' of the overall state of the room."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1024,
      temperature: 0.5,
      response_format: { type: "json_object" }
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
    
    // Parse the response content
    const content = data.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    
    return parsedContent;
  } catch (error) {
    console.error("Error analyzing image with GROQ:", error);
    toast.error("Failed to analyze image. Please try again.");
    return null;
  }
}
