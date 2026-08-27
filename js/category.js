// ============================================================
// CATEGORY.JS — Filter, sort, search products
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const catId = params.get('cat') || '';
  const query = params.get('q') || '';

  buildHeader(catId);
  buildFooter();
  initCategoryPage(catId, query);
});

let allProducts = [];
let filtered = [];
let sortBy = 'relevance';
let currentPage = 1;
const PER_PAGE = 12;

function initCategoryPage(catId, query) {
  const titleEl = document.getElementById('page-title');
  const cat = CATEGORIES.find(c => c.id === catId);

  if (query) {
    allProducts = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand.toLowerCase().includes(query.toLowerCase())
    );
    if (titleEl) titleEl.textContent = `Results for "${query}"`;
    document.title = `Search: ${query} — Flipkart`;
  } else if (cat) {
    allProducts = PRODUCTS.filter(p => p.category === catId);
    if (titleEl) titleEl.textContent = cat.name;
    document.title = `${cat.name} — Flipkart`;
  } else {
    allProducts = [...PRODUCTS];
    if (titleEl) titleEl.textContent = 'All Products';
    document.title = 'All Products — Flipkart';
  }

  filtered = [...allProducts];
  buildFilters();
  renderProducts();
}

// ── Filters ──
function buildFilters() {
  const sidebar = document.getElementById('filter-sidebar');
  if (!sidebar) return;

  const brands = [...new Set(allProducts.map(p => p.brand))];
  const ratings = [4, 3, 2, 1];

  sidebar.innerHTML = `
    <div class="filter-header">
      <span class="filter-title">Filters</span>
      <button class="filter-clear" id="clear-filters">Clear All</button>
    </div>

    <div class="filter-group">
      <div class="filter-group-title">Price Range</div>
      <div class="price-range-inputs">
        <input type="number" id="price-min" placeholder="Min" min="0" />
        <input type="number" id="price-max" placeholder="Max" />
      </div>
      <button class="price-go-btn" id="apply-price">Apply</button>
    </div>

    <div class="filter-group">
      <div class="filter-group-title">Customer Rating</div>
      ${ratings.map(r => `
        <div class="rating-filter-item" data-rating="${r}">
          <input type="checkbox" id="rating-${r}" value="${r}" />
          <label for="rating-${r}" style="cursor:pointer;display:flex;align-items:center;gap:4px">
            <span class="star-fill">${'★'.repeat(r)}</span> & above
          </label>
        </div>
      `).join('')}
    </div>

    <div class="filter-group">
      <div class="filter-group-title">Brand</div>
      ${brands.map(b => `
        <label class="filter-option">
          <input type="checkbox" class="brand-check" value="${b}" />
          ${b}
        </label>
      `).join('')}
    </div>

    <div class="filter-group">
      <div class="filter-group-title">Availability</div>
      <label class="filter-option">
        <input type="checkbox" id="in-stock" /> In Stock Only
      </label>
    </div>
  `;

  document.getElementById('clear-filters').addEventListener('click', clearFilters);
  document.getElementById('apply-price').addEventListener('click', applyFilters);
  document.querySelectorAll('.brand-check, #in-stock').forEach(el =>
    el.addEventListener('change', applyFilters)
  );
  document.querySelectorAll('.rating-filter-item input').forEach(el =>
    el.addEventListener('change', applyFilters)
  );
}

function applyFilters() {
  const minPrice = +document.getElementById('price-min')?.value || 0;
  const maxPrice = +document.getElementById('price-max')?.value || Infinity;
  const selectedBrands = [...document.querySelectorAll('.brand-check:checked')].map(e => e.value);
  const selectedRatings = [...document.querySelectorAll('.rating-filter-item input:checked')].map(e => +e.value);
  const inStock = document.getElementById('in-stock')?.checked;

  filtered = allProducts.filter(p => {
    if (p.price < minPrice || p.price > maxPrice) return false;
    if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
    if (selectedRatings.length && !selectedRatings.some(r => p.rating >= r)) return false;
    if (inStock && !p.inStock) return false;
    return true;
  });

  currentPage = 1;
  applySort();
  renderProducts();
}

