import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
        technician_name VARCHAR(255),
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
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        duration VARCHAR(50),
        price VARCHAR(50),
        category VARCHAR(100),
        technician_id INT DEFAULT NULL,
        checklist JSON DEFAULT NULL,
        promo_discount INT DEFAULT 10,
        promo_validity INT DEFAULT 60,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed services if table is empty
    const [existingServices] = await connection.query('SELECT count(*) as count FROM services');
    if (existingServices[0].count === 0) {
      const initialServices = [
        { name: 'Ayurveda Abhyanga', duration: '60 min', price: '65€', category: 'Massagens', technician_id: 1, checklist: JSON.stringify(['Óleo de Sésamo Quente', 'Massagem de 7 posições', 'Toalhas Quentes']) },
        { name: 'Corte & Styling', duration: '45 min', price: '35€', category: 'Cabeleireiro', technician_id: 2, checklist: JSON.stringify(['Lavagem com Kérastase', 'Corte Precision', 'Finalização com Secador']) },
        { name: 'Manicure Gelinho', duration: '60 min', price: '25€', category: 'Unhas', technician_id: 3, checklist: JSON.stringify(['Limpeza de Cutículas', 'Base de Queratina', 'Cor 2 Camadas', 'Óleo de Cutículas']) },
        { name: 'Terapia Xamânica', duration: '90 min', price: '80€', category: 'Terapias', technician_id: 4, checklist: JSON.stringify(['Defumação de Sálvia', 'Leitura de Energias', 'Alinhamento de Chacras']) }
      ];
      for (const s of initialServices) {
        await connection.execute('INSERT INTO services (name, duration, price, category, technician_id, checklist) VALUES (?, ?, ?, ?, ?, ?)', [s.name, s.duration, s.price, s.category, s.technician_id, s.checklist]);
      }
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent INT DEFAULT 10,
        appointment_id INT DEFAULT NULL,
        expires_at DATETIME NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
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
  const { name, email, phone, service, date, time, technician, voucherCode } = req.body;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if technician is already busy in this slot OR if the client already has a booking at this time
    const [existing] = await connection.execute(
      'SELECT id, technician_id, customer_email FROM appointments WHERE booking_date = ? AND booking_time = ? AND status != "cancelled" AND (technician_id = ? OR customer_email = ?)',
      [date, time, technician, email]
    );

    if (existing.length > 0) {
      const conflict = existing[0];
      await connection.end();
      if (conflict.technician_id == technician) {
        return res.status(400).json({ success: false, message: 'O técnico já tem uma marcação para este horário.' });
      } else {
        return res.status(400).json({ success: false, message: 'Já existe uma marcação para este cliente no mesmo horário.' });
      }
    }

    // Check if slot is blocked by admin (vacation, pause, etc)
    const [blocked] = await connection.execute(
      'SELECT id FROM blockouts WHERE technician_id = ? AND block_date = ? AND block_time = ?',
      [technician, date, time]
    );

    if (blocked.length > 0) {
      await connection.end();
      return res.status(400).json({ success: false, message: 'O técnico indicou que está indisponível para este horário (Pausa/Bloqueio).' });
    }

    const [result] = await connection.execute(
      'INSERT INTO appointments (customer_name, customer_email, customer_phone, service_name, technician_id, booking_date, booking_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, service, technician, date, time]
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

    // Mark voucher as used if applicable
    if (voucherCode) {
      const conn = await mysql.createConnection(dbConfig);
      await conn.execute('UPDATE vouchers SET is_used = TRUE WHERE code = ?', [voucherCode]);
      await conn.end();
    }
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar reserva.' });
  }
});

app.get('/api/bookings/busy', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Data não fornecida' });

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT booking_time FROM appointments WHERE booking_date = ? AND status != "cancelled" UNION SELECT block_time FROM blockouts WHERE block_date = ?',
      [date, date]
    );
    await connection.end();
    
    // Return an array of strings e.g. ["09:00", "10:30"]
    const busyTimes = rows.map(r => r.booking_time);
    res.json(busyTimes);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login (Admin or Technician)
