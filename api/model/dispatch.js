import mongoose from 'mongoose';

const dispatchSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  productionLocation: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  productionName: {
    type: String,
    required: true,
  },
  withholding: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  orderedAmount: {
    type: Number,
    required: true,
  },
  carPlateNumber: {
    type: String,
    required: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  dispatchAmount: {
    type: Number,
    required: true,
  },
  dispatchStatus: {
    type: String,
    required: true,
  },
  dispachstatus:
   {
    type: String,
    enum: ["dispatched", "partially dispatched"],
  },
}, { timestamps: true });

const Dispatch = mongoose.model('Dispatch', dispatchSchema);
export default Dispatch; 