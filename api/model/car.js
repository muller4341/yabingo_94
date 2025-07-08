import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
  },
  
  plateNumber: {
    type: String,
    required: true,
    unique: true,
  },
  year: {
    type: String,
    required: true,
  },
 
  color: {
    type: String,
     required: true,
  },
 
  onwork: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
  capacity: {
    type: Number,
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
}, { timestamps: true });

const Car = mongoose.model("Car", carSchema);
export default Car;
