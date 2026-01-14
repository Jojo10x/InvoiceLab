const { GoogleGenerativeAI } = require("@google/generative-ai");
const Usage = require('../models/Usage');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = {
  standard: "gemini-2.5-flash",
  lite: "gemini-2.5-flash-lite"
};

const DAILY_LIMIT = 20;

async function checkAndIncrementUsage() {
  const today = new Date().toISOString().split('T')[0];

  let usageLog = await Usage.findOne({ date: today });
  if (!usageLog) {
    usageLog = new Usage({ date: today, count: 0 });
  }

  usageLog.count += 1;
  await usageLog.save();
  return usageLog.count;
}

async function analyzeInvoice(fileBuffer, mimeType, modelChoice = 'standard') {
  await checkAndIncrementUsage();

  const selectedModelName = MODELS[modelChoice] || MODELS.standard;
  console.log(`AI Processing with: ${selectedModelName}`);

  const model = genAI.getGenerativeModel({
    model: selectedModelName,
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
    console.error("AI Analysis Failed:", error.message);

    if (error.message.includes("429") || error.message.includes("Quota") || error.message.includes("Resource exhausted")) {
      throw new Error("GOOGLE_QUOTA_EXCEEDED");
    }

    throw new Error("AI_PROCESSING_FAILED");
  }
}

async function chatWithInvoices(userMessage, contextData, modelChoice = 'standard') {
  await checkAndIncrementUsage();

  const selectedModelName = MODELS[modelChoice] || MODELS.standard;

  const model = genAI.getGenerativeModel({
    model: selectedModelName,
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  });

  const prompt = `
    You are a helpful AI finance assistant.
    USER DATA: ${contextData}
    USER QUESTION: "${userMessage}"
    Keep it brief.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Chat Failed:", error.message);
    if (error.message.includes("429") || error.message.includes("Resource exhausted")) {
      throw new Error("GOOGLE_QUOTA_EXCEEDED");
    }
    return "I am currently overloaded. Please try again later.";
  }
}

module.exports = { analyzeInvoice, chatWithInvoices };