// public/script.js

const apiUrl = 'http://localhost:3000/api/wc/products';
const apiUrlOrders = 'http://localhost:3000/api/wc/orders';
const apiUrlCustomers = 'http://localhost:3000/api/wc/customers';

const apiUrlSender = 'http://localhost:3000/api/products';

const woocommerceAPI = {
    // url: "https://yourstore.com/wp-json/wc/v3/",
    url: "http://localhost:3000/api/wc",
    consumerKey: "ck_e5e9c43a271b894e294b6f1e0acac6e4aa3a8a0a",
    consumerSecret: "cs_ecedc90c6bacce5bf709843ecfbe12cef3f4a2d8"
};

// Carregar dados de produtos, pedidos, e clientes de arquivos CSV e XLSX
document.getElementById('csvFileInputProducts').addEventListener('change', event => handleCSVFile(event, 'products'));
document.getElementById('xlsxFileInputProducts').addEventListener('change', event => handleXLSXFile(event, 'productsXLSX'));

document.getElementById('csvFileInputOrders').addEventListener('change', event => handleCSVFile(event, 'orders'));
document.getElementById('xlsxFileInputOrders').addEventListener('change', event => handleXLSXFile(event, 'ordersXLSX'));

document.getElementById('csvFileInputCustomers').addEventListener('change', event => handleCSVFile(event, 'customers'));
document.getElementById('xlsxFileInputCustomers').addEventListener('change', event => handleXLSXFile(event, 'customersXLSX'));

let loadedProducts = [];
let loadedOrders = [];
let loadedCustomers = [];

async function saveProductsToWooCommerce() {
    for (const product of loadedProducts) {
        await sendToWooCommerce('product', product);
    }
    alert("Produtos salvos no WooCommerce!");
}

// Função para salvar pedidos no WooCommerce
async function saveOrdersToWooCommerce() {
    for (const order of loadedOrders) {
        await sendToWooCommerce('order', order);
    }
    alert("Pedidos salvos no WooCommerce!");
}

// Função para salvar clientes no WooCommerce
async function saveCustomersToWooCommerce() {
    for (const customer of loadedCustomers) {
        await sendToWooCommerce('customer', customer);
    }
    alert("Clientes salvos no WooCommerce!");
}

// Função genérica para enviar dados ao WooCommerce
/*async function sendToWooCommerce(type, data) {

    // console.log("teeeeeeeeeste produtos ### 01", data);

    const url = `http://localhost:3000/api/wc/${type}s`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            console.log(`${type} salvo com sucesso no WooCommerce.`);
        } else {
            console.error(`Erro ao salvar ${type}:`, await response.json());
        }
    } catch (error) {
        console.error(`Erro ao salvar ${type} no WooCommerce:`, error);
    }
}*/

async function sendToWooCommerce(product) {
    const apiUrl = 'http://localhost:3000/api/wc/products'; // URL da API para produtos

    const productData = {
        name: product.name || "Nome do Produto",
        type: product.type || "simple", // Certifique-se de que o tipo é válido
        regular_price: product.price || "0.00",
        categories: [
            {
                id: 12 // Exemplo: ID de uma categoria existente
            },
            {
                id: 15 // Outro ID de categoria, se necessário
            }
        ],
        // Adicione outros campos conforme necessário
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao enviar para WooCommerce:", errorData);
        } else {
            const result = await response.json();
            console.log("Produto enviado com sucesso:", result);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

// Funções para leitura de arquivos CSV e XLSX e envio ao WooCommerce
function handleCSVFile(event, type) {
    const file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            complete: function(results) {
                processData(results.data, type);
            }
        });
    }
}

function handleXLSXFile(event, type) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            processData(jsonData, type);
        };
        reader.readAsArrayBuffer(file);
    }
}

// Função para mostrar a aba de upload correspondente
function showUploadTab(tab) {
    const tabs = document.querySelectorAll('.upload-tab-content');
    tabs.forEach(t => t.style.display = 'none'); // Esconder todas as abas de upload
    document.getElementById('upload' + capitalizeFirstLetter(tab)).style.display = 'block'; // Mostrar a aba selecionada
}

// Função para capitalizar a primeira letra
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Inicializa mostrando a aba de upload de produtos
showUploadTab('products');

