import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Owner/Customer name
  shopName: { type: String, required: true }, // Business/shop name
  subdomain: { type: String, required: true, unique: true }, // ex: sohel.localhost.com
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Superadmin ID
}, { timestamps: true });

export default mongoose.model("Tenant", tenantSchema);
