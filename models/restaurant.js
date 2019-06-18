
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var RestaurantSchema = new Schema({

   name: {type: String, unique: true },
   picture: {type: String, default: 'admin.jpg' },
   direction: String,
   enabled: {type: Boolean, default: true},

});


module.exports = mongoose.model('Restaurant', RestaurantSchema);
