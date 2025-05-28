// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema({
//   salesLocation: {
//     type: String,
//     required: true,
//     enum: ["mugher", "adama", "tatek"], 
//   },
//   productName: {
//     type: String,
//     required: true,
//     enum: ["PPC PACKED", "OPC BULK", "OPC PACKED", "PPC BULK"],
//   },
//   productType: {
//     type: String,
//     required: true,
//     enum: ["cement"], 
//   },
//   withHolding: {
//     type: String,
//     enum: ["yes", "no"],
//     required: true,
//   },
//   unit: {
//     type: String,
//     required: true,
//     enum: ["quintal"], // “quntale” corrected to “quintal”
//   },
//   status:{
//     type: String,
//     enum: ["active", "inactive"],
//     default: "active",

//   },

//   quantity: {
//     type: Number,
//     required: true,
//     min: 0,
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user", // assuming Distributor (product manager) creates it
//   }
// }, { timestamps: true });

// const Product = mongoose.model("Product", productSchema);
// export default Product;
// models/productModel.js
import mongoose from "mongoose";

export const salesLocationEnum = ["mugher", "adama", "tatek"];
export const productNameEnum = ["PPC PACKED", "OPC BULK", "OPC PACKED", "PPC BULK"];
export const productTypeEnum = ["cement"];
export const withHoldingEnum = ["yes", "no"];
export const unitEnum = ["quintal"];
export const statusEnum = ["active", "inactive"];

const productSchema = new mongoose.Schema({
  salesLocation: {
    type: String,
    required: true,
    enum: salesLocationEnum,
  },
  productName: {
    type: String,
    required: true,
    enum: productNameEnum,
  },
  productType: {
    type: String,
    required: true,
    enum: productTypeEnum,
  },
  withHolding: {
    type: String,
    enum: withHoldingEnum,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    enum: unitEnum,
  },
  status: {
    type: String,
    enum: statusEnum,
    default: "active",
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  transactionType: { // NEW FIELD
    type: String,
    enum: ["in", "out"],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
