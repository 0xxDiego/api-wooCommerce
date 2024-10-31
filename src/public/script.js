// public/script.js

const apiUrl = 'http://localhost:3000/api/wc/products';
const apiUrlOrders = 'http://localhost:3000/api/wc/orders';
const apiUrlCustomers = 'http://localhost:3000/api/wc/customers';

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

// Função para recuperar pedidos
async function getOrders() {
    try {
        const response = await fetch(apiUrlOrders);
        const orders = await response.json();

        displayOrders(orders);
    } catch (error) {
        console.error('Erro ao recuperar pedidos:', error);
        alert('Erro ao recuperar pedidos: ' + error.message);
    }
}

// Função para recuperar clientes
async function getCustomers() {
    try {
        const response = await fetch(apiUrlCustomers);
        const customers = await response.json();

        displayCustomers(customers);
    } catch (error) {
        console.error('Erro ao recuperar clientes:', error);
        alert('Erro ao recuperar clientes: ' + error.message);
    }
}

// Exibir lista de produtos
function displayProducts(products) {

    const productList = document.getElementById('productListProducts');
    productList.innerHTML = ''; // Limpar lista

    const ul = document.createElement('ul');
    products.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${product.name}</strong> - R$${product.regular_price}<br>${product.description}`;
        ul.appendChild(li);
    });
    productList.appendChild(ul);
}

// Função para exibir a lista de pedidos
function displayOrders(orders) {
    const ordersList = document.getElementById('productListOrders');
    ordersList.innerHTML = ''; // Limpar lista

    const ul = document.createElement('ul');

    // Verifica se a lista de pedidos está vazia
    if (orders.length === 0) {
        ordersList.innerHTML = 'Nenhum pedido encontrado.';
        return;
    }

    // Percorre a lista de pedidos e cria elementos para exibição
    orders.forEach(order => {
        const li = document.createElement('li');
        
        // Adiciona informações do pedido
        li.innerHTML = `
            <strong>Pedido ID:</strong> ${order.id} <br>
            <strong>Total:</strong> R$${order.total} <br>
            <strong>Status:</strong> ${order.status} <br>
            <strong>Data:</strong> ${new Date(order.date_created).toLocaleDateString()} <br>
            <strong>Cliente:</strong> ${order.billing.first_name} ${order.billing.last_name}
        `;
        
        ul.appendChild(li);
    });

    ordersList.appendChild(ul);
}

// Função para exibir a lista de clientes
function displayCustomers(customers) {
    const customersList = document.getElementById('productListCustomers');
    customersList.innerHTML = ''; // Limpar lista

    const ul = document.createElement('ul');

    console.log("lista check:!!!!!!", customers)
    // Verifica se a lista de clientes está vazia
    if (customers.length === 0) {
        customersList.innerHTML = 'Nenhum cliente encontrado.';
        return;
    }

    // Percorre a lista de clientes e cria elementos para exibição
    customers.forEach(customer => {
        const li = document.createElement('li');
        
        // Adiciona informações do cliente
        li.innerHTML = `
            <strong>ID:</strong> ${customer.id} <br>
            <strong>Nome:</strong> ${customer.first_name} ${customer.last_name} <br>
            <strong>Email:</strong> ${customer.email} <br>
            <strong>Data de Cadastro:</strong> ${new Date(customer.date_created).toLocaleDateString()}
        `;
        
        ul.appendChild(li);
    });

    customersList.appendChild(ul);
}

function showTab(tabId) {
    // Esconde todos os conteúdos das abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    // Remove a classe 'active' de todos os botões
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    // Exibe o conteúdo da aba selecionada e adiciona 'active' ao botão
    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// Exibe a aba WooCommerce por padrão
document.addEventListener('DOMContentLoaded', () => {
    showTab('woocommerce');
});
