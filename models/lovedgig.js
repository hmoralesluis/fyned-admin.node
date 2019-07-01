var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LovedGigSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  total: { type: Number, default: 0},
  items: [{
    item: { type: Schema.Types.ObjectId, ref: 'Gig'},
    title: String,
    picture: { type: String, default: ''},
  }]
});


module.exports = mongoose.model('LovedGig', LovedGigSchema);
