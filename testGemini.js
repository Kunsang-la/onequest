import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Read API key manually
const env = fs.readFileSync('.env.local', 'utf-8');
const apiKey = env.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY=')).split('=')[1].trim();

export async function run() {
  console.log("Starting test...");
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    console.log("Calling generateContent with an image...");
    
    // Create a tiny dummy base64 image (1x1 pixel black JPEG)
    const base64Data = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
    
    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ];

    const result = await model.generateContent(["Is this a completely black image? Answer YES or NO.", ...imageParts]);
    console.log("Response:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
