import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
