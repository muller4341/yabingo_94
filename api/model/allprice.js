import mongoose from "mongoose";

const allPriceSchema = new mongoose.Schema({
  createdBy: {
    type: String,
    required: true,
  },
  Total: {
    type: String,
     required: true,
  },
   WinnerPrize: {
    type: String,
     required: true,
  },

   HostingRent: {
    type: String,
     required: true,
  },
  service: {
    type: String,
     required: true,
  },
  
  

}, { timestamps: true });

const AllPrice = mongoose.model("AllPrice", allPriceSchema);
export default AllPrice;
