let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, title: "Laptop Pro", price: 25000, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqiv3buE786rzCJQd1jIeBs0f5SKc_Yvkd2PfopMRcvQ&s=10", category: "Electronics", description: "High performance laptop" },
    { id: 2, title: "Wireless Mouse", price: 500, image: "https://i02.appmifile.com/854_item_ma/16/07/2025/72660a8c1f730f2b29cbf0d129914dcd.png", category: "Electronics", description: "Ergonomic mouse" },
    { id: 3, title: "Cotton T-Shirt", price: 300, image: "https://activaboualaa.com/cdn/shop/files/www.activaboualaa.comTSSS26-30215.jpg?v=1777295528", category: "Clothing", description: "100% Cotton" }
];
let users = JSON.parse(localStorage.getItem('users')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let totalOrders = JSON.parse(localStorage.getItem('totalOrders')) || 0;

function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('totalOrders', JSON.stringify(totalOrders));
}

function navigate(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    document.getElementById(`view-${viewId}`).classList.remove('d-none');
    if (viewId === 'home') renderFeatured();
    if (viewId === 'products') renderProducts();
    if (viewId === 'cart') renderCart();
    if (viewId === 'admin') renderAdmin();
    updateAuthUI();
}

function updateAuthUI() {
    if (currentUser) {
        document.getElementById('nav-login').classList.add('d-none');
        document.getElementById('nav-logout').classList.remove('d-none');
    } else {
        document.getElementById('nav-login').classList.remove('d-none');
        document.getElementById('nav-logout').classList.add('d-none');
    }
}

function createProductCard(product) {
    return `
        <div class="col-md-3 mb-4">
            <div class="card product-card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text text-muted">${product.category}</p>
                    <p class="card-text fw-bold">$${product.price}</p>
                    <p class="card-text small">${product.description || ''}</p>
                    <button class="btn btn-primary mt-auto" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

function renderFeatured() {
    const container = document.getElementById('featured-products-container');
    container.innerHTML = products.slice(0, 4).map(createProductCard).join('');
}

function renderProducts() {
    const container = document.getElementById('products-container');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const sort = document.getElementById('sortFilter').value;

    let filtered = products.filter(p => p.title.toLowerCase().includes(searchTerm));
    if (category) filtered = filtered.filter(p => p.category === category);

    if (sort === 'priceAsc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'priceDesc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'nameAsc') filtered.sort((a, b) => a.title.localeCompare(b.title));

    container.innerHTML = filtered.map(createProductCard).join('');
}

document.getElementById('searchInput').addEventListener('input', renderProducts);
document.getElementById('categoryFilter').addEventListener('change', renderProducts);
document.getElementById('sortFilter').addEventListener('change', renderProducts);

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveData();
    updateCartCount();
    alert(`${product.title} added to cart`);
}

function updateCartCount() {
    document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
    const tbody = document.getElementById('cart-table-body');
    tbody.innerHTML = '';
    
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        tbody.innerHTML += `
            <tr>
                <td>
                    <img src="${item.image}" alt="${item.title}" style="width:50px; height:50px; object-fit:contain; margin-right:10px;">
                    ${item.title}
                </td>
                <td>$${item.price}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQty(${item.id}, -1)">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQty(${item.id}, 1)">+</button>
                </td>
                <td>$${itemTotal}</td>
                <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">Remove</button></td>
            </tr>
        `;
    });

    const tax = subtotal * 0.10;
    const shipping = subtotal > 0 ? 15 : 0;
    const finalTotal = subtotal + tax + shipping;

    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').innerText = `$${tax.toFixed(2)}`;
    document.getElementById('cart-shipping').innerText = `$${shipping.toFixed(2)}`;
    document.getElementById('cart-final').innerText = `$${finalTotal.toFixed(2)}`;
}

function updateCartQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        saveData();
        renderCart();
        updateCartCount();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveData();
    renderCart();
    updateCartCount();
}

function checkout() {
    if (cart.length === 0) return alert("Cart is empty");
    if (!currentUser) return navigate('auth');
    totalOrders++;
    cart = [];
    saveData();
    updateCartCount();
    navigate('home');
    alert("Order placed successfully!");
}

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (users.find(u => u.email === email)) {
        return alert('Email already registered');
    }
    
    users.push({ id: Date.now(), name, email, password });
    saveData();
    alert('Registration successful! Please login.');
    this.reset();
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        saveData();
        this.reset();
        navigate('home');
    } else {
        alert('Invalid credentials');
    }
});

function logout() {
    currentUser = null;
    saveData();
    navigate('home');
}

function toggleAdminTab(tabId, el) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('d-none'));
    document.getElementById(tabId).classList.remove('d-none');
    document.querySelectorAll('.nav-tabs .nav-link').forEach(l => l.classList.remove('active'));
    el.classList.add('active');
}

function renderAdmin() {
    document.getElementById('stat-products').innerText = products.length;
    document.getElementById('stat-users').innerText = users.length;
    document.getElementById('stat-orders').innerText = totalOrders;

    const pTable = document.getElementById('admin-products-table');
    pTable.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>$${p.price}</td>
            <td>${p.category}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    const uTable = document.getElementById('admin-users-table');
    uTable.innerHTML = users.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editUser(${u.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const title = document.getElementById('prodTitle').value;
    const price = Number(document.getElementById('prodPrice').value);
    const category = document.getElementById('prodCategory').value;
    const image = document.getElementById('prodImage').value || "https://via.placeholder.com/200";

    if (id) {
        const idx = products.findIndex(p => p.id == id);
        products[idx] = { ...products[idx], title, price, category, image };
    } else {
        products.push({ id: Date.now(), title, price, category, image, description: "" });
    }
    
    saveData();
    renderAdmin();
    this.reset();
    document.getElementById('prodId').value = "";
});

function editProduct(id) {
    const p = products.find(x => x.id === id);
    document.getElementById('prodId').value = p.id;
    document.getElementById('prodTitle').value = p.title;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodImage').value = p.image;
}

function deleteProduct(id) {
    if(confirm("Delete product?")) {
        products = products.filter(x => x.id !== id);
        saveData();
        renderAdmin();
    }
}

document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    if (id) {
        const idx = users.findIndex(u => u.id == id);
        users[idx] = { ...users[idx], name, email, password };
    } else {
        if(users.find(u => u.email === email)) return alert("Email exists");
        users.push({ id: Date.now(), name, email, password });
    }
    
    saveData();
    renderAdmin();
    this.reset();
    document.getElementById('userId').value = "";
});

function editUser(id) {
    const u = users.find(x => x.id === id);
    document.getElementById('userId').value = u.id;
    document.getElementById('userName').value = u.name;
    document.getElementById('userEmail').value = u.email;
    document.getElementById('userPassword').value = u.password;
}

function deleteUser(id) {
    if(confirm("Delete user?")) {
        users = users.filter(x => x.id !== id);
        saveData();
        renderAdmin();
    }
}

updateCartCount();
navigate('home');