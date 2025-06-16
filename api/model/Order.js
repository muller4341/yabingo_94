import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  salesLocation: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  withHolding: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected', 'paid', 'completed', 'cancelled'],
    default: 'pending',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  createdBy: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  withShipping: {
    type: Boolean,
    default: false,
  },
  destination: {
    type: String,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  reviewedBy: {
    type: String,
    default: null,
  },
  approvedBy: {
    type: String,
    default: null,
  },
  lastModifiedBy: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
