import mongoose from "mongoose";

const idempoSchema = new mongoose.Schema(
  {
    // Uniquely identifies the logical operation we want to dedupe
    key: { type: String, required: true, unique: true }, // e.g., "allprice:{createdBy}:{hash}"
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }, // or String
    expireAt: { type: Date, required: true, index: true }, // TTL index
  },
  { timestamps: true },
);

// TTL index: expireAt determines when record is removed
// NOTE: expireAfterSeconds must be 0 for date-based TTL field
idempoSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const IdempotencyRecord =
  mongoose.models.IdempotencyRecord || mongoose.model("IdempotencyRecord", idempoSchema);

export default IdempotencyRecord;