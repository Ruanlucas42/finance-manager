const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/transacoes', require('./routes/transacoes'));


app.get('/', (req, res) => res.json({ status: 'API rodando!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));