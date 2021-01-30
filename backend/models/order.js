const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  customerEmail: {type: String, required: true},
  customerId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  productsOrdered: {type: Array , required: true},
  orderDate: {type: Date},
  orderStatus: {type: String, required:true, default: "Ordered"}
});

module.exports = mongoose.model('Order',orderSchema);
