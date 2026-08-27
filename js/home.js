// ============================================================
// HOME.JS — Home page: slider, categories, deals timer, products
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Only run home-specific code when on the home page
  if (document.getElementById('hero-slider')) {
    buildSlider();
    buildCategories();
    buildDeals();
    buildFeaturedGrid();
  }
  buildHeader();
  buildFooter();
});

// ── Hero Slider ──
const BANNERS = [
  { src: 'assets/banner1.png', alt: 'Electronics Sale', link: 'category.html?cat=electronics' },
  { src: 'assets/banner2.png', alt: 'Fashion Week',     link: 'category.html?cat=fashion' },
  { src: 'assets/banner3.png', alt: 'Home & Kitchen',  link: 'category.html?cat=home' },
];

function buildSlider() {
  const section = document.getElementById('hero-slider');
  if (!section) return;

  section.innerHTML = `
    <div class="slider-track" id="slider-track">
      ${BANNERS.map((b, i) => `
        <div class="slide">
          <a href="${b.link}">
            <img src="${b.src}" alt="${b.alt}" loading="${i === 0 ? 'eager' : 'lazy'}"
                 onerror="this.style.display='none'" />
          </a>
        </div>
      `).join('')}
    </div>
    <button class="slider-btn slider-prev" id="slider-prev">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <button class="slider-btn slider-next" id="slider-next">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
    </button>
    <div class="slider-dots" id="slider-dots">
      ${BANNERS.map((_, i) => `<div class="slider-dot ${i===0?'active':''}" data-i="${i}"></div>`).join('')}
    </div>
  `;

  let current = 0;
  const track = document.getElementById('slider-track');
  const dots = document.querySelectorAll('.slider-dot');

  function goTo(idx) {
    current = (idx + BANNERS.length) % BANNERS.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  document.getElementById('slider-prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('slider-next').addEventListener('click', () => goTo(current + 1));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.i)));

  let auto = setInterval(() => goTo(current + 1), 4000);
  section.addEventListener('mouseenter', () => clearInterval(auto));
  section.addEventListener('mouseleave', () => { auto = setInterval(() => goTo(current + 1), 4000); });
}

// ── Categories ──
function buildCategories() {
  const el = document.getElementById('categories-grid');
  if (!el) return;
  el.innerHTML = CATEGORIES.map(c => `
    <a href="category.html?cat=${c.id}" class="category-item">
      <div class="cat-icon" style="background:${c.color}22; color:${c.color}">
        ${c.icon}
      </div>
      <span class="cat-name">${c.name}</span>
    </a>
  `).join('');
}

// ── Deals Section + Timer ──
function buildDeals() {
  const el = document.getElementById('deals-section');
  if (!el) return;

  let endTime = localStorage.getItem('fk_deal_end');
  if (!endTime || Date.now() > +endTime) {
    endTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('fk_deal_end', endTime);
  }

  const dealProducts = PRODUCTS.filter(p => p.category === 'electronics').slice(0, 6);

  el.innerHTML = `
    <div class="deals-header">
      <span class="deals-title">🔥 Deal of the Day</span>
      <div class="timer" id="deal-timer">
        <span class="timer-label">Ends in</span>
        <span class="time-block" id="t-h">00</span>
        <span class="timer-sep">:</span>
        <span class="time-block" id="t-m">00</span>
        <span class="timer-sep">:</span>
        <span class="time-block" id="t-s">00</span>
      </div>
      <a href="category.html?cat=electronics" class="section-link">View All</a>
    </div>
    <div class="products-scroll">
      ${dealProducts.map(p => productCardHTML(p)).join('')}
    </div>
  `;

  // Timer
  function updateTimer() {
    const remaining = Math.max(0, endTime - Date.now());
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    const th = document.getElementById('t-h');
    const tm = document.getElementById('t-m');
    const ts = document.getElementById('t-s');
    if (th) th.textContent = pad(h);
    if (tm) tm.textContent = pad(m);
    if (ts) ts.textContent = pad(s);
  }
  updateTimer();
  setInterval(updateTimer, 1000);
}

// ── Featured Grid ──
function buildFeaturedGrid() {
  const el = document.getElementById('featured-grid');
  if (!el) return;

  // Show a mix of all categories
  const featured = PRODUCTS.slice(0, 10);

  el.innerHTML = `
    <div class="section-header">
      <span class="section-title">🛍 Top Products</span>
      <a href="category.html" class="section-link">View All →</a>
    </div>
    <div class="products-grid">
      ${featured.map(p => productCardHTML(p, 'grid')).join('')}
    </div>
  `;
}

// ── Product Card HTML — uses <a> tag, NO JS click handlers needed ──
function productCardHTML(p, mode = 'scroll') {
  const disc = discount(p.originalPrice, p.price);
  return `
    <a href="product.html?id=${p.id}" class="product-card card" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      <img class="product-card-img"
           src="${p.images[0]}"
           alt="${p.name}"
           loading="lazy"
           onerror="this.src='https://picsum.photos/seed/fallback${p.id}/400/400'" />
      <div class="product-card-name">${p.name}</div>
      <div class="price-block" style="margin-bottom:4px">
        <span class="price-current">${formatPrice(p.price)}</span>
      </div>
      <span class="product-card-discount">${disc}% off</span>
    </a>
  `;
}

// ── Footer ──
function buildFooter() {
  const el = document.getElementById('main-footer');
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="footer-top">
        <div class="footer-col">
          <h4>About</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Flipkart Stories</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Help</h4>
          <ul>
            <li><a href="#">Payments</a></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Cancellation & Returns</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Policy</h4>
          <ul>
            <li><a href="#">Return Policy</a></li>
            <li><a href="#">Terms Of Use</a></li>
            <li><a href="#">Security</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Social</h4>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">YouTube</a></li>
            <li><a href="#">Instagram</a></li>
          </ul>
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
