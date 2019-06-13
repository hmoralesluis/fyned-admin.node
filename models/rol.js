var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var RolSchema = new Schema({

  code: {type: String, unique: true, lowercase: true},
  name: String,

});


module.exports = mongoose.model('Rol', RolSchema)