// Função para enviar dados à API do WooCommerce
async function sendToWooCommerce(type, data) {
    const url = '/api/wc';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type, data })
        });

        const result = await response.json();
        console.log(`Enviado para WooCommerce (${type})`, result);
    } catch (error) {
        console.error(`Erro ao enviar para WooCommerce (${type})`, error);
    }
}

// Função para processar e mostrar dados de produtos do CSV/XLSX
function showProducts(products) {
    
    loadedProducts = products;  // Armazena os dados carregados

    const productsListDiv = document.getElementById('productList'); // Obtém a referência ao elemento de lista de produtos
    productsListDiv.innerHTML = ''; // Limpa qualquer conteúdo anterior

    products.forEach(product => {
        const productData = {
            name: product.name,
            type: product.type || "simple",
            description: product.description,
            short_description: product.short_description || "",
            categories: Array.isArray(product.categories) ? product.categories.map(cat => cat.id).join(', ') : "Sem categoria",
            images: Array.isArray(product.images) ? product.images.map(img => img.src).join(', ') : "Sem imagem"
        };

        // Cria um elemento para mostrar os dados do produto
        const productItem = document.createElement('div');
        productItem.className = 'product-item'; // Adiciona uma classe para estilização
        productItem.innerHTML = `
            <h3>Produto: ${productData.name}</h3>
            <p><strong>Tipo:</strong> ${productData.type}</p>
            <p><strong>Descrição:</strong> ${productData.description}</p>
            <p><strong>Descrição Curta:</strong> ${productData.short_description}</p>
            <p><strong>Categorias ID:</strong> ${productData.categories}</p>
            <p><strong>Imagens:</strong> ${productData.images}</p>
        `;

        // Adiciona o elemento do produto à lista de produtos
        productsListDiv.appendChild(productItem);
    });
}

// Função para processar e mostrar dados de pedidos do CSV/XLSX
function showOrders(orders) {
    loadedOrders = orders;  // Armazena os dados carregados
    
    const ordersListDiv = document.getElementById('ordersList'); // Obtém a referência ao elemento de lista de pedidos
    ordersListDiv.innerHTML = ''; // Limpa qualquer conteúdo anterior

    orders.forEach(order => {
        const orderData = {
            billing: order.billing,
            shipping: order.shipping,
            line_items: Array.isArray(order.line_items) ? order.line_items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            })) : []
        };

        // Cria um elemento para mostrar os dados do pedido
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item'; // Adiciona uma classe para estilização
        orderItem.innerHTML = `
            <h3>Pedido</h3>
            <p><strong>Billing:</strong> ${JSON.stringify(orderData.billing)}</p>
            <p><strong>Shipping:</strong> ${JSON.stringify(orderData.shipping)}</p>
            <p><strong>Itens do Pedido:</strong> ${orderData.line_items.map(item => 
                `<div>Produto ID: ${item.product_id}, Quantidade: ${item.quantity}</div>`
            ).join('')}</p>
        `;

        // Adiciona o elemento do pedido à lista de pedidos
        ordersListDiv.appendChild(orderItem);
    });
}

// Função para exibir dados de clientes
function showCustomers(customers) {
    loadedCustomers = customers;  // Armazena os dados carregados
    
    const customersListDiv = document.getElementById('customersList'); // Obtém a referência ao elemento de lista de clientes
    customersListDiv.innerHTML = ''; // Limpa qualquer conteúdo anterior

    customers.forEach(customer => {
        // Verifica se as propriedades necessárias existem no objeto de cliente
        const customerData = {
            email: customer.email || "",
            first_name: customer.first_name || "",
            last_name: customer.last_name || "",
            username: customer.username || customer.email || "",
            billing: customer.billing || {},
            shipping: customer.shipping || {}
        };

        // Cria um elemento para mostrar os dados do cliente
        const customerItem = document.createElement('div');
        customerItem.className = 'customer-item'; // Adiciona uma classe para estilização
        customerItem.innerHTML = `
            <h3>Cliente</h3>
            <p><strong>Email:</strong> ${customerData.email}</p>
            <p><strong>Nome:</strong> ${customerData.first_name} ${customerData.last_name}</p>
            <p><strong>Usuário:</strong> ${customerData.username}</p>
            <p><strong>Informações de Cobrança:</strong> ${JSON.stringify(customerData.billing)}</p>
            <p><strong>Informações de Envio:</strong> ${JSON.stringify(customerData.shipping)}</p>
        `;
        customersListDiv.appendChild(customerItem);
    });
}

