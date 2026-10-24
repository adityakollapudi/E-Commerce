import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    quoteId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true, default: null },
    userEmail: { type: String, index: true, default: null },
    productId: { type: mongoose.Schema.Types.Mixed },
    productTitle: { type: String, required: true },
    sku: { type: String },
    brand: { type: String },
    selectedColor: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    brandingOption: { type: String, default: "UV Digital Print" },
    companyName: { type: String, required: true },
    contactName: { type: String },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    pincode: { type: String },
    customText: { type: String },
    notes: { type: String },
    estimatedTotal: { type: Number },
    status: {
      type: String,
      enum: ["pending_review", "mockup_in_progress", "quoted", "accepted", "closed"],
      default: "pending_review",
      index: true,
    },
    adminNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Quote = mongoose.models.Quote || mongoose.model("Quote", quoteSchema);
export default Quote;
