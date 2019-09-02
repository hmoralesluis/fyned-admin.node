var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var CategorySchema = new Schema({

  code: {type: String, unique: true, lowercase: true},
  name: String,
  picture: String,
  
});


module.exports = mongoose.model('Category', CategorySchema)
