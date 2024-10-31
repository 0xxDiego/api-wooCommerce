// public/script.js

const apiUrl = 'http://localhost:3000/api/wc/products';
const apiUrlSender = 'http://localhost:3000/api/products';

// Função para adicionar produto
async function addProduct() {
    const productData = {
        name: document.getElementById('name').value,
        type: document.getElementById('type').value,
        regular_price: document.getElementById('regular_price').value,
        description: document.getElementById('description').value,
        short_description: document.getElementById('short_description').value,
        categories: [{ id: parseInt(document.getElementById('categories').value) }],
        // images: [{ src: document.getElementById('images').value }]
    };

    console.log("lista ## 01:", productData);

    try {
        const response = await fetch(apiUrlSender, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const result = await response.json();
        alert('Produto adicionado com sucesso: ' + JSON.stringify(result));
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        alert('Erro ao adicionar produto: ' + error.message);
    }
}

// Função para recuperar produtos
async function getProducts() {
    try {
        const response = await fetch(apiUrl);
        const products = await response.json();

        displayProducts(products);
    } catch (error) {
        console.error('Erro ao recuperar produtos:', error);
        alert('Erro ao recuperar produtos: ' + error.message);
    }
}

// Exibir lista de produtos
function displayProducts(products) {

    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpar lista

    const ul = document.createElement('ul');
    products.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${product.name}</strong> - R$${product.regular_price}<br>${product.description}`;
        ul.appendChild(li);
    });
    productList.appendChild(ul);
}
