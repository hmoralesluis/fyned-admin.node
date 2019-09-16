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
  }],
  created: { type: Date, default: Date.now },
  progreso: {type: Number, default: 0},
  estado: {type: String, default: 'Creada'},
  atendida: {type: Boolean, default: false},
  repartidor: { type: Schema.Types.ObjectId, ref: 'User'},
});


module.exports = mongoose.model('OrderCart', OrderCartSchema);
