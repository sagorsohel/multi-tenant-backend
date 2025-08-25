import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";


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


// Public - get tenant by subdomain
router.get("/:subdomain", async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ subdomain: req.params.subdomain });
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }
    res.json({ success: true, tenant });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
export default router;
