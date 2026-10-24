import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "Giftingwellness <no-reply@giftingwellness.com>";
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || "sales@giftingwellness.com";

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log(`✉️ Email service initialized with SMTP host: ${SMTP_HOST}`);
  } catch (err) {
    console.warn("⚠️ Email service initialization warning:", err.message);
  }
} else {
  console.log("ℹ️ SMTP credentials not configured in .env. Email notifications will run in mock console mode.");
}

/**
 * Dispatch transactional email helper
 */
const sendMailSafe = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log(`[Email Mock Console] To: ${to} | Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Dispatch Error] To: ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send order confirmation to customer and notification to store admin
 */
export const sendOrderConfirmationEmail = async (order) => {
  if (!order) return;

  const itemsRows = (order.items || [])
    .map(
      (it) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
          <strong>${it.title}</strong><br/>
          <span style="font-size: 12px; color: #64748b;">
            Size: ${it.size || "Standard"} ${it.selectedColor ? `· Color: ${it.selectedColor}` : ""}
            ${it.customLogoText ? `<br/>Custom Branding: "${it.customLogoText}"` : ""}
          </span>
        </td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e2e8f0;">${it.quantity}</td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">₹${Number(it.lineTotal || it.quantity * it.price).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <div style="background: #0d3b2e; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Giftingwellness</h1>
        <p style="color: #e2e8f0; margin: 4px 0 0; font-size: 14px;">Thoughtfully Chosen. Meaningfully Delivered.</p>
      </div>

      <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #0d3b2e; margin-top: 0;">Order Confirmed! #${order.orderId}</h2>
        <p>Dear ${order.customer?.fullName},</p>
        <p>Thank you for choosing Giftingwellness. Your order has been placed and is being prepared for fulfillment.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 10px; text-align: left; font-size: 13px;">Item</th>
              <th style="padding: 10px; text-align: center; font-size: 13px;">Qty</th>
              <th style="padding: 10px; text-align: right; font-size: 13px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 20px;">
          <p style="margin: 4px 0; font-size: 14px;">Subtotal: <strong>₹${Number(order.pricing?.subtotal || 0).toFixed(2)}</strong></p>
          ${order.pricing?.discount > 0 ? `<p style="margin: 4px 0; color: #166534;">Discount: -₹${Number(order.pricing.discount).toFixed(2)}</p>` : ""}
          <p style="margin: 4px 0; font-size: 14px;">Delivery: <strong>${order.pricing?.deliveryFee === 0 ? "FREE" : `₹${order.pricing?.deliveryFee}`}</strong></p>
          <h3 style="margin: 8px 0 0; color: #0d3b2e; font-size: 18px;">Total: ₹${Number(order.pricing?.total || 0).toFixed(2)}</h3>
        </div>

        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px; color: #0f172a;">Shipping Address:</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">
            ${order.customer?.fullName}<br/>
            ${order.customer?.address}, ${order.customer?.city} - ${order.customer?.postalCode}<br/>
            Phone: ${order.customer?.phone || "N/A"}
          </p>
        </div>

        ${order.gifting?.isGift ? `
          <div style="background: #fefce8; padding: 14px; border-radius: 6px; border: 1px dashed #fef08a; margin-bottom: 20px;">
            <strong style="color: #854d0e;">🎁 Gift Note Attached:</strong>
            ${order.gifting.recipientName ? `<p style="margin: 4px 0 0; font-size: 13px;">To: ${order.gifting.recipientName}</p>` : ""}
            ${order.gifting.giftMessage ? `<p style="margin: 4px 0 0; font-style: italic; font-size: 13px;">"${order.gifting.giftMessage}"</p>` : ""}
          </div>
        ` : ""}

        <p style="font-size: 13px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; paddingTop: 16px;">
          Need assistance or custom corporate branding revisions? Reply directly to this email or call ${process.env.SUPPORT_PHONE || "+91 91212 99914"}.
        </p>
      </div>
    </div>
  `;

  // 1. Email to Customer
  if (order.customer?.email) {
    await sendMailSafe({
      to: order.customer.email,
      subject: `Order Confirmation #${order.orderId} - Giftingwellness`,
      html: emailHtml,
      text: `Your Giftingwellness order #${order.orderId} of ₹${order.pricing?.total} has been received.`,
    });
  }

  // 2. Alert to Store Admin
  await sendMailSafe({
    to: ADMIN_ALERT_EMAIL,
    subject: `[New Order] #${order.orderId} from ${order.customer?.fullName} (₹${order.pricing?.total})`,
    html: emailHtml,
    text: `New order #${order.orderId} placed for ₹${order.pricing?.total}.`,
  });
};

