const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfigurationSchema = new Schema({  
  distance: Number,
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);