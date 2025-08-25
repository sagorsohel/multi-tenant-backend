import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectSuperAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "superadmin") return res.status(403).json({ message: "Forbidden" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const protectTenant = async (req, res, next) => {
  try {
    const token = req.cookies.tenantToken || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { tenant: decoded.tenantId, subdomain: decoded.subdomain, id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
