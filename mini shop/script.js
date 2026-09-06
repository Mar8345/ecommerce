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
                    <h5 class="card-title fw-bold">${product.title}</h5>
                    <p class="card-text text-muted mb-1">${product.category}</p>
                    <p class="card-text fw-bold text-danger fs-5">$${product.price.toLocaleString()}</p>
                    <p class="card-text small text-secondary">${product.description || ''}</p>
                    <button class="btn btn-outline-danger mt-auto fw-bold" onclick="addToCart(${product.id})">Add to Cart</button>
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

    container.innerHTML = filtered.length ? filtered.map(createProductCard).join('') : '<div class="col-12 text-center text-muted"><p>No products found.</p></div>';
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
    alert(`${product.title} added to cart!`);
}

function updateCartCount() {
    document.getElementById('cart-count').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function renderCart() {
    const tbody = document.getElementById('cart-table-body');
    let subtotal = 0;

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Your cart is currently empty.</td></tr>';
    } else {
        tbody.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            return `
                <tr>
                    <td class="d-flex align-items-center">
                        <img src="${item.image}" alt="${item.title}" class="rounded border" style="width:60px; height:60px; object-fit:contain; margin-right:15px; background:#fff;">
                        <span class="fw-bold">${item.title}</span>
                    </td>
                    <td class="align-middle">$${item.price.toLocaleString()}</td>
                    <td class="align-middle">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" onclick="updateCartQty(${item.id}, -1)">-</button>
                            <span class="btn btn-outline-secondary disabled text-dark fw-bold" style="width: 40px; opacity: 1;">${item.quantity}</span>
                            <button class="btn btn-outline-secondary" onclick="updateCartQty(${item.id}, 1)">+</button>
                        </div>
                    </td>
                    <td class="align-middle fw-bold">$${itemTotal.toLocaleString()}</td>
                    <td class="align-middle"><button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
        }).join('');
    }

    const tax = subtotal * 0.10;
    const shipping = subtotal > 0 ? 15 : 0;
    const finalTotal = subtotal + tax + shipping;

    document.getElementById('cart-subtotal').innerText = `$${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('cart-tax').innerText = `$${tax.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('cart-shipping').innerText = `$${shipping.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('cart-final').innerText = `$${finalTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

function updateCartQty(id, change) {
    const itemIndex = cart.findIndex(i => i.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
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
    if (cart.length === 0) return alert("Your cart is empty.");
    if (!currentUser) return navigate('auth');
    totalOrders++;
    cart = [];
    saveData();
    updateCartCount();
    navigate('home');
    alert("Order placed successfully! Thank you for shopping with us.");
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
            <td class="fw-bold">${p.title}</td>
            <td>$${p.price.toLocaleString()}</td>
            <td><span class="badge bg-secondary">${p.category}</span></td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    const uTable = document.getElementById('admin-users-table');
    uTable.innerHTML = users.map(u => `
        <tr>
            <td>${u.id}</td>
            <td class="fw-bold">${u.name}</td>
            <td>${u.email}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editUser(${u.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>
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
        if(idx > -1) products[idx] = { ...products[idx], title, price, category, image };
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
    if (!p) return;
    document.getElementById('prodId').value = p.id;
    document.getElementById('prodTitle').value = p.title;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodImage').value = p.image;
}

function deleteProduct(id) {
    if(confirm("Are you sure you want to delete this product?")) {
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
        if(idx > -1) users[idx] = { ...users[idx], name, email, password };
    } else {
        if(users.find(u => u.email === email)) return alert("Email already exists.");
        users.push({ id: Date.now(), name, email, password });
    }
    
    saveData();
    renderAdmin();
    this.reset();
    document.getElementById('userId').value = "";
});

function editUser(id) {
    const u = users.find(x => x.id === id);
    if (!u) return;
    document.getElementById('userId').value = u.id;
    document.getElementById('userName').value = u.name;
    document.getElementById('userEmail').value = u.email;
    document.getElementById('userPassword').value = u.password;
}

function deleteUser(id) {
    if(confirm("Are you sure you want to delete this user?")) {
        users = users.filter(x => x.id !== id);
        saveData();
        renderAdmin();
    }
}

// Initial Bootload
updateCartCount();
navigate('home');