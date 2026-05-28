# Axis Wear Backend

This backend provides order persistence, email notifications, and WhatsApp notifications for the Axis Wear full-stack app.

## Features

- Express + MongoDB backend
- Admin authentication with JWT login
- Product CRUD via `/api/products`
- Product image uploads via `/api/upload`
- `POST /api/orders` to create new orders
- `GET /api/orders` to list saved orders
- Nodemailer email notifications to admin
- WhatsApp notification support via:
  - click-to-chat fallback
  - Twilio WhatsApp API
  - Meta WhatsApp Cloud API
- Notifications are triggered in the background so order creation is not blocked

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Copy the example env file:

```bash
cp .env.example .env
```

3. Fill in your MongoDB, JWT, and admin configuration in `.env`

4. Run the reset script once to clear all existing data and seed the admin account:

```bash
npm run reset
```

5. Start the server:

```bash
npm run dev
```

## Order API

### Create order

`POST /api/orders`

Body example:

```json
{
  "customerName": "Ali Khan",
  "phoneNumber": "+92 300 1234567",
  "shippingAddress": {
    "name": "Ali Khan",
    "phone": "+92 300 1234567",
    "address": "DHA Phase 5",
    "city": "Karachi"
  },
  "orderItems": [
    {
      "product": "prod_1",
      "name": "Stealth Cyber Bomber Jacket",
      "qty": 1,
      "size": "L",
      "color": "Stealth Black",
      "price": 110.49
    }
  ],
  "paymentMethod": "Cash on Delivery",
  "paymentStatus": "Pending",
  "shippingFee": 400,
  "totalPrice": 510.49
}
```

## Notes

- Email and WhatsApp notifications are triggered asynchronously after the order is saved.
- If notification delivery fails, the order still succeeds.
- For Gmail SMTP, use an App Password or a dedicated SMTP account.
- For production, run with a reliable process manager and secure environment variables.
