import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: Number, default: 0 },
    rating: { type: mongoose.Schema.Types.Mixed, default: 4.5 },
    category: { type: String, required: true },
    subcategory: { type: String },
    brand: { type: String },
    image: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String },
    features: [{ type: String }],
    leadTime: { type: String },
    moq: { type: Number, default: 25 },
    inStock: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
