
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var RestaurantSchema = new Schema({

   name: {type: String, unique: true },
   category: { type: Schema.Types.ObjectId, ref: 'Category'},
   picture1: {type: String, default: 'admin.jpg' },
   picture2: {type: String, default: 'admin.jpg' },
   picture3: {type: String, default: 'admin.jpg' },
   estado: String,
   direction: String,
   label: String,
   description: String,
   enabled: {type: Boolean, default: true},
   latitude: String,
   longitude: String,
});


module.exports = mongoose.model('Restaurant', RestaurantSchema);
