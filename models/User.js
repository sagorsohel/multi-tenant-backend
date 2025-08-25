import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["superadmin", "tenant"], default: "tenant" },
  tenants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tenant" }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
