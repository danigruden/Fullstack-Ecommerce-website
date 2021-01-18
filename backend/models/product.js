const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  title: {type: String, required: true, default:'Untitled'},
  content: {type: String, required: true},
  imagePath: {type: String, required: true},
  currentProdPrice: {type: Number, required: true},
  beforeDiscountPrice: {type: Number},
  category: {type: String},
  stock: {type: Number, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}
});

module.exports = mongoose.model('Product',productSchema);
