// routes/themeRoutes.js
import express from "express";
import Theme from "../models/Theme.js";
import Tenant from "../models/Tenant.js";
import { protectSuperAdmin, protectTenant } from "../middleware/auth.js";

const router = express.Router();


// 🌍 Public route: get active theme by tenant subdomain
router.get("/public/:subdomain", async (req, res) => {
    try {
      const { subdomain } = req.params;
  
      // Find tenant by subdomain
      const tenant = await Tenant.findOne({ subdomain }).populate("theme");
      if (!tenant) {
        return res.status(404).json({ success: false, message: "Tenant not found" });
      }
  
      // Send tenant's active theme
      res.json({
        success: true,
        theme: tenant.theme || null, // could be null if no theme selected
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  

// ✅ Get all available themes (tenant can view)
// routes/themeRoutes.js
router.get("/all", protectTenant, async (req, res) => {
    try {
      const themes = await Theme.find();
  
      // Get tenant's active theme
      const tenant = await Tenant.findById(req.user.tenant);
      const tenantThemeId = tenant?.theme?.toString();
  
      // Mark which theme is active for this tenant
      const tenantThemes = themes.map(theme => ({
        ...theme.toObject(),
        isActive: theme._id.toString() === tenantThemeId
      }));
  
      res.json({ success: true, themes: tenantThemes });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  

// ✅ Get current tenant theme
router.get("/", protectTenant, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId).populate("theme");
    res.json({ success: true, theme: tenant.theme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Select a theme for tenant
// routes/themeRoutes.js
router.post("/select", protectTenant, async (req, res) => {
    try {
      const { themeId } = req.body;
  
      const theme = await Theme.findById(themeId);
      if (!theme) return res.status(404).json({ success: false, message: "Theme not found" });
  
      const tenant = await Tenant.findById(req.user.tenant); // tenant from token
      if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
  
      tenant.theme = theme._id; // set tenant-specific theme
      await tenant.save();
  
      res.json({ success: true, message: "Theme selected", theme });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  

export default router;
// ✅ Create new theme (Super Admin only)
router.post("/create", protectSuperAdmin, async (req, res) => {
  try {
    const { name, colors, stickyHeader, productView, cardStyle } = req.body;

    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Theme name required" });

    const theme = await Theme.create({
      name,
      colors: colors || {
        navbar: "blue",
        footer: "gray",
        primary: "blue",
        secondary: "green",
      },
      stickyHeader: stickyHeader ?? true,
      productView: productView || "grid",
      cardStyle: cardStyle || "rounded",
    });

    res.json({ success: true, message: "Theme created", theme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
