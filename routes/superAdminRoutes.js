import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { protectSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Register SuperAdmin
router.post("/register-superadmin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ role: "superadmin" });
    if (existing) return res.status(400).json({ message: "Super admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, role: "superadmin" });
    await user.save();
    res.json({ success: true, message: "Super admin registered", email: user.email });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SuperAdmin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: "superadmin" });
    if (!admin) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "superadmin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Tenant
router.post("/tenants", protectSuperAdmin, async (req, res) => {
  try {
    const { name, shopName, email, password, subdomain } = req.body;

    const existingUser = await User.findOne({ email });
    const existingTenant = await Tenant.findOne({ subdomain });
    if (existingUser || existingTenant) return res.status(400).json({ success: false, message: "Email or subdomain already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const tenantUser = new User({ name, email, password: hashedPassword, role: "tenant" });
    await tenantUser.save();

    const tenant = new Tenant({ name, shopName, subdomain, createdBy: req.user._id,email });
    await tenant.save();

    tenantUser.tenants.push(tenant._id);
    await tenantUser.save();

    res.json({ success: true, message: "Tenant created", tenant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get All Tenants (SuperAdmin only)
router.get("/tenants", protectSuperAdmin, async (req, res) => {
    try {
      const tenants = await Tenant.find()
        .populate("createdBy", "email role") // optional: show who created
        .sort({ createdAt: -1 });
  
      res.json({
        success: true,
        message: "Tenants fetched successfully",
        tenants,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  
export default router;
