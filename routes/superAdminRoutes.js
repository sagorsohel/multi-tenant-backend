import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { protectSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Register Super Admin (only once)
router.post("/register-superadmin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      return res.status(400).json({ message: "Super admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, role: "superadmin" });
    await user.save();

    res.json({
      success: true,
      message: "Super admin registered",
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Super Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "superadmin" });
    if (!admin) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "superadmin" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Super Admin creates Tenant
router.post("/tenants", protectSuperAdmin, async (req, res) => {
  try {
    const { name, shopName, email, password, subdomain } = req.body;

    // check if email or subdomain already exists
    const existingUser = await User.findOne({ email });
    const existingTenant = await Tenant.findOne({ subdomain });

    if (existingUser || existingTenant) {
      return res.status(400).json({
        success: false,
        message: "Email or subdomain already exists",
      });
    }

    // create tenant user
    const hashedPassword = await bcrypt.hash(password, 10);
    const tenantUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "tenant",
    });
    await tenantUser.save();

    // create tenant record
    const tenant = new Tenant({
      name,
      shopName,
      subdomain,
      createdBy: req.user.id, // superadmin id
    });
    await tenant.save();

    // link tenant to tenantUser
    tenantUser.tenants.push(tenant._id);
    await tenantUser.save();

    res.json({ success: true, message: "Tenant created", tenant });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
