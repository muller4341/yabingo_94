// import mongoose from "mongoose";

// const allPriceSchema = new mongoose.Schema({
//   createdBy: {
//       type: mongoose.Schema.Types.ObjectId, // Or String, depending on your user ID type
//       required: true,
//     },
//     gameSessionId: { // NEW FIELD
//       type: String,
//       required: true,
//       unique: true, // Ensure uniqueness for each game session
//     },
//     Total: {
//       type: String, // Or Number, if you store it as a number
//       required: true,
//     },
//     WinnerPrize: {
//       type: String, // Or Number
//       required: true,
//     },
//     HostingRent: {
//       type: String, // Or Number
//       required: true,
//     },
  

// }, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

// const AllPrice = mongoose.model("AllPrice", allPriceSchema);
// export default AllPrice;

import mongoose from "mongoose";

const allPriceSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // or String if that's your type
      required: true,
      index: true,
    },
    Total: { type: String, required: true },
    WinnerPrize: { type: String, required: true },
    HostingRent: { type: String, required: true },

    // Optional if the client sends it
    idempotencyKey: { type: String, required: false, index: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

// Unique only when idempotencyKey exists
allPriceSchema.index(
  { createdBy: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } },
);

// Speed up recent lookups
allPriceSchema.index({ createdBy: 1, createdAt: -1 });

const AllPrice = mongoose.models.AllPrice || mongoose.model("AllPrice", allPriceSchema);
export default AllPrice;