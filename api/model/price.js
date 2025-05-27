// models/priceModel.js
import mongoose from "mongoose";
import {
  salesLocationEnum,
  productNameEnum,
  productTypeEnum,
  withHoldingEnum,
  unitEnum,
  statusEnum,
} from "./product.js";

const priceSchema = new mongoose.Schema({
  salesLocation: {
    type: String,
    enum: salesLocationEnum,
    required: true,
  },
  productName: {
    type: String,
    enum: productNameEnum,
    required: true,
  },
  productType: {
    type: String,
    enum: productTypeEnum,
    required: true,
  },
  withHolding: {
    type: String,
    enum: withHoldingEnum,
    required: true,
  },
  unit: {
    type: String,
    enum: unitEnum,
    required: true,
  },
  status: {
    type: String,
    enum: statusEnum,
    default: "active",
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  }
}, { timestamps: true });

const Price = mongoose.model("Price", priceSchema);
export default Price;