app.post('/api/login', async (req, res) => {
  const { user, password } = req.body;
  console.log(`Login attempt for user: ${user}`);
  
  // Admin Check
  if (user === (process.env.ADMIN_USER || 'admin') && 
      password === (process.env.ADMIN_PASS || 'shakti2026')) {
    console.log('Admin login success');
    return res.json({ success: true, token: 'fake-jwt-shakti-admin', role: 'admin' });
  }

  // Technician Check
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, name FROM technicians WHERE username = ? AND password = ?',
      [user, password]
    );
    await connection.end();

    if (rows.length > 0) {
      console.log(`Technician login success: ${rows[0].name}`);
      return res.json({ 
        success: true, 
        token: `fake-jwt-shakti-tech-${rows[0].id}`, 
        role: 'technician',
        technicianId: rows[0].id,
        name: rows[0].name
      });
    }
  } catch (error) {
    console.error('Login DB error:', error);
  }

  console.log('Login failed: invalid credentials');
  res.status(401).json({ success: false, message: 'Credenciais inválidas' });
});

app.get('/api/technicians', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id, name, username, specialty, hourly_rate FROM technicians');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/technicians', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== 'fake-jwt-shakti-admin') {
    return res.status(403).json({ success: false, message: 'Não autorizado' });
  }

  const { name, username, password, specialty } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO technicians (name, username, password, specialty) VALUES (?, ?, ?, ?)',
      [name, username, password, specialty]
    );
    await connection.end();
    res.json({ success: true, message: 'Técnico adicionado com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/technicians/:id', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== 'fake-jwt-shakti-admin') {
    return res.status(403).json({ success: false, message: 'Não autorizado' });
  }
  const { id } = req.params;
  const { hourly_rate } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('UPDATE technicians SET hourly_rate = ? WHERE id = ?', [hourly_rate, id]);
    await connection.end();
    res.json({ success: true, message: 'Valor hora atualizado!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM settings WHERE id = 1');
    await connection.end();
    res.json(rows[0] || { calendar_start: '09:00', calendar_end: '19:00', slot_duration: 90 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/settings', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== 'fake-jwt-shakti-admin') {
    return res.status(403).json({ success: false, message: 'Não autorizado' });
  }
  const { calendar_start, calendar_end, slot_duration } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE settings SET calendar_start = ?, calendar_end = ?, slot_duration = ? WHERE id = 1',
      [calendar_start, calendar_end, slot_duration]
    );
    await connection.end();
    res.json({ success: true, message: 'Definições do calendário atualizadas!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/blockouts', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM blockouts');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/blockouts', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('fake-jwt-shakti-')) {
    return res.status(403).json({ success: false, message: 'Não autorizado' });
  }
  const { technician_id, date, time, reason } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO blockouts (technician_id, block_date, block_time, reason) VALUES (?, ?, ?, ?)',
      [technician_id, date, time, reason]
    );
    await connection.end();
    res.json({ success: true, message: 'Horário bloqueado com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('fake-jwt-shakti-')) {
    return res.status(403).json({ success: false, message: 'Não autorizado' });
  }
  
  const isAdmin = auth.includes('admin');
  const techMatch = auth.match(/fake-jwt-shakti-tech-(\d+)/);
  const techId = techMatch ? techMatch[1] : null;

  try {
    const connection = await mysql.createConnection(dbConfig);
    let query = 'SELECT * FROM appointments';
    let params = [];

    if (!isAdmin && techId) {
      query += ' WHERE technician_id = ?';
      params.push(techId);
    }
    
    query += ' ORDER BY booking_date DESC, booking_time ASC';
    
    const [rows] = await connection.execute(query, params);
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking status
app.patch('/api/bookings/:id', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('fake-jwt-shakti-')) {
    return res.status(403).json({ success: false, message: 'Não autorizado' });
  }

  const { id } = req.params;
  const { status } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    
    // Optional: Send email notification to client about status change
    const [rows] = await connection.execute('SELECT customer_email, customer_name, service_name, booking_date, booking_time FROM appointments WHERE id = ?', [id]);
    const booking = rows[0];
    
    if (booking && (status === 'confirmed' || status === 'cancelled')) {
      const subject = status === 'confirmed' ? 'Reserva Confirmada!' : 'Reserva Cancelada';
      const statusText = status === 'confirmed' ? 'foi confirmada' : 'foi cancelada';
      
      await sendNotificationEmail(
        booking.customer_email,
        `${subject} - Shakti Home`,
        `<h3>Olá ${booking.customer_name},</h3>
         <p>A sua reserva para <strong>${booking.service_name}</strong> no dia ${booking.booking_date} às ${booking.booking_time} ${statusText}.</p>
         ${status === 'cancelled' ? '<p>Se tiver alguma dúvida, por favor contacte-nos.</p>' : '<p>Aguardamos a sua visita!</p>'}`
      );
    }

    await connection.end();
    res.json({ success: true, message: `Status atualizado para ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDB();
});

app.get('/api/services', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM services');
    await connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/services/:id', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== 'fake-jwt-shakti-admin') {
    return res.status(403).json({ success: false, message: 'Não autorizado' });
  }
  const { id } = req.params;
  const { checklist, promo_discount, promo_validity } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    if (checklist !== undefined) {
      await connection.execute('UPDATE services SET checklist = ? WHERE id = ?', [JSON.stringify(checklist), id]);
    }
    if (promo_discount !== undefined) {
      await connection.execute('UPDATE services SET promo_discount = ? WHERE id = ?', [promo_discount, id]);
    }
    if (promo_validity !== undefined) {
      await connection.execute('UPDATE services SET promo_validity = ? WHERE id = ?', [promo_validity, id]);
    }
    await connection.end();
    res.json({ success: true, message: 'Serviço atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Voucher System Flash Deals
app.post('/api/bookings/:id/promote', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== 'fake-jwt-shakti-admin') {
    return res.status(403).json({ success: false, message: 'Dedicado apenas ao Administrador' });
  }

  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [appt] = await connection.execute(
      `SELECT a.*, s.promo_discount, s.promo_validity 
       FROM appointments a 
       LEFT JOIN services s ON a.service_name = s.name 
       WHERE a.id = ?`, 
      [id]
    );
    if (appt.length === 0) {
      await connection.end();
      return res.status(404).json({ success: false, message: 'Marcação não encontrada' });
    }
    
    const appointment = appt[0];
    const discountPercent = appointment.promo_discount || 10;
    const validityMin = appointment.promo_validity || 60;

    // 1. Get ALL unique regular clients (exclude current appt client)
    const [regulars] = await connection.execute(
      'SELECT DISTINCT customer_email, customer_name FROM appointments WHERE status = "confirmed" AND customer_email != ?',
      [appointment.customer_email]
    );

    if (regulars.length === 0) {
      await connection.end();
      return res.status(400).json({ success: false, message: 'Sem clientes regulares suficientes.' });
    }

    // 2. Generate voucher code
    const vCode = 'FLASH-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + validityMin);

    await connection.execute(
      'INSERT INTO vouchers (code, discount_percent, appointment_id, expires_at) VALUES (?, ?, ?, ?)',
      [vCode, discountPercent, id, expiry.toISOString().slice(0, 19).replace('T', ' ')]
    );

    // 3. Email Regulars
    const promoBody = `
      <div style="font-family: sans-serif; padding: 25px; border: 2px solid #2d5a27; border-radius: 15px; max-width: 500px; margin: auto;">
        <h2 style="color: #2d5a27; text-align: center;">🔥 Vaga de Última Hora - ${discountPercent}% OFF!</h2>
        <p>Olá! Temos uma vaga que acaba de ficar disponível e, como cliente especial Shakti, queremos dar-lhe prioridade!</p>
        <div style="background: #f4f7f4; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2d5a27;">
          <p style="margin: 5px 0;"><strong>Serviço:</strong> ${appointment.service_name}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> ${appointment.booking_date}</p>
          <p style="margin: 5px 0;"><strong>Hora:</strong> ${appointment.booking_time}</p>
        </div>
        <p style="text-align: center;">Use o código abaixo na sua reserva nos próximos ${validityMin} min:</p>
        <div style="text-align: center;">
          <h1 style="background: #2d5a27; color: white; display: inline-block; padding: 12px 25px; border-radius: 8px; letter-spacing: 2px;">${vCode}</h1>
        </div>
        <p style="text-align: center; margin-top: 20px;">
          <a href="http://improving-photographs-exemption-gave.trycloudflare.com" 
             style="background: #e4c59e; color: #2d5a27; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reservar Já</a>
        </p>
      </div>
    `;

    for (const reg of regulars) {
      await sendNotificationEmail(reg.customer_email, '⚡ Oportunidade Flash Shakti Home - 10% OFF ⚡', promoBody);
    }

    await connection.end();
    res.json({ success: true, message: `Oportunidade promovida a ${regulars.length} clientes!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/vouchers/validate', async (req, res) => {
  const { code } = req.query;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM vouchers WHERE code = ? AND is_used = FALSE AND expires_at > NOW()',
      [code]
    );
    await connection.end();
    if (rows.length > 0) {
      res.json({ success: true, discount: rows[0].discount_percent });
    } else {
      res.json({ success: false, message: 'Código inválido ou expirado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Promote an empty slot as a flash deal
app.post('/api/vouchers/promote-empty', async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== 'fake-jwt-shakti-admin') {
    return res.status(403).json({ success: false, message: 'Não autorizado' });
  }

  const { serviceId, date, time } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [srv] = await connection.execute('SELECT * FROM services WHERE id = ?', [serviceId]);
    if (srv.length === 0) {
      await connection.end();
      return res.status(404).json({ success: false, message: 'Serviço não encontrado' });
    }
    const service = srv[0];
    const discountPercent = service.promo_discount || 10;
    const validityMin = service.promo_validity || 60;

    // 1. Get ALL regulars
    const [regulars] = await connection.execute(
      'SELECT DISTINCT customer_email, customer_name FROM appointments WHERE status = "confirmed"'
    );

    if (regulars.length === 0) {
      await connection.end();
      return res.status(400).json({ success: false, message: 'Sem clientes regulares suficientes.' });
    }

    // 2. Generate voucher
    const vCode = 'PROMO-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + validityMin);

    await connection.execute(
      'INSERT INTO vouchers (code, discount_percent, expires_at) VALUES (?, ?, ?)',
      [vCode, discountPercent, expiry.toISOString().slice(0, 19).replace('T', ' ')]
    );

    // 3. Email Regulars
    const promoBody = `
      <div style="font-family: sans-serif; padding: 25px; border: 2px solid #e4c59e; border-radius: 15px; max-width: 500px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2d5a27; margin: 0;">⚡ Oportunidade Especial Shakti ⚡</h2>
          <p style="color: #666;">Temos um horário disponível! Aproveite o desconto flash!</p>
        </div>
        <div style="background: #fdfaf6; padding: 15px; border-radius: 10px; margin: 20px 0; border: 1px solid #e4c59e;">
          <p style="margin: 5px 0;"><strong>Tratamento:</strong> ${service.name}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Hora:</strong> ${time}</p>
        </div>
        <div style="text-align: center;">
          <p style="margin-bottom: 10px;">Código para obter <strong>${discountPercent}% de desconto</strong>:</p>
          <h1 style="background: #2d5a27; color: white; display: inline-block; padding: 12px 30px; border-radius: 10px; letter-spacing: 3px; font-size: 2rem;">${vCode}</h1>
          <p style="font-size: 0.8rem; color: #999; margin-top: 10px;">*Válido apenas nos próximos ${validityMin} minutos!</p>
        </div>
        <p style="text-align: center; margin-top: 25px;">
          <a href="http://improving-photographs-exemption-gave.trycloudflare.com" 
             style="background: #e4c59e; color: #2d5a27; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; border: 1px solid #2d5a27;">Agendar Agora</a>
        </p>
      </div>
    `;

    for (const reg of regulars) {
      await sendNotificationEmail(reg.customer_email, '📢 Vimos que este slot está livre! Desconto Especial 10%', promoBody);
    }

    await connection.end();
    res.json({ success: true, message: `Slot de ${time} promovido para ${regulars.length} clientes!` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
