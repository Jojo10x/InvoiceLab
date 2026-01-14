const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  extractedData: {
    vendor: String,
    amount: Number,
    date: String,
    currency: String,
  },
  analysis: {
    category: String,
    fraud: {
      score: Number,
      reason: String,
    },
    compliance: {
      status: String,
      note: String,
    },
    summary: String,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);