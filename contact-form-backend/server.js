const express = require('express');
const nodemailer = require('nodemailer');
const multiparty = require('multiparty');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Nodemailer transporter with timeouts
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

// Handle form submission
app.post('/send', async (req, res) => {
    console.log('Received POST /send request', {
        headers: req.headers,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    let form = new multiparty.Form();
    let data = {};

    try {
        form.parse(req, (err, fields) => {
            if (err) {
                console.error('Form parsing error:', err.message);
                return res.status(500).json({ message: 'Error parsing form', error: err.message });
            }

            console.log('Parsed form fields:', fields);
            Object.keys(fields).forEach((property) => {
                data[property] = fields[property].toString();
            });

            if (!data.name || !data.email || !data.message) {
                console.log('Missing fields:', data);
                return res.status(400).json({ message: 'Missing required fields', fields: data });
            }

            const mail = {
                from: `"${data.name}" <${data.email}>`,
                to: process.env.EMAIL,
                subject: 'New Contact Form Submission',
                text: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`,
            };

            transporter.sendMail(mail, (err, result) => {
                if (err) {
                    console.error('Nodemailer error:', {
                        message: err.message,
                        code: err.code,
                        command: err.command,
                        stack: err.stack,
                    });
                    return res.status(500).json({ message: 'Failed to send email', error: err.message });
                }
                console.log('Email sent successfully:', result);
                const response = { message: 'Email sent successfully' };
                console.log('Sending response:', response);
                res.status(200).json(response);
            });
        });
    } catch (error) {
        console.error('Unexpected error in /send:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Serve static files after routes
// if (process.env.NODE_ENV !== 'production') {
//   app.use(express.static('frontend'));
// }

// Catch-all for debugging
app.use((req, res) => {
    console.log(`Unhandled request: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

module.exports = app;