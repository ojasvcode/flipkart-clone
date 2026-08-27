// ============================================================
// CART PAGE JS
// ============================================================

function buildFooter() {
  const el = document.getElementById('main-footer');
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="footer-top">
        <div class="footer-col"><h4>About</h4><ul><li><a href="#">About Us</a></li><li><a href="#">Careers</a></li></ul></div>
        <div class="footer-col"><h4>Help</h4><ul><li><a href="#">Payments</a></li><li><a href="#">Shipping</a></li></ul></div>
        <div class="footer-col"><h4>Policy</h4><ul><li><a href="#">Return Policy</a></li><li><a href="#">Privacy</a></li></ul></div>
        <div class="footer-col"><h4>Social</h4><ul><li><a href="#">Facebook</a></li><li><a href="#">Twitter</a></li></ul></div>
      </div>
      <div class="footer-bottom">
        <div class="footer-logo">Flip<span>kart</span></div>
        <p class="footer-copy">© 2024 Flipkart Clone.</p>
        <span style="color:#666;font-size:12px">🔒 Secure Payments &nbsp; 🚚 Free Delivery</span>
      </div>
    </div>
  `;
}


document.addEventListener('DOMContentLoaded', () => {
  buildHeader();
  buildFooter();
  renderCartPage();
});

function renderCartPage() {
  const items = Cart.getAll();
  const container = document.getElementById('cart-content');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h2>Your cart is empty!</h2>
          <p>Add items to it now</p>
          <a href="index.html" class="btn btn-primary btn-lg">Shop Now</a>
        </div>
      </div>
    `;
    const summaryEl = document.getElementById('price-summary');
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  // Cart items
  container.innerHTML = `
    <div class="cart-items-section card">
      <div class="cart-section-header">My Cart (${items.reduce((s,i)=>s+i.qty,0)} items)</div>

      <div class="address-bar">
        📍 Deliver to: <strong>New Delhi, 110001</strong>
        <span class="change-link">Change</span>
      </div>

      <div class="select-all-bar">
        <input type="checkbox" id="select-all" checked />
        <label for="select-all">Select All (${items.length} items)</label>
      </div>

      <div id="cart-items-list">
        ${items.map(item => cartItemHTML(item)).join('')}
      </div>

      <div style="padding:16px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end">
        <button class="btn btn-accent btn-lg" id="place-order-btn" style="min-width:200px">
          Place Order →
        </button>
      </div>
    </div>
  `;

  buildPriceSummary(items);
  attachCartEvents();
}

function cartItemHTML(item) {
  const disc = discount(item.originalPrice, item.price);
  return `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}"
           onclick="window.location.href='product.html?id=${item.id}'" />
      <div class="cart-item-body">
        <div class="cart-item-name" onclick="window.location.href='product.html?id=${item.id}'">${item.name}</div>
        <div class="cart-item-seller">Seller: <span>RetailNet</span> ⭐ 4.5</div>
        <div class="qty-controls">
          <button class="qty-btn qty-dec" data-id="${item.id}" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
          <div class="qty-value">${item.qty}</div>
          <button class="qty-btn qty-inc" data-id="${item.id}" ${item.qty >= 10 ? 'disabled' : ''}>+</button>
        </div>
        <div class="cart-item-actions">
          <button class="cart-action-btn save-for-later" data-id="${item.id}">
            💾 Save for Later
          </button>
          <button class="cart-action-btn delete" data-id="${item.id}">
            🗑 Remove
          </button>
        </div>
      </div>
      <div class="cart-item-price">
        <div class="price-current">${formatPrice(item.price * item.qty)}</div>
        ${item.qty > 1 ? `<div style="font-size:12px;color:#878787">${formatPrice(item.price)} each</div>` : ''}
        <div style="font-size:13px;color:#388e3c;font-weight:600">${disc}% off</div>
        <div class="cart-delivery">FREE Delivery</div>
      </div>
    </div>
  `;
}

