// Importar dependências
const express = require('express');
const Crypto = require('crypto-js');
const cors = require('cors');
require('dotenv').config();
const fetch = require('node-fetch');

// Configurar o app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir JSON e CORS
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept'],
}));

// Função para gerar nonce aleatório
function generateRandomNonce(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
        nonce += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return nonce;
}

// Gerar string de parâmetros
function generateParameterString(parameters) {
    return Object.keys(parameters)
        .sort()
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
        .join('&');
}

// Gerar cabeçalho OAuth
function generateOauthHeader(apiUrl, method, parameters) {
    const signatureBaseString = `${method}&${encodeURIComponent(apiUrl)}&${encodeURIComponent(generateParameterString(parameters))}`;
    const signature = Crypto.enc.Base64.stringify(
        Crypto.HmacSHA1(signatureBaseString, `${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}&`)
    );

    return `OAuth oauth_consumer_key="${encodeURIComponent(process.env.WC_CONSUMER_KEY)}", oauth_nonce="${encodeURIComponent(
        parameters.oauth_nonce
    )}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${encodeURIComponent(
        parameters.oauth_timestamp
    )}", oauth_version="1.0"`;
}

// Função para fazer a requisição para o WooCommerce
async function woocommerceRequest(method, endpoint, body = null) {
    const apiUrl = `${process.env.WC_URL}/wp-json/wc/v3/${endpoint}`;
    const nonce = generateRandomNonce(32);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const oauthParams = {
        oauth_consumer_key: process.env.WC_CONSUMER_KEY,
        oauth_nonce: nonce,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: timestamp,
        oauth_version: '1.0',
    };

    const oauthHeader = generateOauthHeader(apiUrl, method, oauthParams);

    const response = await fetch(apiUrl, {
        method,
        headers: {
            Authorization: oauthHeader,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
    });

    return response;
}

// Rota POST para adicionar um produto
app.post('/api/products', async (req, res) => {
    const productData = req.body;

    try {
        const response = await woocommerceRequest('POST', 'products', productData);
        const responseData = await response.json();
        res.status(response.status).json(responseData);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer requisição ao WooCommerce', details: error.message });
    }
});

// Rota GET para listar produtos
app.get('/api/wc/products', async (req, res) => {
    try {
        const response = await woocommerceRequest('GET', 'products');
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer requisição ao WooCommerce', details: error.message });
    }
});

// Iniciar o servidor
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    // Chamar a rota POST para enviar um produto de teste em seguida vamos criar o lado cliente com interface grafica.
    const productData = {
        name: "Produto de Teste",
        type: "simple",
        regular_price: "19.99",
        description: "Descrição do Produto de Teste",
        short_description: "Descrição Curta do Produto",
        categories: [{ id: 9 }], // Certifique-se de que essa categoria exista no WooCommerce
        // images: [{ src: "https://picsum.photos/200" }]
    };
    

    try {
        const response = await woocommerceRequest('POST', 'products', productData);
        const responseData = await response.json();
        console.log('Produto adicionado:', responseData);
    } catch (error) {
        console.error('Erro ao adicionar produto:', error.message);
    }
});
