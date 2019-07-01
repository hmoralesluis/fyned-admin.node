var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CartSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  total: { type: Number, default: 0},
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'Gig'},
    quantity: { type: Number, default: 1},
    price: { type: Number, default: 0},
    title: String, 
    picture: { type: String, default: ''},
  }]
});


module.exports = mongoose.model('Cart', CartSchema);
