const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

async function analyzeInvoice(fileBuffer, mimeType) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
    Analyze this invoice image. Act as 5 specialized agents:
    1. EXTRACTOR: Extract vendor, date (YYYY-MM-DD), total amount, and currency.
    2. CLASSIFIER: Categorize as 'Goods', 'Services', 'Medical', 'Software', or 'Other'.
    3. FRAUD AGENT: Estimate fraud risk (0-100). Check for round numbers, future dates, or odd formatting.
    4. COMPLIANCE AGENT: Check if it looks like a valid tax invoice. Status: 'passed' or 'flagged'.
    5. REPORTER: Write a 1-sentence summary.

    Return JSON strictly matching this schema:
    {
      "extractedData": { "vendor": "string", "amount": 0, "date": "string", "currency": "string" },
      "analysis": {
        "category": "string",
        "fraud": { "score": 0, "reason": "string" },
        "compliance": { "status": "string", "note": "string" },
        "summary": "string"
      }
    }
  `;

  const imagePart = {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType: mimeType,
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw new Error("Failed to process invoice with AI");
  }
}

async function chatWithInvoices(userMessage, contextData) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  });

  const prompt = `
    You are a helpful AI finance assistant for an Invoice Processing App.
    
    USER DATA (Invoices):
    ${contextData}

    USER QUESTION: "${userMessage}"

    INSTRUCTIONS:
    - Answer briefly based on the data above.
    - If the user asks about fraud prevention, give general advice based on the high-risk invoices shown.
    - If you cannot answer, say "I don't have enough data."
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Chat Failed:", error);
    return "I am currently overloaded. Please try again later.";
  }
}

module.exports = { analyzeInvoice, chatWithInvoices };