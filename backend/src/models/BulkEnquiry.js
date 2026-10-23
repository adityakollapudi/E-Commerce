import mongoose from "mongoose";

const bulkEnquirySchema = new mongoose.Schema(
  {
    enquiryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String },
    category: { type: String, default: "General Gifting" },
    quantity: { type: String },
    customBranding: { type: String, default: "Yes" },
    targetDate: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "in_review", "quoted", "closed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const BulkEnquiry =
  mongoose.models.BulkEnquiry || mongoose.model("BulkEnquiry", bulkEnquirySchema);
export default BulkEnquiry;
