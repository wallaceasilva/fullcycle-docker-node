const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const connection = mysql.createConnection({
  host: 'db', 
  user: 'root',
  password: 'root',
  database: 'nodedb'
});

function connectToDatabase(retries = 5) {
  connection.connect(err => {
    if (err) {
      console.error('Erro ao conectar no MySQL:', err.message);
      if (retries > 0) {
        console.log(`Tentando novamente em 5 segundos... (${retries} tentativas restantes)`);
        setTimeout(() => connectToDatabase(retries - 1), 5000);
      } else {
        console.log('Não foi possível conectar ao MySQL após várias tentativas.');
        process.exit(1); // encerra o processo se falhar demais
      }
      return;
    }

    console.log('Conectado ao MySQL.');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS people (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )`;

    connection.query(createTableQuery, err => {
      if (err) {
        console.error('Erro ao criar tabela:', err.message);
        process.exit(1);
      }
    });
  });
}

connectToDatabase();

app.get('/', (req, res) => {
  const name = `User_${Math.floor(Math.random() * 1000)}`;
  connection.query('INSERT INTO people(name) VALUES(?)', [name], err => {
    if (err) return res.status(500).send('Erro ao inserir no banco de dados');

    connection.query('SELECT name FROM people', (err, results) => {
      if (err) return res.status(500).send('Erro ao consultar banco de dados');

      const namesList = results.map(r => r.name).join(', ');
      res.send(`<h1>Full Cycle Rocks!</h1><p>${namesList}</p>`);
    });
  });
});

app.listen(port, () => {
  console.log(`App rodando na porta ${port}`);
});
