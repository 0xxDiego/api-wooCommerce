// Importar dependências
const express = require('express');
const Crypto = require('crypto-js');
const cors = require('cors');
require('dotenv').config();

// Configurar o app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir JSON e CORS
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Substitua pelo URL do seu cliente
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept'],
}));

// Função para gerar nonce aleatório
function generateRandomNonce(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        nonce += charset.charAt(randomIndex);
    }
    return nonce;
}

// Função para lidar com requisições GET e POST
app.use('/api/:resource', async (req, res) => {

    console.log("/api/:resource ## woocomerce");
    
    const resource = req.params.resource;
    const apiUrl = `${process.env.WC_URL}/wp-json/wc/v3/${resource}`;
    const nonce = generateRandomNonce(32);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Parâmetros OAuth
    const oauthParams = {
        oauth_consumer_key: process.env.WC_CONSUMER_KEY,
        oauth_nonce: nonce,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: timestamp,
        oauth_version: '1.0',
    };

    const method = req.method;

    // Gerar string de parâmetros
    const generateParameterString = (parameters) =>
        Object.keys(parameters)
            .sort()
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
            .join('&');

    // Gerar cabeçalho OAuth
    const generateOauthHeader = (parameters) => {
        const signatureBaseString = `${method}&${encodeURIComponent(apiUrl)}&${encodeURIComponent(generateParameterString(parameters))}`;
        const signature = Crypto.enc.Base64.stringify(
            Crypto.HmacSHA1(signatureBaseString, `${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}&`)
        );

        return `OAuth oauth_consumer_key="${encodeURIComponent(process.env.WC_CONSUMER_KEY)}", oauth_nonce="${encodeURIComponent(
            nonce
        )}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${encodeURIComponent(
            timestamp
        )}", oauth_version="1.0"`;
    };

    // Tratar requisições GET
    if (method === 'GET') {
        const queryParams = req.query; // Express já faz o parsing de query params
        const oauthHeader = generateOauthHeader({ ...oauthParams, ...queryParams });

        const parameteredURL = `${apiUrl}?${generateParameterString(queryParams)}`;

        try {
            const response = await fetch(parameteredURL, {
                method: 'GET',
                headers: {
                    Authorization: oauthHeader,
                },
            });

            const data = await response.json();
            res.status(response.status).json(data);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao fazer requisição ao WooCommerce', details: error.message });
        }
    } else if (method === 'POST') {
        const contentType = req.headers['content-type'];
        if (contentType && contentType.includes('application/json')) {
            const requestData = req.body;
            const oauthHeader = generateOauthHeader(oauthParams);

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        Authorization: oauthHeader,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                const responseData = await response.json();
                res.status(response.status).json(responseData);
            } catch (error) {
                res.status(500).json({ error: 'Erro ao fazer requisição ao WooCommerce', details: error.message });
            }
        } else {
            res.status(405).json({ error: `Wrong content-type: ${contentType}, only 'application/json' is supported` });
        }
    } else {
        res.status(405).json({ error: `Method ${method} not allowed.` });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
