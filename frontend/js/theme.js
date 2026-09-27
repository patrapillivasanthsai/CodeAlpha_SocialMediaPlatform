// Connectly Theme Manager - Handles Light/Dark Theme Persistence & Toggle

(function () {
  // Execute immediately before render to prevent FOUC (Flash of Unstyled Content)
  // Light Mode is default unless user explicitly saved 'dark' preference
  const savedTheme = localStorage.getItem('connectly_theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-theme');
  } else {
    document.documentElement.classList.remove('dark-theme');
  }
})();

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark-theme');
  localStorage.setItem('connectly_theme', isDark ? 'dark' : 'light');
  updateThemeToggleIcons(isDark);
  if (window.showToast) {
    window.showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`, 'info');
  }
}

function updateThemeToggleIcons(isDark) {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  toggleBtns.forEach((btn) => {
    btn.innerHTML = isDark
      ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
      : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
    btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const isDark = document.documentElement.classList.contains('dark-theme');
  updateThemeToggleIcons(isDark);
});

window.toggleTheme = toggleTheme;
window.updateThemeToggleIcons = updateThemeToggleIcons;
