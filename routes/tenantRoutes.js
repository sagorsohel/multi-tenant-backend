import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { protectTenant } from "../middleware/auth.js";

const router = express.Router();

// Tenant Login
router.post("/login", async (req, res) => {
  const { email, password, subdomain } = req.body;

  const user = await User.findOne({ email, role: "tenant" }).populate("tenants");
  if (!user) return res.status(400).json({ success: false, message: "Tenant not found" });

  const tenantMatch = user.tenants.find(t => t.subdomain === subdomain);
  if (!tenantMatch) return res.status(400).json({ success: false, message: "Invalid subdomain" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, tenantId: tenantMatch._id, subdomain }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("tenantToken", token, { httpOnly: true });
  res.json({ success: true, message: "Tenant login successful", token, tenant: tenantMatch });
});

export default router;
