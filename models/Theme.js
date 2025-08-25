// models/Theme.js
import mongoose from "mongoose";

const themeSchema = new mongoose.Schema({
  name: { type: String, required: true },      // Theme name
  colors: {
    navbar: { type: String, default: "blue" },
    footer: { type: String, default: "gray" },
    primary: { type: String, default: "blue" },
    secondary: { type: String, default: "green" },
  },
  stickyHeader: { type: Boolean, default: true },
  productView: { type: String, enum: ["grid", "list"], default: "grid" },
  cardStyle: { type: String, default: "rounded" },
  isActive: { type: Boolean, default: false }, // NEW

});

export default mongoose.model("Theme", themeSchema);
