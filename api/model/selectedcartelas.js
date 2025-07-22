import mongoose from "mongoose";

const selectedCartelaSchema = new mongoose.Schema({
  createdBy: {
    type: String,
    required: true,
  },
  cartelas: [
    {
      cartelaNumber: {
        type: Number,
        required: true,
      },
      grid: {
        type: [[mongoose.Schema.Types.Mixed]], // 2D array, can be numbers or 'FREE'
        required: false,
      }
    }
  ]
}, { timestamps: true });

const SelectedCartela = mongoose.model("SelectedCartela", selectedCartelaSchema);
export default SelectedCartela;
