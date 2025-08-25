import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Tenant from "../models/Tenant.js";

const router = express.Router();

// ✅ Tenant Login (e.g., shop1.localhost:4000/login)
router.post("/login", async (req, res) => {
  const { email, password, subdomain } = req.body;

  const tenant = await Tenant.findOne({ email, subdomain });
  if (!tenant) return res.status(400).json({ success: false, message: "Tenant not found" });

  const isMatch = await bcrypt.compare(password, tenant.password);
  if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign({ tenantId: tenant._id, subdomain }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("tenantToken", token, { httpOnly: true });
  res.json({ success: true, message: "Tenant login successful" });
});

export default router;
