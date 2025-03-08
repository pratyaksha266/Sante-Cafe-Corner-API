require('dotenv').config(); // Load environment variables
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debugging: Ensure environment variables are loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECEIVER_EMAIL) {
    console.error("Missing environment variables! Check your .env file.");
    process.exit(1); // Stop server if .env variables are missing
}

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider (Gmail, Outlook, etc.)
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password or app password
    }
});

// Debugging: Verify transporter is ready
transporter.verify((error, success) => {
    if (error) {
        console.error("Nodemailer Error:", error);
    } else {
        console.log("Nodemailer is ready to send emails!");
    }
});

// Route to Handle Form Submission
app.post('/send', async (req, res) => {
    console.log("Received Data:", req.body); // Debugging
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        console.log("Missing fields!"); // Debugging
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER, // Use your email (not user's email)
        to: process.env.RECEIVER_EMAIL,
        replyTo: email, // This allows replying directly to the sender
        subject: subject,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!", result.response); // Debugging
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ message: 'Error sending email', error });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
