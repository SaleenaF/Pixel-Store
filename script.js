// Global variables
let currentUser = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    
    checkLoginStatus();
    setupPage();
    setupEventListeners();
});

function setupPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop();
    
    if (page === "index.html" || page === "") {
        // Setup category navigation for index page
        document.querySelectorAll('.category').forEach(category => {
            category.addEventListener('click', (e) => {
                const categoryName = e.currentTarget.getAttribute('data-category');
                window.location.href = `${categoryName}.html`;
            });
        });
    } else {
        // Load products for category pages
        const category = page.replace('.html', '');
        loadProducts(category);
    }
}

function loadProducts(category) {
    fetch('backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=get_products&category=${category}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.products) {
            displayProducts(data.products);
        } else {
            console.error('Failed to load products:', data.message);
            // Display error message to user
            const container = document.getElementById('productsContainer');
            if (container) {
                container.innerHTML = '<p>Failed to load products. Please try again later.</p>';
            }
        }
    })
    .catch(error => {
        console.error('Error loading products:', error);
        const container = document.getElementById('productsContainer');
        if (container) {
            container.innerHTML = '<p>Error loading products. Please check your connection.</p>';
        }
    });
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found in this category.</p>';
        return;
    }
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        `;
        
        container.appendChild(productElement);
    });
}

function updateHeader(user) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userGreeting = document.getElementById('userGreeting');
    
    if (!loginBtn || !registerBtn) return;
    
    if (user) {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        
        if (!userGreeting) {
            const greeting = document.createElement('span');
            greeting.id = 'userGreeting';
            greeting.textContent = `Hi, ${user.firstName}!`;
            greeting.style.marginRight = '10px';
            registerBtn.parentNode.insertBefore(greeting, registerBtn);
            
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'white-button';
            logoutBtn.textContent = 'Logout';
            logoutBtn.id = 'logoutBtn';
            registerBtn.parentNode.insertBefore(logoutBtn, registerBtn.nextSibling);
        }
    } else {
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        if (userGreeting) {
            userGreeting.remove();
            document.getElementById('logoutBtn')?.remove();
        }
    }
}

function updateCartModal() {
    fetch('backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=get_cart'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const cartItemsElement = document.getElementById('cartItems');
            const cartTotalElement = document.getElementById('cartTotal');
            const checkoutBtn = document.getElementById('checkoutBtn');
            
            if (!cartItemsElement || !cartTotalElement || !checkoutBtn) return;
            
            cartItemsElement.innerHTML = '';
            
            if (data.cartItems.length === 0) {
                cartItemsElement.innerHTML = '<p>Your cart is empty</p>';
                cartTotalElement.textContent = 'Subtotal: $0.00';
                checkoutBtn.style.display = 'none';
                document.getElementById('cartTax')?.remove();
                document.getElementById('cartGrandTotal')?.remove();
                return;
            }
            
            checkoutBtn.style.display = 'block';
            checkoutBtn.style.margin = '1rem auto 0';
            
            let subtotal = 0;
            
            data.cartItems.forEach(item => {
                subtotal += item.price * item.quantity;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                    </div>
                    <div class="cart-item-total">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button class="remove-item" data-id="${item.id}">×</button>
                `;
                cartItemsElement.appendChild(cartItem);
            });
            
            const tax = subtotal * 0.13;
            const total = subtotal + tax;
            
            cartTotalElement.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
            
            let taxElement = document.getElementById('cartTax');
            if (!taxElement) {
                taxElement = document.createElement('div');
                taxElement.id = 'cartTax';
                cartTotalElement.insertAdjacentElement('afterend', taxElement);
            }
            taxElement.textContent = `Tax (13%): $${tax.toFixed(2)}`;
            
            let totalElement = document.getElementById('cartGrandTotal');
            if (!totalElement) {
                totalElement = document.createElement('div');
                totalElement.id = 'cartGrandTotal';
                totalElement.className = 'cart-total';
                taxElement.insertAdjacentElement('afterend', totalElement);
            }
            totalElement.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
        } else if (data.requiresLogin) {
            hideModal('cartModal');
            showModal('loginModal');
        }
    })
    .catch(error => {
        console.error('Error fetching cart:', error);
        alert('Failed to load cart. Please try again.');
    });
}