function clearFilters() {
  document.querySelectorAll('.brand-check, .rating-filter-item input, #in-stock').forEach(el => { el.checked = false; });
  const pmin = document.getElementById('price-min');
  const pmax = document.getElementById('price-max');
  if (pmin) pmin.value = '';
  if (pmax) pmax.value = '';
  filtered = [...allProducts];
  currentPage = 1;
  renderProducts();
}

// ── Sort ──
function buildSortBar() {
  const bar = document.getElementById('sort-bar');
  if (!bar) return;

  const options = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'price-asc', label: 'Price — Low to High' },
    { id: 'price-desc', label: 'Price — High to Low' },
    { id: 'rating', label: 'Rating' },
    { id: 'discount', label: 'Discount' },
  ];

  bar.innerHTML = `
    <span class="sort-label">Sort By</span>
    ${options.map(o => `
      <button class="sort-option ${sortBy === o.id ? 'active' : ''}" data-sort="${o.id}">${o.label}</button>
    `).join('')}
  `;

  bar.querySelectorAll('.sort-option').forEach(btn => {
    btn.addEventListener('click', () => {
      sortBy = btn.dataset.sort;
      bar.querySelectorAll('.sort-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applySort();
      renderProducts();
    });
  });
}

function applySort() {
  switch (sortBy) {
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
    case 'discount':
      filtered.sort((a, b) =>
        discount(b.originalPrice, b.price) - discount(a.originalPrice, a.price)
      ); break;
    default: break;
  }
}

// ── Render Products ──
function renderProducts() {
  buildSortBar();

  const grid = document.getElementById('products-grid');
  const resultInfo = document.getElementById('result-info');
  if (!grid) return;

  const start = (currentPage - 1) * PER_PAGE;
  const pageProducts = filtered.slice(start, start + PER_PAGE);

  if (resultInfo) {
    resultInfo.innerHTML = `Showing <strong>${start + 1}–${Math.min(start + pageProducts.length, filtered.length)}</strong> of <strong>${filtered.length}</strong> results`;
  }

  if (pageProducts.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div style="font-size:60px;margin-bottom:16px">😕</div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms</p>
        <button class="btn btn-primary" style="margin-top:16px" onclick="clearFilters()">Clear Filters</button>
      </div>
    `;
    renderPagination();
    return;
  }

  grid.innerHTML = pageProducts.map(p => {
    const disc = discount(p.originalPrice, p.price);
    return `
      <a href="product.html?id=${p.id}" class="cat-product-card">
        ${p.badge ? `<span class="badge" style="display:inline-block;margin-bottom:8px">${p.badge}</span>` : ''}
        <img class="cat-product-img" src="${p.images[0]}" alt="${p.name}" loading="lazy" />
        <div class="cat-product-name">${p.name}</div>
        <div class="cat-product-rating">
          <span class="rating-badge ${ratingClass(p.rating)}">${p.rating} ★</span>
          <span style="font-size:12px;color:#878787;margin-left:6px">(${p.reviews.toLocaleString()})</span>
        </div>
        <div class="price-block">
          <span class="cat-product-price">${formatPrice(p.price)}</span>
          <span class="cat-product-old">${formatPrice(p.originalPrice)}</span>
          <span class="cat-product-discount">${disc}% off</span>
        </div>
      </a>
    `;
  }).join('');

  renderPagination();
}

function renderPagination() {
  const el = document.getElementById('pagination');
  if (!el) return;

  const total = Math.ceil(filtered.length / PER_PAGE);
  if (total <= 1) { el.innerHTML = ''; return; }

  let pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - currentPage) <= 2) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  el.innerHTML = `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} id="page-prev">← Prev</button>
    ${pages.map(p => p === '…'
      ? `<span style="padding:8px 4px;color:#878787">…</span>`
      : `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`
    ).join('')}
    <button class="page-btn" ${currentPage === total ? 'disabled' : ''} id="page-next">Next →</button>
  `;

  el.querySelector('#page-prev')?.addEventListener('click', () => { currentPage--; renderProducts(); window.scrollTo(0,0); });
  el.querySelector('#page-next')?.addEventListener('click', () => { currentPage++; renderProducts(); window.scrollTo(0,0); });
  el.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => { currentPage = +btn.dataset.page; renderProducts(); window.scrollTo(0,0); });
  });
}
