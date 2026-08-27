// ============================================================
// PRODUCT.JS — Product detail page
// ============================================================

// Shared footer builder (also in home.js for home page)
function buildFooter() {
  const el = document.getElementById('main-footer');
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="footer-top">
        <div class="footer-col">
          <h4>About</h4>
          <ul><li><a href="#">About Us</a></li><li><a href="#">Careers</a></li><li><a href="#">Press</a></li></ul>
        </div>
        <div class="footer-col">
          <h4>Help</h4>
          <ul><li><a href="#">Payments</a></li><li><a href="#">Shipping</a></li><li><a href="#">Returns</a></li></ul>
        </div>
        <div class="footer-col">
          <h4>Policy</h4>
          <ul><li><a href="#">Return Policy</a></li><li><a href="#">Terms Of Use</a></li><li><a href="#">Privacy</a></li></ul>
        </div>
        <div class="footer-col">
          <h4>Social</h4>
          <ul><li><a href="#">Facebook</a></li><li><a href="#">Twitter</a></li><li><a href="#">YouTube</a></li></ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-logo">Flip<span>kart</span></div>
        <p class="footer-copy">© 2024 Flipkart Clone. Built for demo purposes only.</p>
        <div style="display:flex;gap:16px;align-items:center;">
          <span style="color:#666;font-size:12px">🔒 Secure Payments</span>
          <span style="color:#666;font-size:12px">🚚 Free Delivery</span>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const rawId  = params.get('id');
  const id     = rawId ? parseInt(rawId, 10) : NaN;
  const product = isNaN(id) ? null : PRODUCTS.find(p => p.id === id);

  buildHeader(product ? product.category : '');
  buildFooter();

  if (!product) {
    // Show the first available product as a suggestion instead of dead-end
    document.getElementById('product-content').innerHTML = `
      <div style="text-align:center;padding:80px;background:white;border-radius:4px;box-shadow:var(--card-shadow)">
        <div style="font-size:64px;margin-bottom:16px">😕</div>
        <h2 style="font-size:22px;margin-bottom:8px">Product not found</h2>
        <p style="color:#878787;margin-bottom:24px">The product you're looking for doesn't exist or has been removed.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="index.html" class="btn btn-primary btn-lg">🏠 Go Home</a>
          <a href="category.html" class="btn btn-outline btn-lg">Browse All Products</a>
        </div>
        <div style="margin-top:32px">
          <p style="color:#878787;font-size:13px;margin-bottom:16px">Browse popular products:</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
            ${PRODUCTS.slice(0,4).map(p => `
              <a href="product.html?id=${p.id}" style="text-decoration:none;color:inherit;border:1px solid #e0e0e0;border-radius:8px;padding:12px;min-width:130px;text-align:center">
                <img src="${p.images[0]}" style="width:80px;height:80px;object-fit:contain;display:block;margin:0 auto 8px"
                     onerror="this.src='https://picsum.photos/seed/fb${p.id}/80/80'" />
                <div style="font-size:12px;font-weight:500;color:#333">${p.name.slice(0,25)}...</div>
                <div style="font-size:13px;font-weight:700;color:#212121;margin-top:4px">${formatPrice(p.price)}</div>
              </a>
            `).join('')}
          </div>
        </div>
      </div>`;
    return;
  }

  document.title = `${product.name} — Flipkart`;
  const bcEl = document.getElementById('breadcrumb-name');
  if (bcEl) bcEl.textContent = product.name.slice(0, 40);
  buildProductPage(product);
  buildRelated(product);
});


