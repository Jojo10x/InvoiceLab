require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { requireAuth } = require('./middleware/auth');
const Invoice = require('./models/Invoice');
const { analyzeInvoice, chatWithInvoices } = require('./services/ai');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options(/.*/, cors());
app.use(express.json());

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => {
    console.error(' MongoDB Connection Error:', err);
    process.exit(1);
  });

app.post('/api/invoices', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const aiResult = await analyzeInvoice(req.file.buffer, req.file.mimetype);

    const newInvoice = new Invoice({
      userId: req.auth.userId,
      fileName: req.file.originalname,
      extractedData: aiResult.extractedData,
      analysis: aiResult.analysis
    });

    await newInvoice.save();
    res.json(newInvoice);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to process invoice" });
  }
});

app.get('/api/invoices', requireAuth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.auth.userId }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

app.post('/api/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;

    const invoices = await Invoice.find({ userId: req.auth.userId });
    
    const context = invoices.length > 0 
      ? invoices.map(inv => 
          `- ${inv.extractedData.date}: ${inv.extractedData.vendor} (${inv.extractedData.currency} ${inv.extractedData.amount}) - Risk: ${inv.analysis.fraud.score}%`
        ).join('\n')
      : "No invoices uploaded yet.";

    const reply = await chatWithInvoices(message, context);
    res.json({ reply });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Chat service unavailable" });
  }
});

app.get('/api/export', requireAuth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.auth.userId }).sort({ createdAt: -1 });

    const fields = ['Date', 'Vendor', 'Amount', 'Currency', 'Category', 'Risk Score', 'Compliance Status'];
    const csvRows = invoices.map(inv => ([
      inv.extractedData.date || 'N/A',
      `"${inv.extractedData.vendor || 'Unknown'}"`,
      inv.extractedData.amount || 0,
      inv.extractedData.currency || 'USD',
      inv.analysis.category || 'Uncategorized',
      inv.analysis.fraud.score,
      inv.analysis.compliance.status
    ].join(',')));

    const csvString = [fields.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices_export.csv"');
    res.send(csvString);
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});