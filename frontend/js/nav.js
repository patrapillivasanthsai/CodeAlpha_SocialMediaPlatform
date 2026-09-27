// Redesigned Navigation System with Theme Toggle & Responsive Controls

function renderNavbar() {
  const currentUser = UserStorage.get();
  const currentPath = window.location.pathname;

  const header = document.getElementById('navbar');
  if (!header) return;

  const activeHome = currentPath === '/' || currentPath.includes('feed') || currentPath.includes('index') ? 'active' : '';
  const activeSearch = currentPath.includes('search') ? 'active' : '';
  const activeCreate = currentPath.includes('create-post') ? 'active' : '';
  const activeNotif = currentPath.includes('notifications') ? 'active' : '';
  const activeProfile = currentPath.includes('profile') ? 'active' : '';

  let navRightHtml = '';

  if (currentUser) {
    navRightHtml = `
      <div class="user-menu">
        <button class="theme-toggle-btn" onclick="window.toggleTheme()" aria-label="Toggle theme"></button>

        <a href="/profile.html?id=${currentUser._id}" class="nav-link ${activeProfile}" title="Profile">
          <img src="${currentUser.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}" alt="${currentUser.username}" class="avatar avatar-sm" />
          <span style="font-weight: 700;">@${currentUser.username}</span>
        </a>

        <button id="logoutBtn" class="btn btn-outline btn-sm" title="Log out">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span style="display: none; @media(min-width: 600px){display:inline;}">Logout</span>
        </button>
      </div>
    `;
  } else {
    navRightHtml = `
      <div style="display: flex; items-center; gap: 0.65rem;">
        <button class="theme-toggle-btn" onclick="window.toggleTheme()" aria-label="Toggle theme"></button>
        <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
        <a href="/register.html" class="btn btn-accent btn-sm">Register</a>
      </div>
    `;
  }

  header.className = 'navbar';
  header.innerHTML = `
    <div class="nav-container">
      <a href="/feed.html" class="brand-logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        Connectly
      </a>

      <ul class="nav-links" style="display: none; @media(min-width: 768px){display:flex;}">
        <li><a href="/feed.html" class="nav-link ${activeHome}">Home</a></li>
        <li><a href="/search.html" class="nav-link ${activeSearch}">Search</a></li>
        ${currentUser ? `
          <li><a href="/create-post.html" class="nav-link ${activeCreate}">Create</a></li>
          <li>
            <a href="/notifications.html" class="nav-link ${activeNotif}">
              Notifications
              <span id="navNotifBadge" class="badge" style="display: none;">0</span>
            </a>
          </li>
        ` : ''}
      </ul>

      ${navRightHtml}
    </div>
  `;

  // Render Mobile Bottom Navigation Bar
  const mobileNav = document.getElementById('mobileNav');
  if (mobileNav) {
    if (currentUser) {
      mobileNav.className = 'mobile-nav';
      mobileNav.innerHTML = `
        <a href="/feed.html" class="mobile-nav-item ${activeHome}" aria-label="Home Feed">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span>Feed</span>
        </a>
        <a href="/search.html" class="mobile-nav-item ${activeSearch}" aria-label="Search Creators">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span>Search</span>
        </a>
        <a href="/create-post.html" class="mobile-nav-item ${activeCreate}" aria-label="Create Post">
          <div style="background-color: var(--accent); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </div>
        </a>
        <a href="/notifications.html" class="mobile-nav-item ${activeNotif}" aria-label="Notifications">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"/></svg>
          <span>Alerts</span>
        </a>
        <a href="/profile.html?id=${currentUser._id}" class="mobile-nav-item ${activeProfile}" aria-label="Profile">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span>Profile</span>
        </a>
      `;
    } else {
      mobileNav.style.display = 'none';
    }
  }

  // Setup logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      TokenStorage.clear();
      if (window.showToast) window.showToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 500);
    });
  }

  // Sync theme toggle icons state
  const isDark = document.documentElement.classList.contains('dark-theme');
  if (window.updateThemeToggleIcons) {
    window.updateThemeToggleIcons(isDark);
  }

  // Fetch unread notifications count if user is logged in
  if (currentUser) {
    API.getNotifications()
      .then((res) => {
        if (res.unreadCount > 0) {
          const badge = document.getElementById('navNotifBadge');
          if (badge) {
            badge.innerText = res.unreadCount;
            badge.style.display = 'inline';
          }
        }
      })
      .catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', renderNavbar);
