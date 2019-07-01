var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LovedRestaurantSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'Restaurant'},
    name: String,
    picture: { type: String, default: ''},
  }]
});


module.exports = mongoose.model('LovedRestaurant', LovedRestaurantSchema);