// Função para exibir dados de produtos
function showProductsXLSX(products) {
    loadedProducts = products;  // Armazena os dados carregados

    const productsListDiv = document.getElementById('productList'); // Obtém a referência ao elemento de lista de produtos
    productsListDiv.innerHTML = ''; // Limpa qualquer conteúdo anterior

    // Verifica se products é um array e não está vazio
    if (Array.isArray(products) && products.length > 0) {
        products.forEach(product => {
            // Verifica se cada campo está definido
            const productData = {
                name: product[0] || "N/A",               // Nome do produto
                type: product[1] || "simple",            // Tipo do produto
                description: product[2] || "N/A",        // Descrição do produto
                short_description: product[3] || "N/A",  // Descrição curta do produto
                categories: product[4] || [],            // Categorias do produto
                images: product[5] || []                  // Imagens do produto
            };

            // Cria um elemento para mostrar os dados do produto
            const productItem = document.createElement('div');
            productItem.className = 'product-item'; // Adiciona uma classe para estilização
            productItem.innerHTML = `
                <h3>${productData.name}</h3>
                <p><strong>Tipo:</strong> ${productData.type}</p>
                <p><strong>Descrição:</strong> ${productData.description}</p>
                <p><strong>Descrição Curta:</strong> ${productData.short_description}</p>
                <p><strong>Categorias:</strong> ${Array.isArray(productData.categories) && productData.categories.length > 0 
                    ? productData.categories.join(', ') 
                    : 'Nenhuma categoria encontrada.'}
                </p>
                <p><strong>Imagens:</strong> ${Array.isArray(productData.images) && productData.images.length > 0 
                    ? productData.images.map(image => `<img src="${image.src}" alt="${productData.name}" style="max-width: 100px;">`).join('') 
                    : 'Nenhuma imagem encontrada.'}
                </p>
            `;
            productsListDiv.appendChild(productItem);
        });
    } else {
        productsListDiv.innerHTML = '<p>Nenhum produto encontrado.</p>';
    }
}

// Função para exibir dados de pedidos
function showOrdersXLSX(orders) {
    loadedOrders = orders;  // Armazena os dados carregados

    const ordersListDiv = document.getElementById('ordersList'); // Obtém a referência ao elemento de lista de pedidos
    ordersListDiv.innerHTML = ''; // Limpa qualquer conteúdo anterior

    // Verifica se orders é um array e não está vazio
    if (Array.isArray(orders) && orders.length > 0) {
        orders.forEach(order => {
            // Verifica se cada campo está definido
            const orderData = {
                billing: order[0] || "N/A",  // Informações de cobrança
                shipping: order[1] || "N/A", // Informações de envio
                line_items: order[2] || []   // Itens do pedido
            };

            // Cria um elemento para mostrar os dados do pedido
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item'; // Adiciona uma classe para estilização
            orderItem.innerHTML = `
                <h3>Pedido</h3>
                <p><strong>Informações de Cobrança:</strong> ${JSON.stringify(orderData.billing)}</p>
                <p><strong>Informações de Envio:</strong> ${JSON.stringify(orderData.shipping)}</p>
                <p><strong>Itens do Pedido:</strong> ${Array.isArray(orderData.line_items) && orderData.line_items.length > 0 
                    ? orderData.line_items.map(item => `<div>Produto ID: ${item.product_id}, Quantidade: ${item.quantity}</div>`).join('') 
                    : 'Nenhum item encontrado.'}
                </p>
            `;
            ordersListDiv.appendChild(orderItem);
        });
    } else {
        ordersListDiv.innerHTML = '<p>Nenhum pedido encontrado.</p>';
    }
}

