import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'shaktipass',
  database: 'shakti_db',
};

async function update() {
  const connection = await mysql.createConnection(dbConfig);
  try {
    console.log('Connected to DB');
    
    const updates = [
      ['https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800', 'Ayurveda Abhyanga'],
      ['https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&q=80&w=800', 'Corte & Styling'],
      ['https://images.unsplash.com/photo-1632345031435-07ca6818de60?auto=format&fit=crop&q=80&w=800', 'Manicure Gelinho'],
      ['https://images.unsplash.com/photo-1544161515-4af6b1d8e1a9?auto=format&fit=crop&q=80&w=800', 'Terapia Xamânica']
    ];

    for (const [url, name] of updates) {
      await connection.execute('UPDATE services SET image_url = ? WHERE name = ?', [url, name]);
      console.log(`Updated ${name}`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

update();
