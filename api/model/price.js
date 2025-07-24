import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  createdBy: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    enum: ["20", "30", "40", "50", "100", "200"],
    default: "20",
  },

  rentpercent: {
    type: String,
    enum: ["18", "22", "", "27", ],
    default: "30",
  },
  

}, { timestamps: true });

const Price = mongoose.model("price", priceSchema);
export default Price;
