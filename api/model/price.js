// models/priceModel.js
import mongoose from "mongoose";
const priceSchema = new mongoose.Schema({
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

  price: {
    type: Number,
    required: true,
    min: 0,
  },
   isArchived: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  }
}, { timestamps: true });

const Price = mongoose.model("Price", priceSchema);
export default Price;
