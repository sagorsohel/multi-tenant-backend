import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shopName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
});

export default mongoose.model("Tenant", tenantSchema);
