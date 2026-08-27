// ============================================================
// AUTH.JS — Login/signup flow
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initAuthPage();
});

function initAuthPage() {
  // Tab switching
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  loginTab?.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab?.classList.remove('active');
    loginForm?.classList.remove('hidden');
    signupForm?.classList.add('hidden');
  });

  signupTab?.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab?.classList.remove('active');
    signupForm?.classList.remove('hidden');
    loginForm?.classList.add('hidden');
  });

  // Login
  document.getElementById('login-submit')?.addEventListener('click', handleLogin);
  document.getElementById('login-mobile')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });

  // Signup
  document.getElementById('signup-submit')?.addEventListener('click', handleSignup);

  // Password toggle
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        this.textContent = '🙈';
      } else {
        input.type = 'password';
        this.textContent = '👁';
      }
    });
  });

  // OTP step
  initOTPInputs();

  // Check already logged in
  const user = JSON.parse(localStorage.getItem('fk_user') || 'null');
  if (user) {
    showSuccess(user.name);
  }
}

// ── Login ──
function handleLogin() {
  const mobile = document.getElementById('login-mobile')?.value.trim();
  const password = document.getElementById('login-password')?.value.trim();
  const mobileErr = document.getElementById('mobile-error');
  const passErr = document.getElementById('pass-error');

  let valid = true;

  if (!mobile || mobile.length < 10) {
    if (mobileErr) { mobileErr.textContent = 'Enter a valid mobile number or email'; mobileErr.classList.add('show'); }
    valid = false;
  } else {
    mobileErr?.classList.remove('show');
  }

  if (!password || password.length < 6) {
    if (passErr) { passErr.textContent = 'Password must be at least 6 characters'; passErr.classList.add('show'); }
    valid = false;
  } else {
    passErr?.classList.remove('show');
  }

  if (!valid) return;

  // Mock login success
  const name = mobile.includes('@') ? mobile.split('@')[0] : `User${mobile.slice(-4)}`;
  const user = { name, mobile, loggedAt: Date.now() };
  localStorage.setItem('fk_user', JSON.stringify(user));
  showSuccess(name);
}

// ── Signup ──
function handleSignup() {
  const name = document.getElementById('signup-name')?.value.trim();
  const mobile = document.getElementById('signup-mobile')?.value.trim();
  const email = document.getElementById('signup-email')?.value.trim();
  const password = document.getElementById('signup-password')?.value.trim();
  const nameErr = document.getElementById('name-error');
  const smobileErr = document.getElementById('smobile-error');
  const emailErr = document.getElementById('email-error');
  const spassErr = document.getElementById('spass-error');

  let valid = true;

  if (!name || name.length < 2) {
    if (nameErr) { nameErr.textContent = 'Please enter your full name'; nameErr.classList.add('show'); }
    valid = false;
  } else { nameErr?.classList.remove('show'); }

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    if (smobileErr) { smobileErr.textContent = 'Enter a valid 10-digit mobile number'; smobileErr.classList.add('show'); }
    valid = false;
  } else { smobileErr?.classList.remove('show'); }

  if (!email || !email.includes('@')) {
    if (emailErr) { emailErr.textContent = 'Enter a valid email address'; emailErr.classList.add('show'); }
    valid = false;
  } else { emailErr?.classList.remove('show'); }

  if (!password || password.length < 6) {
    if (spassErr) { spassErr.textContent = 'Password must be at least 6 characters'; spassErr.classList.add('show'); }
    valid = false;
  } else { spassErr?.classList.remove('show'); }

  if (!valid) return;

  // Show OTP step
  document.getElementById('signup-step1')?.classList.add('hidden');
  document.getElementById('otp-step')?.classList.remove('hidden');
  document.getElementById('otp-mobile-display').textContent = mobile;

  // Mock OTP auto-fill after 2 seconds
  setTimeout(() => {
    const inputs = document.querySelectorAll('.otp-digit');
    const mockOTP = '123456';
    inputs.forEach((input, i) => { input.value = mockOTP[i]; });
    showToast('OTP sent to +91 ' + mobile, 'success');
  }, 2000);

  document.getElementById('verify-otp-btn')?.addEventListener('click', () => {
    const otp = [...document.querySelectorAll('.otp-digit')].map(i => i.value).join('');
    if (otp.length === 6) {
      const user = { name, mobile, email, loggedAt: Date.now() };
      localStorage.setItem('fk_user', JSON.stringify(user));
      showSuccess(name);
    } else {
      showToast('Enter the complete OTP', 'error');
    }
  });
}

// ── OTP inputs ──
function initOTPInputs() {
  document.querySelectorAll('.otp-digit').forEach((input, idx, all) => {
    input.addEventListener('input', () => {
      if (input.value && idx < all.length - 1) all[idx + 1].focus();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !input.value && idx > 0) all[idx - 1].focus();
    });
  });
}

// ── Success ──
function showSuccess(name) {
  const formArea = document.querySelector('.auth-right');
  if (!formArea) return;
  formArea.innerHTML = `
    <div class="auth-success show">
      <div class="success-icon">🎉</div>
      <div class="success-title">Welcome, ${name}!</div>
      <p class="success-sub">You are now logged in to Flipkart</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:24px">
        <a href="index.html" class="btn btn-primary btn-lg">Continue Shopping</a>
        <a href="cart.html" class="btn btn-outline">View Cart</a>
      </div>
    </div>
  `;
}
