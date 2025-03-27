const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Replace with your MySQL username
    password: "", // Replace with your MySQL password
    database: "orders_db"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.message);
    } else {
        console.log("Connected to MySQL Database.");
    }
});

// Create Orders Table if not exists
db.query(`CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    whatsapp VARCHAR(20),
    total VARCHAR(50),
    payment VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Pending'
)`, (err) => {
    if (err) console.error("Table creation error: " + err.message);
});

// API to Fetch All Orders
app.get("/api/orders", (req, res) => {
    db.query("SELECT * FROM orders ORDER BY time DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// API to Add New Order
app.post("/api/orders", (req, res) => {
    const { whatsapp, total, payment } = req.body;
    if (!whatsapp || !total || !payment) {
        return res.status(400).json({ error: "All fields are required." });
    }

    db.query("INSERT INTO orders (whatsapp, total, payment) VALUES (?, ?, ?)",
        [whatsapp, total, payment], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            // Send WhatsApp Notification to Admin
            const adminNumber = "+1234567890"; // Replace with real admin number
            const message = `New Order Received!\n\n📅 Order Time: NOW\n📲 Buyer: ${whatsapp}\n💰 Total: ${total}\n💳 Payment: ${payment}\n\nContact Buyer: https://wa.me/${whatsapp}`;
            const whatsappURL = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;

            res.json({ success: true, message: "Order added successfully.", whatsappURL });
        }
    );
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes'); // Import routes

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/', routes); // Plugging in routes

// Export Express App (Plug-in Ready)
module.exports = app;

// If run directly, start the server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
