const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const emailValidator = require('email-validator');

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));
app.post('/api/registros', (req, res) => {
    console.log(req.body);
    try {
        console.log('Dados recebidos:', req.body);
        const registro = req.body;
        let tudoCerto = true;

        // Verifica se o campo "email" foi preenchido
        if (!registro.email) {
            tudoCerto = false;
            res.status(400).json({ success: false, error: "Campo 'email' é obrigatório" });
            return;
        }

        // Verifica se o campo "email" é válido
        console.log('Email recebido: ', registro.email);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registro.email)) {
            tudoCerto = false;
            res.status(400).json({ success: false, error: "Email inválido" });
            return;
        }

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(400).json({ success: false, error: "Erro ao analisar JSON" });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
})