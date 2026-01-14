const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  date: { 
    type: String, 
    required: true, 
    unique: true 
  }, 
  count: { 
    type: Number, 
    default: 0 
  }
});

module.exports = mongoose.model('Usage', UsageSchema);