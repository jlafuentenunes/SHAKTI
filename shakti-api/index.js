import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'shaktipass',
  database: process.env.DB_NAME || 'shakti_db',
};

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.monitordesurpresas.pt',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465
  auth: {
    user: process.env.SMTP_USER || 'geral@monitordesurpresas.pt',
    pass: process.env.SMTP_PASS, // Needs to be set in .env
  },
});

async function sendNotificationEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Shakti Home" <${process.env.SMTP_USER || 'geral@monitordesurpresas.pt'}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email error:', error);
  }
}

async function initDB() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        service_name VARCHAR(255) NOT NULL,
        booking_date VARCHAR(50) NOT NULL,
        booking_time VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables ready');
    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );
    await connection.end();
    
    // Send Confirmation to Admin
    await sendNotificationEmail(
      'geral@monitordesurpresas.pt',
      `Novo Contacto - ${subject}`,
      `<h3>Nova mensagem de ${name}</h3>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Mensagem:</strong><br/>${message}</p>`
    );

    res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { name, email, phone, service, date, time } = req.body;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO appointments (customer_name, customer_email, customer_phone, service_name, booking_date, booking_time) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, service, date, time]
    );
    await connection.end();

    // Send Confirmation to Client
    await sendNotificationEmail(
      email,
      'Confirmação de Reserva - Shakti Home',
      `<h3>Olá ${name},</h3>
       <p>A sua reserva para <strong>${service}</strong> foi efetuada com sucesso!</p>
       <p><strong>Data:</strong> ${date}</p>
       <p><strong>Hora:</strong> ${time}</p>
       <p>Aguardamos a sua visita na Av. da Praia 44, Apúlia.</p>`
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Reserva efetuada com sucesso!',
      bookingId: result.insertId 
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar reserva.' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM appointments ORDER BY created_at DESC');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDB();
});
