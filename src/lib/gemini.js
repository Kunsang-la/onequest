import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with the key from the environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const generatePhotoPrompt = async (questTitle, questDescription) => {
  if (!apiKey) return "Photo Requirement: Show proof of your adventure.";

  const prompt = `You are a game master giving a player a photo requirement for a real-world quest.
Quest: ${questTitle}
Description: ${questDescription || "No description provided."}

Give a very short 1-sentence instruction (max 10 words) telling the player what specific physical object or scene to photograph.
CRITICAL RULE: Never say generic things like "Take a picture proving you did it". You MUST tell them exactly what to point the camera at!
Examples: 'Show a photo of your perfectly clean desk!', 'Snap a pic of the trash bags you filled!'
Do not include quotes around your answer.`;

  const modelsToTry = ["gemini-flash-latest"];
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Timeout")), 8000)
  );

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);
      return "Photo Requirement: " + result.response.text().trim();
    } catch (error) {
      console.warn(`Model ${modelName} failed for prompt generation:`, error.message);
    }
  }

  // If all fail
  return "Photo Requirement: Snap a pic showing your completed work!";
};

export const verifyQuestImage = async (base64Image, questTitle) => {
  if (!apiKey) {
    console.error("No VITE_GEMINI_API_KEY found.");
    return { verified: false, reason: "Missing VITE_GEMINI_API_KEY in .env file. Please add it and restart your dev server." };
  }

  // The base64 string from canvas usually includes a prefix like "data:image/jpeg;base64,"
  // We need to strip that prefix for the Gemini API
  const base64Data = base64Image.split(',')[1];

  const prompt = `You are a strict game master verifying a player's real-world action.
The quest is: "${questTitle}"

Does the attached photo prove that the player completed this quest?
Answer strictly with 'YES' or 'NO'.`;

  const imageParts = [
    {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    }
  ];

  const modelsToTry = ["gemini-flash-latest"];
  let lastError = null;

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("The AI verification took too long (Network Timeout). Please try again.")), 10000)
  );

  for (const modelName of modelsToTry) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await Promise.race([
        model.generateContent([prompt, ...imageParts]),
        timeoutPromise
      ]);
      
      const responseText = result.response.text().trim().toUpperCase();

      if (responseText === "YES" || responseText.startsWith("YES")) {
        return { verified: true };
      } else {
        return { verified: false, reason: "The AI Guildmaster rejected your photo for being unrelated to the quest. Please take a clearer picture!" };
      }
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      
      if (error.message.includes("took too long")) {
        return { verified: false, reason: error.message };
      }
      
      if (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("Service Unavailable")) {
        return { verified: false, reason: "The AI Guildmaster is currently overwhelmed by too many adventurers (503 High Demand). Please wait 10 seconds and try submitting again!" };
      }
    }
  }

  // If all models fail
  console.error("All AI models failed. Last error:", lastError);
  return { verified: false, reason: `AI API Error: ${lastError?.message || 'Unsupported model or region.'}` };
};
