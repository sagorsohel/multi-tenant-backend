import express from "express";
import Product from "../models/Product.js";
import { protectTenant } from "../middleware/auth.js";

const router = express.Router();

// Create Product
router.post("/", protectTenant, async (req, res) => {
  const { name, price, description } = req.body;
  const product = new Product({ name, price, description, tenant: req.user.tenant, createdBy: req.user.id });
  await product.save();
  res.json({ success: true, product });
});

// Get Products for tenant
router.get("/", protectTenant, async (req, res) => {
  const products = await Product.find({ tenant: req.user.tenant });
  res.json({ success: true, products });
});
// 🌍 Public route: get products by tenant
router.get("/public/:tenant", async (req, res) => {
  try {
    const { tenant } = req.params;
    const products = await Product.find({ tenant });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});



export default router;
