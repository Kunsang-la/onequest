const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function generateQuestIdea() {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file and restart the server.");
  }

  const prompt = `You are a quest designer for a gamified productivity app. Your job is to invent fun, healthy, real-world tasks for people to complete (like doing 20 pushups, reading a book, going for a walk, cleaning, or talking to a stranger).
Keep the tone light, fun, and easy for anyone to understand, with just a tiny hint of adventure. Do NOT make it heavily fantasy-oriented or confusing. 

Return a strictly valid JSON array containing exactly 10 diverse quest objects. Mix up the rarities!

Example schema for each object in the array:
[
  {
    "title": "Catchy Task Title",
    "quest_giver": "A fun character or role (e.g., Coach Sarah, Local Barista, Park Ranger)",
    "description": "1-3 clear sentences describing the real-world task. MUST end with a newline and '📸 Photo Requirement: [What exactly they should take a picture of to prove it]'",
    "rarity": "Common", // Must be exactly one of: Common, Rare, Epic, Legendary
    "xp_reward": 50, // Integer between 10 and 500 based on rarity/difficulty
    "pace": "Quick Win" // Short string describing the vibe (e.g., "Quick Win", "Relaxed", "Deep Focus", "Active")
  }
]

Ensure the output is ONLY the raw JSON array, without any markdown formatting or backticks around it.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
            temperature: 0.9,
        }
      })
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Failed to fetch from Gemini');
    }

    const data = await response.json();
    let textResult = data.candidates[0].content.parts[0].text;
    
    // Clean up markdown block if present
    textResult = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();

    return JSON.parse(textResult);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
