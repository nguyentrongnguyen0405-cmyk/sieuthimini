document.addEventListener('DOMContentLoaded', function() {
    let storeCart = [];
    let selectedCategory = 'all';
    let searchQuery = '';
    let currentDiscount = 0;
    let currentCustomer = null;

    let productsData = [];
    let categoriesData = [];

    // Elements
    const productGrid = document.getElementById('storeProductGrid');
    const categoriesContainer = document.getElementById('storeCategories');
    const searchInput = document.getElementById('storeSearch');
    const cartCount = document.getElementById('storeCartCount');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItems');
    
    // Checkout Elements
    const startCheckoutBtn = document.getElementById('startCheckoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const coPhone = document.getElementById('coPhone');
    let currentPaymentMethod = 'cod';
    const paymentBtns = document.querySelectorAll('.store-payment-btn');
    const qrContainer = document.getElementById('qrContainer');
    const qrImage = document.getElementById('qrImage');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');

    // Init
    loadData();

    async function loadData() {
        try {
            const [prodData, catData] = await Promise.all([
                MiniMart.API.getProducts(),
                MiniMart.API.getCategories()
            ]);

            if (prodData.success) productsData = prodData.data;
            if (catData.success) categoriesData = catData.data;

            renderCategories();
            renderProducts();
        } catch (error) {
            console.error('Error loading data:', error);
            MiniMart.Utils.showToast('Lỗi tải dữ liệu. Vui lòng tải lại trang.', 'error');
        }
    }

    // Event Listeners
    searchInput.addEventListener('input', MiniMart.Utils.debounce((e) => {
        searchQuery = e.target.value.toLowerCase();
        renderProducts();
    }, 200));

    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    startCheckoutBtn.addEventListener('click', () => {
        if (storeCart.length === 0) return;
        checkoutForm.classList.add('active');
        startCheckoutBtn.style.display = 'none';
        
        // Auto check customer on phone blur
        coPhone.addEventListener('blur', checkCustomerTier);
    });

    paymentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentPaymentMethod = btn.dataset.method;
            paymentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (currentPaymentMethod === 'transfer' || currentPaymentMethod === 'momo') {
                generateQRCode();
            } else {
                qrContainer.classList.remove('active');
            }
        });
    });

    confirmOrderBtn.addEventListener('click', processOrder);

    // Functions
    function renderCategories() {
        const categories = categoriesData;
        let html = `<div class="store-category-item ${selectedCategory === 'all' ? 'active' : ''}" data-id="all">
            <span style="font-size: 20px">🛒</span> Tất cả sản phẩm
        </div>`;
        
        categories.forEach(c => {
            html += `<div class="store-category-item ${selectedCategory == c.id ? 'active' : ''}" data-id="${c.id}">
                <span style="font-size: 20px">${c.icon}</span> ${c.name}
            </div>`;
        });
        
        categoriesContainer.innerHTML = html;

        categoriesContainer.querySelectorAll('.store-category-item').forEach(el => {
            el.addEventListener('click', () => {
                selectedCategory = el.dataset.id;
                document.getElementById('currentCategoryTitle').textContent = el.textContent.trim();
                renderCategories(); // update active class
                renderProducts();
            });
        });
    }

    function renderProducts() {
        let products = productsData.filter(p => p.status === 'active' && p.stock_qty > 0);
        
        if (selectedCategory !== 'all') {
            products = products.filter(p => p.category_id == selectedCategory);
        }
        if (searchQuery) {
            products = products.filter(p => p.name.toLowerCase().includes(searchQuery));
        }

        if (products.length === 0) {
            productGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1"><div class="empty-state-icon">🔍</div><div class="empty-state-text">Không tìm thấy sản phẩm</div></div>';
            return;
        }

        productGrid.innerHTML = products.map(p => `
            <div class="store-product">
                <img src="${p.image_url || 'https://placehold.co/200x200?text=SP'}" class="store-product-img" alt="${p.name}">
                <div class="store-product-body">
                    <div class="store-product-title">${p.name}</div>
                    <div class="store-product-price">${MiniMart.Utils.formatCurrency(p.price)}</div>
                    <button class="btn btn-primary store-product-btn" onclick="window.addToStoreCart('${p.id}')">➕ Thêm vào giỏ</button>
                </div>
            </div>
        `).join('');
    }

    window.addToStoreCart = function(productId) {
        const product = productsData.find(p => p.id == productId);
        if (!product) return;

        const existing = storeCart.find(i => i.productId == productId);
        if (existing) {
            if (existing.quantity >= product.stock_qty) {
                MiniMart.Utils.showToast('Vượt quá số lượng tồn kho!', 'error');
                return;
            }
            existing.quantity++;
            existing.subtotal = existing.quantity * parseFloat(product.price);
        } else {
            const priceNum = parseFloat(product.price) || 0;
            storeCart.push({
                productId: product.id,
                name: product.name,
                price: priceNum,
                quantity: 1,
                subtotal: priceNum,
                image: product.image_url
            });
        }

        updateCartUI();
        MiniMart.Utils.showToast('Đã thêm ' + product.name + ' vào giỏ', 'success');
    };

    window.updateStoreCartQty = function(productId, delta) {
        const item = storeCart.find(i => i.productId == productId);
        if (!item) return;
        const product = productsData.find(p => p.id == productId);
        
        item.quantity += delta;
        if (item.quantity <= 0) {
            storeCart = storeCart.filter(i => i.productId != productId);
        } else if (product && item.quantity > product.stock_qty) {
            MiniMart.Utils.showToast('Vượt quá tồn kho!', 'error');
            item.quantity = product.stock_qty;
        }
        
        if (item.quantity > 0) item.subtotal = item.quantity * item.price;
        updateCartUI();
        
        if ((currentPaymentMethod === 'transfer' || currentPaymentMethod === 'momo') && storeCart.length > 0) {
            generateQRCode(); // update qr amount
        }
    };

    window.removeStoreCartItem = function(productId) {
        storeCart = storeCart.filter(i => i.productId != productId);
        updateCartUI();
    };

    function updateCartUI() {
        cartCount.textContent = storeCart.reduce((sum, i) => sum + i.quantity, 0);
        
        if (storeCart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛒</div><div class="empty-state-text">Giỏ hàng trống</div></div>';
            document.getElementById('cartSubtotal').textContent = '0₫';
            document.getElementById('cartTotal').textContent = '0₫';
            document.getElementById('cartDiscountRow').style.display = 'none';
            checkoutForm.classList.remove('active');
            startCheckoutBtn.style.display = 'none';
            return;
        }

        if(!checkoutForm.classList.contains('active')) {
             startCheckoutBtn.style.display = 'block';
        }

        cartItemsContainer.innerHTML = storeCart.map(item => `
            <div class="cart-item">
                <img src="${item.image || 'https://placehold.co/100x100?text=SP'}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${MiniMart.Utils.formatCurrency(item.price)}</div>
                    <div class="cart-item-controls">
                        <div class="cart-qty-ctrl">
                            <button class="cart-qty-btn" onclick="window.updateStoreCartQty('${item.productId}', -1)">−</button>
                            <span style="font-weight:600;min-width:20px;text-align:center">${item.quantity}</span>
                            <button class="cart-qty-btn" onclick="window.updateStoreCartQty('${item.productId}', 1)">+</button>
                        </div>
                        <button class="cart-item-remove" onclick="window.removeStoreCartItem('${item.productId}')">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');

        const subtotal = storeCart.reduce((sum, i) => sum + i.subtotal, 0);
        document.getElementById('cartSubtotal').textContent = MiniMart.Utils.formatCurrency(subtotal);

        // Giả sử logic chiết khấu theo hạng khách hàng (Tạm thời = 0 nếu backend chưa hỗ trợ trả về Tier qua phone)
        // Hiện tại chỉ check VIP đơn giản trên UI (Cần thêm endpoint check customer public)
        let discountPercent = 0;
        if (currentCustomer) {
            if (currentCustomer.tier === 'vip') discountPercent = 10;
            else if (currentCustomer.tier === 'gold') discountPercent = 5;
            else if (currentCustomer.tier === 'silver') discountPercent = 2;
        }

        const discountAmount = Math.round(subtotal * discountPercent / 100);
        const total = subtotal - discountAmount;

        if (discountAmount > 0) {
            document.getElementById('cartDiscountRow').style.display = 'flex';
            document.getElementById('cartDiscountAmount').textContent = '-' + MiniMart.Utils.formatCurrency(discountAmount);
        } else {
            document.getElementById('cartDiscountRow').style.display = 'none';
        }

        document.getElementById('cartTotal').textContent = MiniMart.Utils.formatCurrency(total);
        currentDiscount = discountAmount;
    }

    async function checkCustomerTier() {
        const phone = coPhone.value.trim();
        if (!phone) {
            currentCustomer = null;
            updateCartUI();
            return;
        }

        // Tạm thời chưa có API public để check KH, nên bỏ qua phần tính điểm
        currentCustomer = null;
        updateCartUI();
    }

    function generateQRCode() {
        const subtotal = storeCart.reduce((sum, i) => sum + i.subtotal, 0);
        const total = subtotal - currentDiscount;
        if (total <= 0) return;

        const orderId = 'ONL-' + Math.floor(1000 + Math.random() * 9000);
        
        const bankId = '970422'; // MBBank BIN
        const accountNo = '0123456789';
        const template = 'compact2'; // VietQR compact2
        const amount = total;
        const description = 'Thanh toan don ' + orderId;
        const accountName = 'MINIMART STORE';

        const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
        
        qrImage.src = qrUrl;
        qrContainer.classList.add('active');
        qrContainer.dataset.orderId = orderId;
    }

    async function processOrder() {
        const name = document.getElementById('coName').value.trim();
        const phone = coPhone.value.trim();
        const address = document.getElementById('coAddress').value.trim();
        const method = currentPaymentMethod;

        if (!name || !phone) {
            MiniMart.Utils.showToast('Vui lòng nhập Họ tên và Số điện thoại', 'error');
            return;
        }

        confirmOrderBtn.disabled = true;
        confirmOrderBtn.innerHTML = 'Đang xử lý...';

        const subtotal = storeCart.reduce((sum, i) => sum + i.subtotal, 0);
        const total = subtotal - currentDiscount;

        const payload = {
            items: storeCart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal: subtotal,
            discount: currentDiscount,
            total: total,
            paymentMethod: method === 'transfer' ? 'transfer' : 'cash',
            customerName: name,
            shippingPhone: phone,
            shippingAddress: address
        };

        try {
            const data = await MiniMart.API.placeOrder(payload);

            if (!data.success) {
                throw new Error(data.message || 'Lỗi đặt hàng');
            }

            const orderId = data.order_id || 'ONL-' + Math.floor(1000 + Math.random() * 9000);

            MiniMart.Utils.showModal(`
                <div class='modal-header'>
                    <h3 style="color:var(--success)">🎉 Đặt hàng thành công!</h3>
                    <button class='modal-close' onclick='MiniMart.Utils.closeModal()'>✕</button>
                </div>
                <div class='modal-body' style="text-align:center; padding: 40px 20px;">
                    <div style="font-size: 60px; margin-bottom: 16px;">🛍️</div>
                    <h2 style="margin-bottom: 8px;">Cảm ơn bạn, ${name}!</h2>
                    <p style="color:var(--text-secondary); margin-bottom: 24px;">Đơn hàng <strong>${orderId}</strong> của bạn đã được ghi nhận.</p>
                    ${method === 'cod' 
                        ? '<p>Chúng tôi sẽ giao hàng đến địa chỉ của bạn sớm nhất và thu tiền mặt (COD).</p>' 
                        : '<p style="color:var(--success); font-weight:600;">Hệ thống đã xác nhận thanh toán chuyển khoản thành công.</p>'}
                </div>
                <div class='modal-footer' style="justify-content:center">
                    <button class='btn btn-primary btn-lg' onclick='MiniMart.Utils.closeModal()'>Tiếp tục mua sắm</button>
                </div>
            `);

            // Reset giỏ hàng
            storeCart = [];
            currentCustomer = null;
            coPhone.value = '';
            document.getElementById('coName').value = '';
            document.getElementById('coAddress').value = '';
            currentPaymentMethod = 'cod';
            paymentBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('.store-payment-btn[data-method="cod"]').classList.add('active');
            qrContainer.classList.remove('active');
            
            updateCartUI();
            closeCart();
            
            // Reload sản phẩm để lấy lại số lượng kho mới nhất
            loadData();

        } catch (error) {
            MiniMart.Utils.showToast(error.message, 'error');
            console.error(error);
        } finally {
            confirmOrderBtn.disabled = false;
            confirmOrderBtn.innerHTML = '✅ Xác nhận đặt hàng';
        }
    }

    function openCart() {
        cartOverlay.classList.add('active');
        cartDrawer.classList.add('active');
    }

    function closeCart() {
        cartOverlay.classList.remove('active');
        cartDrawer.classList.remove('active');
    }
});