// Função para exibir dados de clientes com a estrutura correta de parâmetros
function showCustomersXLSX(customers) {
    loadedCustomers = customers;  // Armazena os dados carregados

    const customersListDiv = document.getElementById('customersList'); // Obtém a referência ao elemento de lista de clientes
    customersListDiv.innerHTML = ''; // Limpa qualquer conteúdo anterior

    // Verifica se customers é um array e não está vazio
    if (Array.isArray(customers) && customers.length > 0) {
        customers.forEach(customer => {
            // Verifica se cada campo está definido e exibe a estrutura correta
            const customerData = {
                email: customer[0] || "N/A",
                first_name: customer[1] || "N/A",
                last_name: customer[2] || "N/A",
                username: customer[3] || "N/A",
                billing: {
                    first_name: customer[4]?.first_name || "N/A",
                    last_name: customer[4]?.last_name || "N/A",
                    address_1: customer[4]?.address_1 || "N/A",
                    address_2: customer[4]?.address_2 || "N/A",
                    city: customer[4]?.city || "N/A",
                    state: customer[4]?.state || "N/A",
                    postcode: customer[4]?.postcode || "N/A",
                    country: customer[4]?.country || "N/A",
                    email: customer[4]?.email || "N/A",
                    phone: customer[4]?.phone || "N/A"
                },
                shipping: {
                    first_name: customer[5]?.first_name || "N/A",
                    last_name: customer[5]?.last_name || "N/A",
                    address_1: customer[5]?.address_1 || "N/A",
                    address_2: customer[5]?.address_2 || "N/A",
                    city: customer[5]?.city || "N/A",
                    state: customer[5]?.state || "N/A",
                    postcode: customer[5]?.postcode || "N/A",
                    country: customer[5]?.country || "N/A"
                }
            };

            // Cria um elemento para mostrar os dados do cliente
            const customerItem = document.createElement('div');
            customerItem.className = 'customer-item'; // Adiciona uma classe para estilização
            customerItem.innerHTML = `
                <h3>Cliente</h3>
                <p><strong>Email:</strong> ${customerData.email}</p>
                <p><strong>Nome:</strong> ${customerData.first_name} ${customerData.last_name}</p>
                <p><strong>Usuário:</strong> ${customerData.username}</p>
                <p><strong>Informações de Cobrança:</strong></p>
                <ul>
                    <li><strong>Primeiro Nome:</strong> ${customerData.billing.first_name}</li>
                    <li><strong>Sobrenome:</strong> ${customerData.billing.last_name}</li>
                    <li><strong>Endereço 1:</strong> ${customerData.billing.address_1}</li>
                    <li><strong>Endereço 2:</strong> ${customerData.billing.address_2}</li>
                    <li><strong>Cidade:</strong> ${customerData.billing.city}</li>
                    <li><strong>Estado:</strong> ${customerData.billing.state}</li>
                    <li><strong>CEP:</strong> ${customerData.billing.postcode}</li>
                    <li><strong>País:</strong> ${customerData.billing.country}</li>
                    <li><strong>Email:</strong> ${customerData.billing.email}</li>
                    <li><strong>Telefone:</strong> ${customerData.billing.phone}</li>
                </ul>
                <p><strong>Informações de Envio:</strong></p>
                <ul>
                    <li><strong>Primeiro Nome:</strong> ${customerData.shipping.first_name}</li>
                    <li><strong>Sobrenome:</strong> ${customerData.shipping.last_name}</li>
                    <li><strong>Endereço 1:</strong> ${customerData.shipping.address_1}</li>
                    <li><strong>Endereço 2:</strong> ${customerData.shipping.address_2}</li>
                    <li><strong>Cidade:</strong> ${customerData.shipping.city}</li>
                    <li><strong>Estado:</strong> ${customerData.shipping.state}</li>
                    <li><strong>CEP:</strong> ${customerData.shipping.postcode}</li>
                    <li><strong>País:</strong> ${customerData.shipping.country}</li>
                </ul>
            `;
            customersListDiv.appendChild(customerItem);
        });
    } else {
        customersListDiv.innerHTML = '<p>Nenhum cliente encontrado.</p>';
    }
}

// Processa e direciona os dados para o endpoint correto
function processData(data, type) {
    switch(type) {
        case 'products':
            showProducts(data);
            break;
        case 'productsXLSX':
            showProductsXLSX(data);
            break;
        case 'orders':
            showOrders(data);
            break;
        case 'ordersXLSX':
            showOrdersXLSX(data);
            break;
        case 'customers':
            showCustomers(data);
            break;
        case 'customersXLSX':
            showCustomersXLSX(data);
            break;
        default:
            console.error("Tipo desconhecido");
    }
}

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