function buildProductPage(p) {
  const container = document.getElementById('product-content');
  if (!container) return;

  const disc = discount(p.originalPrice, p.price);
  const isWishlisted = JSON.parse(localStorage.getItem('fk_wishlist') || '[]').includes(p.id);

  container.innerHTML = `
    <div class="product-layout">
      <!-- Gallery -->
      <div class="product-gallery">
        <div class="gallery-main" id="gallery-main">
          <img src="${p.images[0]}" alt="${p.name}" id="main-img" />
        </div>
        <div class="gallery-thumbs" id="gallery-thumbs">
          ${p.images.map((img, i) => `
            <div class="thumb ${i===0?'active':''}" data-img="${img}" data-idx="${i}">
              <img src="${img}" alt="View ${i+1}" />
            </div>
          `).join('')}
        </div>
        <div class="gallery-actions">
          <button class="btn btn-accent" id="add-to-cart-btn">
            🛒 Add to Cart
          </button>
          <button class="btn btn-primary" id="buy-now-btn">
            ⚡ Buy Now
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="product-info">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
          <div>
            <div class="product-brand">${p.brand}</div>
            <h1 class="product-name">${p.name}</h1>
          </div>
          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" id="wishlist-btn" title="Add to wishlist">
            ${isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>

        <div class="product-rating-row">
          <span class="rating-badge ${ratingClass(p.rating)}">${p.rating} ★</span>
          <span class="review-count">${p.reviews.toLocaleString()} Ratings & Reviews</span>
          ${p.badge ? `<span class="badge badge-blue">${p.badge}</span>` : ''}
        </div>

        <hr class="product-divider" />

        <div class="product-price-block">
          <div class="price-block">
            <span class="price-current">${formatPrice(p.price)}</span>
            <span class="price-original">${formatPrice(p.originalPrice)}</span>
            <span class="price-discount">${disc}% off</span>
          </div>
          <div style="font-size:13px;color:#388e3c;margin-top:6px;font-weight:500">
            + ₹0 Delivery ${p.price > 500 ? '<span style="color:#878787">(Free)</span>' : ''}
          </div>
        </div>

        <hr class="product-divider" />

        <!-- Offers -->
        <div class="offers-section">
          <div class="offers-title">Available Offers</div>
          <div class="offer-item">
            <span class="offer-tag">Bank</span>
            <span class="offer-text">10% off on HDFC Bank Credit Cards, up to ₹1500. On orders of ₹5000 and above</span>
          </div>
          <div class="offer-item">
            <span class="offer-tag">Special</span>
            <span class="offer-text">No Cost EMI on Bajaj Finserv EMI Card on cart value above ₹4999</span>
          </div>
          <div class="offer-item">
            <span class="offer-tag bank">Exchange</span>
            <span class="offer-text">Get up to ₹15,000 off on exchange of your old product</span>
          </div>
        </div>

        <hr class="product-divider" />

        <!-- Highlights -->
        <div class="highlights-section">
          <div class="highlights-title">Highlights</div>
          <ul class="highlights-list">
            ${p.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <hr class="product-divider" />

        <!-- Delivery -->
        <div class="delivery-section">
          <div class="delivery-title">Delivery</div>
          <div class="delivery-check">
            <input type="text" id="pincode-input" placeholder="Enter delivery pincode" maxlength="6" />
            <button class="btn btn-outline" id="check-pin-btn">Check</button>
          </div>
          <div class="delivery-result" id="delivery-result"></div>
        </div>

        <hr class="product-divider" />

        <!-- Specs -->
        <div class="specs-section">
          <div class="specs-title">Specifications</div>
          <table class="specs-table">
            ${Object.entries(p.specs).map(([k, v]) => `
              <tr><td>${k}</td><td>${v}</td></tr>
            `).join('')}
          </table>
        </div>

        <!-- Description -->
        <hr class="product-divider" />
        <div>
          <div class="specs-title">Description</div>
          <p style="font-size:14px;color:#555;line-height:1.7;margin-top:10px">${p.description}</p>
        </div>
      </div>
    </div>
  `;

  initGallery(p);
  initProductActions(p);
  buildReviews(p);
}

function initGallery(p) {
  const thumbs = document.querySelectorAll('.thumb');
  const mainImg = document.getElementById('main-img');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = thumb.dataset.img;
        mainImg.style.opacity = '1';
      }, 150);
    });
  });

  if (mainImg) {
    mainImg.style.transition = 'opacity 0.15s ease';
  }
}

