const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* ==================================================
   TEST GEMINI
================================================== */

// const testGemini = async () => {
//   const response = await ai.models.generateContent({
//     model: "gemini-3.6-flash",
//     contents:
//       "Say hello to my workout app in one short sentence.",
//   });

//   return response.text;
// };

/* ==================================================
   GENERATE WORKOUT INSIGHTS
================================================== */

const generateWorkoutInsights = async (stats) => {
  const prompt = `
You are an AI fitness analytics assistant.

Analyze the user's workout statistics provided below.

IMPORTANT RULES:

1. Only use information explicitly present in the statistics.
2. Do not invent workouts, weights, reps, dates, or progress.
3. Do not make medical diagnoses.
4. Do not assume why the user trained more or less.
5. Do not describe something as an increase or decrease unless the data supports the comparison.
6. Be practical and concise.
7. Do not repeat raw statistics unnecessarily.
8. If the data is insufficient to make a conclusion, do not make that conclusion.

Analyze:

- Training consistency
- Muscle group balance
- Exercise performance
- Strength indicators
- Areas that may need more attention
- Useful recommendations

Workout statistics:

${JSON.stringify(stats, null, 2)}

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT wrap the JSON in \`\`\`.
Do NOT add any text before or after the JSON.

Use exactly this structure:

{
  "summary": "Short overall assessment",
  "highlights": [
    {
      "title": "Short title",
      "description": "Useful observation supported by the data"
    }
  ],
  "areasToImprove": [
    {
      "title": "Short title",
      "description": "Useful observation supported by the data"
    }
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const text = response.text.trim();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "Failed to parse Gemini JSON:",
      text
    );

    // Fallback if Gemini still returns ```json
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleaned);
  }
};

module.exports = {
  
  generateWorkoutInsights,
};