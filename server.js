import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import themeRoutes from "./routes/themeRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function(origin, callback) {
      if(!origin) return callback(null, true); // allow Postman, etc.
      const regex = /^http:\/\/.*\.localhost:5174$/;
      if(regex.test(origin) || origin === "http://localhost:5173") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  }));
  

// Routes
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/products", productRoutes);
app.use("/api/theme", themeRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
