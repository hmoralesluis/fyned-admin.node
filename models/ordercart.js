var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderCartSchema = new Schema({
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


module.exports = mongoose.model('OrderCart', OrderCartSchema);
