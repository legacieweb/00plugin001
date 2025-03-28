const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { Server } = require("socket.io");
const http = require("http");

const PORT = 5000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());

const ORDERS_FILE = "orders.json";
const ADMIN_EMAIL = "iyonicorp@gmail.com"; // Change this to your email

// Nodemailer transporter setup (configure SMTP settings)
const transporter = nodemailer.createTransport({
    service: "gmail", // Change to your email provider (Outlook, Yahoo, etc.)
    auth: {
        user: "iyonicorp@gmail.com", // Replace with your email
        pass: "dikfirjarvijwskx", // Replace with your email password or App Password
    },
});

// Function to send order email to admin
const sendOrderEmail = (order) => {
    const itemsList = order.cart
        .map(item => `${item.productName} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
        .join("\n");

    const mailOptions = {
        from: "iyonicorp@gmail.com", // Sender email
        to: ADMIN_EMAIL, // Admin email
        subject: `🛒 New Order Received - ${order.fullName}`,
        text: `
        📅 Order Date: ${new Date(order.orderDate).toLocaleString()}
        
        👤 Customer Details:
        Name: ${order.fullName}
        Email: ${order.email}
        Phone: ${order.phone}
        Address: ${order.address}
        
        💳 Payment Method: ${order.paymentMethod}
        
        🛍 Items Ordered:
        ${itemsList}
        
        💰 Total Amount: $${order.totalAmount.toFixed(2)}
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("❌ Error sending email:", error);
        } else {
            console.log("📩 Order email sent:", info.response);
        }
    });
};

// Save Order to JSON File & Send Email
app.post("/api/orders", (req, res) => {
    const newOrder = req.body;

    // Read existing orders
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) {
        orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
    }

    orders.push(newOrder);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

    // Send email notification to admin
    sendOrderEmail(newOrder);

    res.json({ success: true, message: "Order placed successfully!" });
});

// Get All Orders
app.get("/api/orders", (req, res) => {
    if (!fs.existsSync(ORDERS_FILE)) {
        return res.json([]);
    }
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
    res.json(orders);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
