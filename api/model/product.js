import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  salesLocation: {
    type: String,
    required: true,
    enum: ["mugher", "adama", "tatek"], 
  },
  productName: {
    type: String,
    required: true,
    enum: ["PPC PACKED", "OPC BULK", "OPC PACKED", "PPC BULK"],
  },
  productType: {
    type: String,
    required: true,
    enum: ["cement"], 
  },
  withHolding: {
    type: String,
    enum: ["yes", "no"],
    required: true,
  },
  unit: {
    type: String,
    required: true,
    enum: ["quintal"], // “quntale” corrected to “quintal”
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // assuming Distributor (product manager) creates it
  }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