function setupEventListeners() {
    // Modal toggles
    document.getElementById('loginBtn')?.addEventListener('click', () => showModal('loginModal'));
    document.getElementById('registerBtn')?.addEventListener('click', () => showModal('registerModal'));
    document.getElementById('cartBtn')?.addEventListener('click', () => {
        updateCartModal();
        showModal('cartModal');
    });
    
    // Modal navigation
    document.getElementById('showRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('loginModal');
        showModal('registerModal');
    });
    
    document.getElementById('showLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('registerModal');
        showModal('loginModal');
    });
    
    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            hideModal(closeBtn.closest('.modal').id);
        });
    });
    
    // Modal background click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target.id);
        }
    });
    
    // Form submissions
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    
    // Checkout button
    document.getElementById('checkoutBtn')?.addEventListener('click', handleCheckout);
    
    // Event delegation for dynamic elements
    document.addEventListener('click', function(e) {
        // Add to cart buttons
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        }
        
        // Remove from cart buttons
        if (e.target.classList.contains('remove-item')) {
            const productId = e.target.getAttribute('data-id');
            removeFromCart(productId);
        }
        
        // Logout button (added dynamically)
        if (e.target.id === 'logoutBtn') {
            handleLogout();
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        void modal.offsetWidth;
        modal.classList.add('active');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

function addToCart(productId) {
    fetch('backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=add_to_cart&productId=${productId}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            document.getElementById('cartCount').textContent = data.cartCount;
            document.getElementById('cartCount').style.display = 'inline-block';
            
            // Show feedback message
            const feedback = document.createElement('div');
            feedback.className = 'cart-feedback';
            feedback.textContent = 'Added to cart!';
            document.body.appendChild(feedback);
            
            setTimeout(() => {
                feedback.classList.add('fade-out');
                setTimeout(() => feedback.remove(), 500);
            }, 1000);
            
            // Update cart modal if open
            if (document.getElementById('cartModal').style.display === 'block') {
                updateCartModal();
            }
        } else if (data.requiresLogin) {
            showModal('loginModal');
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    });
}

function removeFromCart(productId) {
    fetch('backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=remove_from_cart&productId=${productId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartModal();
            document.getElementById('cartCount').textContent = data.cartCount;
            if (data.cartCount == 0) {
                document.getElementById('cartCount').style.display = 'none';
            }
        }
    })
    .catch(error => {
        console.error('Error removing from cart:', error);
        alert('Failed to remove item from cart. Please try again.');
    });
}

function handleRegister(e) {
    e.preventDefault();
    
    // Get all form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;

    // Validate all fields are filled
    if (!firstName || !lastName || !email || !address || !phone || !password) {
        alert('All fields are required');
        return;
    }

    // Create form data object
    const formData = new URLSearchParams();
    formData.append('action', 'register');
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('password', password);

    fetch('backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            updateHeader(currentUser);
            hideModal('registerModal');
            document.getElementById('registerForm').reset();
            document.getElementById('cartCount').textContent = data.cartCount || 0;
            if (data.cartCount > 0) {
                document.getElementById('cartCount').style.display = 'inline-block';
            }
            alert('Registration successful! You are now logged in.');
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during registration');
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validate inputs
    if (!email || !password) {
        alert('Email and password are required');
        return;
    }

    // Create form data
    const formData = new URLSearchParams();
    formData.append('action', 'login');
    formData.append('email', email);
    formData.append('password', password);

    fetch('backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            updateHeader(currentUser);
            hideModal('loginModal');
            document.getElementById('loginForm').reset();
            document.getElementById('cartCount').textContent = data.cartCount || 0;
            if (data.cartCount > 0) {
                document.getElementById('cartCount').style.display = 'inline-block';
            }
            alert('Login successful!');
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during login');
    });
}

function handleLogout() {
    fetch('backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=logout'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUser = null;
            updateHeader(null);
            document.getElementById('cartCount').textContent = '0';
            document.getElementById('cartCount').style.display = 'none';
            alert('You have been logged out.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during logout');
    });
}

function handleCheckout() {
    fetch('backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=checkout'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('cartCount').textContent = '0';
            document.getElementById('cartCount').style.display = 'none';
            hideModal('cartModal');
            alert(`Order #${data.order.id} placed successfully!\nTotal: $${data.order.total.toFixed(2)}\nThank you for your purchase!`);
        } else {
            alert(data.message);
            if (data.requiresLogin) {
                showModal('loginModal');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during checkout');
    });
}

function checkLoginStatus() {
    fetch('backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=check_login'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.user) {
            currentUser = data.user;
            updateHeader(currentUser);
            document.getElementById('cartCount').textContent = data.cartCount || 0;
            if (data.cartCount > 0) {
                document.getElementById('cartCount').style.display = 'inline-block';
            } else {
                document.getElementById('cartCount').style.display = 'none';
            }
        }
    })
    .catch(error => {
        console.error('Error checking login status:', error);
    });
}