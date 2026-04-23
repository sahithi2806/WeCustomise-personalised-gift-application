const nodemailer = require('nodemailer');

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });
}

async function sendOrderConfirmation(email, name, order) {
  if (!process.env.MAIL_USER) return; // skip if not configured
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"WeCustomise" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1F4E79">Hi ${name}, your order is confirmed! 🎉</h2>
        <p>Order ID: <strong>#${order.id.slice(0, 8).toUpperCase()}</strong></p>
        <p>Total: <strong>₹${order.totalAmount.toFixed(2)}</strong></p>
        <p>Payment: ${order.paymentMethod}</p>
        <p>We'll notify you when your order ships. Thank you for shopping with WeCustomise!</p>
      </div>
    `,
  });
}

async function sendGiftReminder(email, name, gift) {
  if (!process.env.MAIL_USER) return;
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"WeCustomise" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `🎁 Reminder: ${gift.occasion} is coming up!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1F4E79">Don't forget, ${name}!</h2>
        <p>Your gift for <strong>${gift.recipientName}</strong> is scheduled for <strong>${new Date(gift.scheduledDate).toDateString()}</strong>.</p>
        <p>Occasion: ${gift.occasion}</p>
        <p><a href="${process.env.CLIENT_URL}/shop" style="background:#1F4E79;color:white;padding:10px 20px;border-radius:5px;text-decoration:none">Shop Now</a></p>
      </div>
    `,
  });
}

module.exports = { sendOrderConfirmation, sendGiftReminder };