function buildPriceSummary(items) {
  const el = document.getElementById('price-summary');
  if (!el) return;

  const total = Cart.getTotal();
  const original = Cart.getOriginalTotal();
  const saved = original - total;
  const count = items.reduce((s,i) => s + i.qty, 0);

  el.innerHTML = `
    <div class="price-summary-header">Price Details</div>
    <div class="price-summary-body">
      <div class="price-row">
        <span>Price (${count} item${count !== 1 ? 's' : ''})</span>
        <span>${formatPrice(original)}</span>
      </div>
      <div class="price-row saving-row">
        <span>Discount</span>
        <span class="discount-amount">− ${formatPrice(saved)}</span>
      </div>
      <div class="price-row">
        <span>Delivery Charges</span>
        <span style="color:#388e3c;font-weight:600">FREE</span>
      </div>
      <div class="price-row">
        <span>Secured Packaging Fee</span>
        <span>₹99</span>
      </div>
      <div class="price-row total">
        <span>Total Amount</span>
        <span>${formatPrice(total + 99)}</span>
      </div>
    </div>
    <div class="total-saving">
      🎉 You will save ${formatPrice(saved)} on this order
    </div>
    <button class="checkout-btn" id="checkout-btn">PLACE ORDER</button>
    <div class="safe-checkout">
      🔒 Safe and Secure Payments. Easy returns. 100% Authentic products.
    </div>
  `;

  document.getElementById('checkout-btn')?.addEventListener('click', handleCheckout);
}

function attachCartEvents() {
  // Remove
  document.querySelectorAll('.cart-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', () => {
      Cart.removeItem(+btn.dataset.id);
      showToast('Item removed from cart');
      renderCartPage();
    });
  });

  // Save for later (mock)
  document.querySelectorAll('.save-for-later').forEach(btn => {
    btn.addEventListener('click', () => {
      Cart.removeItem(+btn.dataset.id);
      showToast('Item saved for later');
      renderCartPage();
    });
  });

  // Quantity
  document.querySelectorAll('.qty-dec').forEach(btn => {
    btn.addEventListener('click', () => {
      const items = Cart.getAll();
      const item = items.find(i => i.id === +btn.dataset.id);
      if (!item) return;
      Cart.updateQty(item.id, item.qty - 1);
      renderCartPage();
    });
  });

  document.querySelectorAll('.qty-inc').forEach(btn => {
    btn.addEventListener('click', () => {
      const items = Cart.getAll();
      const item = items.find(i => i.id === +btn.dataset.id);
      if (!item) return;
      Cart.updateQty(item.id, item.qty + 1);
      renderCartPage();
    });
  });

  // Place order button in items section
  document.getElementById('place-order-btn')?.addEventListener('click', handleCheckout);
}

function handleCheckout() {
  const user = JSON.parse(localStorage.getItem('fk_user') || 'null');
  if (!user) {
    showToast('Please login to continue', 'error');
    setTimeout(() => window.location.href = 'auth.html', 1500);
    return;
  }

  // Mock order success
  Cart.clearCart();
  const main = document.getElementById('cart-content');
  const summary = document.getElementById('price-summary');
  if (summary) summary.style.display = 'none';
  if (main) main.innerHTML = `
    <div class="card" style="text-align:center;padding:60px 30px">
      <div style="font-size:80px;margin-bottom:20px">🎉</div>
      <h2 style="font-size:24px;font-weight:700;margin-bottom:12px;color:#388e3c">Order Placed Successfully!</h2>
      <p style="color:#878787;margin-bottom:8px">Thank you for your order, ${user.name}!</p>
      <p style="color:#878787;margin-bottom:24px">Your order will be delivered by ${getDeliveryDate()}</p>
      <a href="index.html" class="btn btn-primary btn-lg">Continue Shopping</a>
    </div>
  `;
  Cart.updateBadge();
}

function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
}
