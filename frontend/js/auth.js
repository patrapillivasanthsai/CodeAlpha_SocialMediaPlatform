// Authentication Page Controller - Login, Register, Password Visibility Toggle & Toast Alerts

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authAlert = document.getElementById('authAlert');

  // Password Visibility Toggle Logic
  const passToggleBtns = document.querySelectorAll('.password-toggle-btn');
  passToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input && (input.type === 'password' || input.type === 'text')) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword
          ? `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>`
          : `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
      }
    });
  });

  const showAlert = (message, isError = true) => {
    if (window.showToast) {
      window.showToast(message, isError ? 'error' : 'success');
    }
    if (!authAlert) return;
    authAlert.style.display = 'block';
    authAlert.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
    authAlert.innerText = message;
  };

  const hideAlert = () => {
    if (authAlert) authAlert.style.display = 'none';
  };

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        showAlert('Please enter both email/username and password');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Signing in...';

      try {
        const res = await API.login({ email, password });
        if (res.success) {
          TokenStorage.set(res.token);
          UserStorage.set(res.user);
          showAlert(`Welcome back, @${res.user.username}!`, false);
          setTimeout(() => {
            window.location.href = '/feed.html';
          }, 600);
        }
      } catch (err) {
        showAlert(err.message || 'Login failed. Please check credentials.');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Sign In';
      }
    });

    // Handle Quick Demo Login Buttons
    const demoAlexBtn = document.getElementById('demoAlexBtn');
    if (demoAlexBtn) {
      demoAlexBtn.addEventListener('click', () => {
        document.getElementById('loginEmail').value = 'alex@example.com';
        document.getElementById('loginPassword').value = 'password123';
        loginForm.requestSubmit();
      });
    }

    const demoElenaBtn = document.getElementById('demoElenaBtn');
    if (demoElenaBtn) {
      demoElenaBtn.addEventListener('click', () => {
        document.getElementById('loginEmail').value = 'elena@example.com';
        document.getElementById('loginPassword').value = 'password123';
        loginForm.requestSubmit();
      });
    }
  }

  // Register Form Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const bio = document.getElementById('regBio')?.value.trim() || '';
      const profileImage = document.getElementById('regAvatar')?.value.trim() || '';

      if (!username || !email || !password) {
        showAlert('Please fill in all required fields');
        return;
      }

      if (username.length < 3) {
        showAlert('Username must be at least 3 characters long');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Creating account...';

      try {
        const res = await API.register({ username, email, password, bio, profileImage });
        if (res.success) {
          TokenStorage.set(res.token);
          UserStorage.set(res.user);
          showAlert('Account created successfully! Welcome to Connectly!', false);
          setTimeout(() => {
            window.location.href = '/feed.html';
          }, 700);
        }
      } catch (err) {
        showAlert(err.message || 'Registration failed');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Create Account';
      }
    });
  }
});
