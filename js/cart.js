// ============================================================
// CART.JS — localStorage cart management
// ============================================================

const Cart = (() => {
  const KEY = 'fk_cart';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateBadge();
  }

  function addItem(product, qty = 1) {
    const items = getAll();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx > -1) {
      items[idx].qty = Math.min(items[idx].qty + qty, 10);
    } else {
      items.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        qty,
        category: product.category,
      });
    }
    save(items);
    showToast(`✔ ${product.name.slice(0,30)}... added to cart`, 'success');
    return items;
  }

  function removeItem(id) {
    const items = getAll().filter(i => i.id !== id);
    save(items);
    return items;
  }

  function updateQty(id, qty) {
    const items = getAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx > -1) {
      if (qty < 1) { return removeItem(id); }
      items[idx].qty = Math.min(qty, 10);
      save(items);
    }
    return items;
  }

  function clearCart() {
    localStorage.removeItem(KEY);
    updateBadge();
  }

  function getCount() {
    return getAll().reduce((s, i) => s + i.qty, 0);
  }

  function getTotal() {
    return getAll().reduce((s, i) => s + i.price * i.qty, 0);
  }

  function getOriginalTotal() {
    return getAll().reduce((s, i) => s + i.originalPrice * i.qty, 0);
  }

  function updateBadge() {
    const count = getCount();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  return { getAll, addItem, removeItem, updateQty, clearCart, getCount, getTotal, getOriginalTotal, updateBadge };
})();

// ── Toast helper ──
function showToast(msg, type = '') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Format currency ──
function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

// ── Discount % ──
function discount(original, current) {
  return Math.round(((original - current) / original) * 100);
}

// ── Rating color class ──
function ratingClass(r) {
  if (r >= 4) return 'high';
  if (r >= 3) return 'mid';
  return 'low';
}

// ── Star string ──
function stars(r) {
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  let s = '★'.repeat(full);
  if (half) s += '½';
  return s;
}

// Initialize badge on every page load
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());