/**
 * Send quotation notification to sales reps and acknowledgement to customer
 */
export const sendQuoteNotificationEmail = async (quote) => {
  if (!quote) return;

  const quoteHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <div style="background: #0d3b2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0;">New Bulk Corporate Quotation Request</h2>
      </div>
      <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <p><strong>Quote ID:</strong> ${quote.quoteId}</p>
        <p><strong>Company:</strong> ${quote.companyName}</p>
        <p><strong>Contact:</strong> ${quote.contactName || "N/A"} (${quote.contactEmail} / ${quote.contactPhone || "N/A"})</p>
        <p><strong>Product:</strong> ${quote.productTitle} (Qty: ${quote.quantity} units)</p>
        <p><strong>Branding Option:</strong> ${quote.brandingOption}</p>
        ${quote.customText ? `<p><strong>Logo / Company Name to Print:</strong> "${quote.customText}"</p>` : ""}
        ${quote.notes ? `<p><strong>Client Notes:</strong> "${quote.notes}"</p>` : ""}
        ${quote.estimatedTotal ? `<p><strong>Estimated Order Value:</strong> ₹${Number(quote.estimatedTotal).toFixed(2)}</p>` : ""}
      </div>
    </div>
  `;

  // Alert Sales Team
  await sendMailSafe({
    to: ADMIN_ALERT_EMAIL,
    subject: `[Corporate Lead] Bulk Quote #${quote.quoteId} - ${quote.companyName} (${quote.quantity} units)`,
    html: quoteHtml,
    text: `New quote request from ${quote.companyName} for ${quote.quantity}x ${quote.productTitle}.`,
  });

  // Acknowledgement to Corporate Buyer
  if (quote.contactEmail) {
    const ackHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: #0d3b2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: #ffffff; margin: 0;">We Received Your Bulk Quote Request</h2>
        </div>
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
          <p>Dear ${quote.contactName || quote.companyName},</p>
          <p>Thank you for reaching out to Giftingwellness regarding <strong>${quote.productTitle}</strong> (Quantity: ${quote.quantity} units).</p>
          <p>Our corporate design and procurement team is reviewing your branding requirements and will email an official proposal with digital mockups within 2 business hours.</p>
          <p style="font-size: 13px; color: #64748b;">Lead Reference: #${quote.quoteId}</p>
        </div>
      </div>
    `;
    await sendMailSafe({
      to: quote.contactEmail,
      subject: `Quotation Inquiry #${quote.quoteId} Received - Giftingwellness`,
      html: ackHtml,
      text: `Thank you for your bulk quotation request #${quote.quoteId}. Our sales team will reach out within 2 hours.`,
    });
  }
};

/**
 * Send courier shipment tracking alert to customer
 */
export const sendDispatchUpdateEmail = async (order, tracking) => {
  if (!order || !order.customer?.email || !tracking?.trackingNumber) return;

  const dispatchHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <div style="background: #0d3b2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0;">Your Gift Order is On Its Way! 🚚</h2>
      </div>
      <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <p>Dear ${order.customer?.fullName},</p>
        <p>Great news! Your Giftingwellness order <strong>#${order.orderId}</strong> has been packaged, branded, and dispatched.</p>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; color: #1e40af; font-weight: 700;">Courier Partner: ${tracking.courier || "BlueDart / Delhivery"}</p>
          <p style="margin: 6px 0; font-size: 16px; font-weight: 800; color: #0f172a;">AWB Tracking #: ${tracking.trackingNumber}</p>
          ${tracking.trackingUrl ? `<a href="${tracking.trackingUrl}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #1d4ed8; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 700; margin-top: 8px;">Track Package Live →</a>` : ""}
        </div>
      </div>
    </div>
  `;

  await sendMailSafe({
    to: order.customer.email,
    subject: `Order #${order.orderId} Dispatched - Tracking: ${tracking.trackingNumber}`,
    html: dispatchHtml,
    text: `Your order #${order.orderId} was dispatched via ${tracking.courier}. Tracking #: ${tracking.trackingNumber}`,
  });
};