function initProductActions(p) {
  // Add to cart
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    Cart.addItem(p);
    // Ripple effect
    const btn = document.getElementById('add-to-cart-btn');
    btn.textContent = '✔ Added to Cart!';
    btn.style.background = '#388e3c';
    setTimeout(() => {
      btn.textContent = '🛒 Add to Cart';
      btn.style.background = '';
    }, 2000);
  });

  // Buy Now
  document.getElementById('buy-now-btn')?.addEventListener('click', () => {
    Cart.addItem(p);
    window.location.href = 'cart.html';
  });

  // Wishlist
  document.getElementById('wishlist-btn')?.addEventListener('click', function() {
    const wishlist = JSON.parse(localStorage.getItem('fk_wishlist') || '[]');
    const idx = wishlist.indexOf(p.id);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      this.innerHTML = '🤍';
      this.classList.remove('active');
      showToast('Removed from wishlist');
    } else {
      wishlist.push(p.id);
      this.innerHTML = '❤️';
      this.classList.add('active');
      showToast('Added to wishlist ❤️', 'success');
    }
    localStorage.setItem('fk_wishlist', JSON.stringify(wishlist));
  });

  // Pincode check
  document.getElementById('check-pin-btn')?.addEventListener('click', () => {
    const pin = document.getElementById('pincode-input').value.trim();
    const result = document.getElementById('delivery-result');
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      result.textContent = `✔ Delivery available to ${pin} — Expected by ${getDeliveryDate()}`;
      result.classList.add('show');
    } else {
      result.textContent = '⚠ Enter a valid 6-digit pincode';
      result.style.color = 'var(--red)';
      result.classList.add('show');
    }
  });
}

function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
}

// ── Reviews ──
const MOCK_REVIEWS = [
  { name: 'Rahul M', rating: 5, title: 'Excellent product!', body: 'Absolutely love it. The quality exceeded my expectations. Would definitely recommend to anyone looking for this kind of product.', date: '2 days ago' },
  { name: 'Priya S', rating: 4, title: 'Great value for money', body: 'Good product overall. Delivery was fast and packaging was secure. Minor issues but nothing major.', date: '1 week ago' },
  { name: 'Amit K', rating: 5, title: 'Perfect!', body: 'Exactly as described. Very happy with my purchase. The build quality is premium and it works flawlessly.', date: '2 weeks ago' },
  { name: 'Sneha R', rating: 3, title: 'Decent but could be better', body: 'It is okay for the price. Some features feel lacking compared to competitors but overall usable.', date: '1 month ago' },
];

function buildReviews(p) {
  const el = document.getElementById('reviews-section');
  if (!el) return;

  const ratingDist = { 5: 45, 4: 30, 3: 15, 2: 7, 1: 3 };

  el.innerHTML = `
    <div class="section-header">
      <span class="section-title">Ratings & Reviews</span>
    </div>
    <div class="review-summary">
      <div class="review-score-big">
        <div class="score-number">${p.rating}</div>
        <div class="score-stars">${'★'.repeat(Math.floor(p.rating))}</div>
        <div class="score-total">${(p.reviews/1000).toFixed(1)}K Ratings</div>
      </div>
      <div class="rating-bars">
        ${[5,4,3,2,1].map(r => `
          <div class="rating-bar-row">
            <span class="bar-label">${r} ★</span>
            <div class="bar-track"><div class="bar-fill" style="width:${ratingDist[r]}%"></div></div>
            <span class="bar-count">${ratingDist[r]}%</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="review-cards">
      ${MOCK_REVIEWS.map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="reviewer-avatar">${r.name[0]}</div>
            <div>
              <div class="reviewer-name">${r.name}</div>
              <div class="review-date">${r.date}</div>
            </div>
            <span class="rating-badge ${ratingClass(r.rating)}" style="margin-left:auto">${r.rating} ★</span>
          </div>
          <div class="review-title">${r.title}</div>
          <div class="review-body">${r.body}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Related Products ──
function buildRelated(p) {
  const el = document.getElementById('related-section');
  if (!el) return;

  const related = PRODUCTS
    .filter(prod => prod.category === p.category && prod.id !== p.id)
    .slice(0, 6);

  if (!related.length) return;

  el.innerHTML = `
    <div class="section-header">
      <span class="section-title">Similar Products</span>
      <a href="category.html?cat=${p.category}" class="section-link">View All →</a>
    </div>
    <div class="products-scroll">
      ${related.map(rp => {
        const disc = discount(rp.originalPrice, rp.price);
        return `
          <a href="product.html?id=${rp.id}" class="product-card card" style="cursor:pointer;text-decoration:none;color:inherit">
            <img class="product-card-img" src="${rp.images[0]}" alt="${rp.name}" loading="lazy" />
            <div class="product-card-name">${rp.name}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <span class="rating-badge ${ratingClass(rp.rating)}">${rp.rating} ★</span>
            </div>
            <span class="price-current">${formatPrice(rp.price)}</span>
            <span class="product-card-discount">${disc}% off</span>
          </a>
        `;
      }).join('')}
    </div>
  `;
}
