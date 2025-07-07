import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
 
  licensenumber: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
     required: true,
  },
 
  profilePicture: {
    type: String,
   default: "/images/pp.png",
  },
  
  onwork: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
}, { timestamps: true });

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;
