import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdmin.js";
import Tenant from "../models/Tenant.js";
import { protectSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Super Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await SuperAdmin.findOne({ email });
  if (!admin) return res.status(400).json({ success: false, message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("token", token, { httpOnly: true });
  res.json({ success: true, message: "Login successful" });
});

// ✅ Add Tenant
router.post("/tenants", protectSuperAdmin, async (req, res) => {
  const { name, shopName, email, password, subdomain } = req.body;
  try {
    const existing = await Tenant.findOne({ $or: [{ email }, { subdomain }] });
    if (existing) return res.status(400).json({ success: false, message: "Email or subdomain already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const tenant = await Tenant.create({
      name,
      shopName,
      email,
      password: hashedPassword,
      subdomain,
    });

    res.json({ success: true, message: "Tenant created", tenant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
