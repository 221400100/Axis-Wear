import nodemailer from 'nodemailer';
import axios from 'axios';
import Twilio from 'twilio';

const provider = process.env.WHATSAPP_API_PROVIDER || 'none';

const getNotificationTargets = async () => ({
    adminEmail: process.env.ADMIN_EMAIL,
    whatsappAdminNumber: process.env.ADMIN_WHATSAPP_NUMBER
});

const smtpTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR'
    }).format(value);
};

const buildEmailHtml = (order) => {
    const items = order.orderItems
        .map(
            (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #dddddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #dddddd;">${item.qty}</td>
        <td style="padding: 8px; border: 1px solid #dddddd;">${formatCurrency(item.price)}</td>
      </tr>`
        )
        .join('');

    return `
    <h2>New Order Received</h2>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Customer:</strong> ${order.customerName}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr>
          <th style="padding: 8px; border: 1px solid #dddddd; text-align: left;">Item</th>
          <th style="padding: 8px; border: 1px solid #dddddd; text-align: left;">Quantity</th>
          <th style="padding: 8px; border: 1px solid #dddddd; text-align: left;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${items}
      </tbody>
    </table>
    <p style="margin-top: 16px;"><strong>Total Price:</strong> ${formatCurrency(order.totalPrice)}</p>
  `;
};

export const sendOrderNotificationEmail = async (order) => {
    const { adminEmail } = await getNotificationTargets();
    if (!adminEmail) {
        console.info('Order email notification skipped because ADMIN_EMAIL is not configured.');
        return null;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: adminEmail,
        subject: `New order received: ${order.orderNumber || order._id}`,
        html: buildEmailHtml(order)
    };

    const info = await smtpTransport.sendMail(mailOptions);
    console.info('Order email sent:', info.messageId);
    return info;
};

const buildWhatsAppMessage = (order) => {
    const itemSummary = order.orderItems
        .map((item) => `${item.name} x${item.qty}`)
        .join(', ');

    return `New order received from ${order.customerName}. Total: ${formatCurrency(order.totalPrice)}. Items: ${itemSummary}. Order ID: ${order._id}`;
};

const buildClickToChatUrl = (message, whatsappAdminNumber) => {
    const encoded = encodeURIComponent(message);
    const phone = whatsappAdminNumber?.replace(/[^0-9+]/g, '');
    return `https://wa.me/${phone.replace('+', '')}?text=${encoded}`;
};

export const sendOrderNotificationWhatsApp = async (order) => {
    const { whatsappAdminNumber } = await getNotificationTargets();
    if (!whatsappAdminNumber) {
        console.info('WhatsApp notification skipped because ADMIN_WHATSAPP_NUMBER is not configured.');
        return null;
    }

    const message = buildWhatsAppMessage(order);

    if (provider === 'twilio') {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

        if (!accountSid || !authToken || !fromNumber) {
            throw new Error('Twilio WhatsApp configuration is incomplete.');
        }

        const client = Twilio(accountSid, authToken);
        const result = await client.messages.create({
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${whatsappAdminNumber}`,
            body: message
        });

        console.info('Twilio WhatsApp message sent:', result.sid);
        return result;
    }

    if (provider === 'cloudapi') {
        const apiUrl = process.env.WHATSAPP_CLOUD_API_URL;
        const apiToken = process.env.WHATSAPP_CLOUD_API_TOKEN;

        if (!apiUrl || !apiToken) {
            throw new Error('WhatsApp Cloud API configuration is incomplete.');
        }

        const response = await axios.post(
            apiUrl,
            {
                messaging_product: 'whatsapp',
                to: whatsappAdminNumber.replace('+', ''),
                type: 'text',
                text: { body: message }
            },
            {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.info('WhatsApp Cloud API response:', response.data);
        return response.data;
    }

    const url = buildClickToChatUrl(message, whatsappAdminNumber);
    console.info('WhatsApp click-to-chat link generated:', url);
    return { url };
};

export const triggerOrderNotifications = async (order) => {
    const results = await Promise.allSettled([
        sendOrderNotificationEmail(order),
        sendOrderNotificationWhatsApp(order)
    ]);

    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(`Notification ${index === 0 ? 'email' : 'whatsapp'} failed:`, result.reason);
        }
    });

    return results;
};
