// ============================================================
// HEADER.JS — Shared header logic (search, nav, categories)
// ============================================================

function buildHeader(activeCat = '') {
  const header = document.getElementById('main-header');
  if (!header) return;

  header.innerHTML = `
    <div class="header-inner">
      <a href="index.html" class="logo">
        <span class="logo-text">Flip<span>kart</span></span>
        <span class="logo-tagline">Explore <b>Plus</b></span>
      </a>

      <div class="search-wrapper">
        <div class="search-bar">
          <input type="text" id="search-input" placeholder="Search for products, brands and more" autocomplete="off" />
          <button class="search-btn" id="search-btn" title="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
        </div>
        <div class="search-suggestions" id="search-suggestions"></div>
      </div>

      <nav class="nav-actions">
        <div class="nav-dropdown">
          <a href="auth.html" class="nav-btn" id="login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            <span class="nav-btn-label" id="header-username">Login</span>
          </a>
          <div class="dropdown-menu">
            <div class="dropdown-header">
              <strong id="dropdown-name">Hello, Guest</strong>
              <p>Manage your account</p>
            </div>
            <div class="dropdown-body">
              <a href="auth.html">My Profile</a>
              <a href="#">Flipkart Plus Zone</a>
              <a href="#">Orders</a>
              <a href="#">Wishlist</a>
              <a href="#" id="logout-link" style="display:none">Logout</a>
            </div>
          </div>
        </div>

        <a href="cart.html" class="nav-btn" style="position:relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.17 5l.94 2H20l-1.68 9H8.4L5.17 5H2V3H4.58l.59 2z"/></svg>
          <span class="nav-btn-label">Cart</span>
          <span class="cart-count" style="display:none">0</span>
        </a>

        <a href="#" class="nav-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
          <span class="nav-btn-label">More</span>
        </a>
      </nav>
    </div>

    <div class="header-categories">
      <ul class="categories-list">
        ${CATEGORIES.map(c => `
          <li><a href="category.html?cat=${c.id}" class="cat-link ${activeCat === c.id ? 'active' : ''}">
            ${c.icon} ${c.name}
          </a></li>
        `).join('')}
      </ul>
    </div>
  `;

  initSearch();
  initAuthState();
}

// ── Search ──
function initSearch() {
  const input = document.getElementById('search-input');
  const suggestions = document.getElementById('search-suggestions');
  const btn = document.getElementById('search-btn');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { suggestions.classList.remove('show'); return; }

    const matches = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 8);

    suggestions.innerHTML = matches.length
      ? matches.map(p => `
          <div class="suggestion-item" data-id="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <span>${highlight(p.name, q)} <small style="color:#999">in ${p.category}</small></span>
          </div>
        `).join('')
      : '<div class="suggestion-item">No results found</div>';

    suggestions.classList.add('show');

    suggestions.querySelectorAll('.suggestion-item[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        window.location.href = `product.html?id=${el.dataset.id}`;
      });
    });
  });

  function doSearch() {
    const q = input.value.trim();
    if (q) window.location.href = `category.html?q=${encodeURIComponent(q)}`;
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrapper')) suggestions.classList.remove('show');
  });
}

function highlight(text, q) {
  const re = new RegExp(`(${q})`, 'gi');
  return text.replace(re, '<strong>$1</strong>');
}

// ── Auth state ──
function initAuthState() {
  const user = JSON.parse(localStorage.getItem('fk_user') || 'null');
  const usernameEl = document.getElementById('header-username');
  const dropdownName = document.getElementById('dropdown-name');
  const logoutLink = document.getElementById('logout-link');

  if (user) {
    if (usernameEl) usernameEl.textContent = user.name.split(' ')[0];
    if (dropdownName) dropdownName.textContent = `Hello, ${user.name}`;
    if (logoutLink) {
      logoutLink.style.display = 'flex';
      logoutLink.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('fk_user');
        showToast('Logged out successfully');
        location.reload();
      });
    }
  }
}
