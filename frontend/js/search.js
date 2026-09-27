// Search Controller - Live User Search with Clear Option & Toast Feedback

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const searchResultsContainer = document.getElementById('searchResults');

  let debounceTimer;

  if (searchInput && searchResultsContainer) {
    // Initial fetch of suggested creators/users
    fetchSearchResults('');

    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value;

      if (clearSearchBtn) {
        clearSearchBtn.style.display = query.trim() ? 'flex' : 'none';
      }

      debounceTimer = setTimeout(() => {
        fetchSearchResults(query);
      }, 300);
    });

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        fetchSearchResults('');
        searchInput.focus();
      });
    }
  }
});

async function fetchSearchResults(query) {
  const container = document.getElementById('searchResults');
  if (!container) return;

  container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Searching creators...</p>`;

  try {
    const res = await API.searchUsers(query);
    if (res.success) {
      if (res.users.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <h3>No creators found</h3>
            <p>We couldn't find any users matching "${escapeHTML(query)}". Try a different username.</p>
          </div>
        `;
      } else {
        container.innerHTML = '';
        res.users.forEach((user) => {
          container.appendChild(renderUserSearchCard(user));
        });
      }
    }
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error searching users: ${err.message}</div>`;
  }
}

function renderUserSearchCard(user) {
  const currentUser = UserStorage.get();
  const isSelf = currentUser && currentUser._id === user._id;

  const card = document.createElement('div');
  card.className = 'card card-hover';
  card.style.display = 'flex';
  card.style.alignItems = 'center';
  card.style.justifyContent = 'space-between';
  card.style.marginBottom = '0.9rem';

  card.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
      <a href="/profile.html?id=${user._id}">
        <img src="${user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}" class="avatar" alt="${user.username}" />
      </a>
      <div>
        <a href="/profile.html?id=${user._id}" style="font-weight: 700; font-size: 1rem; color: var(--text-main);">@${user.username}</a>
        <p style="font-size: 0.83rem; color: var(--text-muted); line-height: 1.3;">
          ${user.bio ? escapeHTML(user.bio.substring(0, 75)) + (user.bio.length > 75 ? '...' : '') : 'No bio written yet'}
        </p>
        <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">${user.followersCount || 0} Followers</span>
      </div>
    </div>

    <div>
      ${isSelf ? `
        <span class="badge" style="background-color: var(--primary-light); color: var(--primary); padding: 4px 12px;">You</span>
      ` : `
        <button class="btn ${user.isFollowing ? 'btn-outline' : 'btn-accent'} btn-sm search-follow-btn" data-id="${user._id}" data-following="${user.isFollowing}">
          ${user.isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      `}
    </div>
  `;

  const followBtn = card.querySelector('.search-follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', async () => {
      if (!currentUser) {
        if (window.showToast) window.showToast('Please log in to follow users', 'info');
        window.location.href = '/login.html';
        return;
      }

      const isFollowing = followBtn.dataset.following === 'true';
      followBtn.disabled = true;

      try {
        if (isFollowing) {
          const res = await API.unfollowUser(user._id);
          if (res.success) {
            followBtn.dataset.following = 'false';
            followBtn.innerText = 'Follow';
            followBtn.className = 'btn btn-accent btn-sm search-follow-btn';
            if (window.showToast) window.showToast(`Unfollowed @${user.username}`, 'info');
          }
        } else {
          const res = await API.followUser(user._id);
          if (res.success) {
            followBtn.dataset.following = 'true';
            followBtn.innerText = 'Unfollow';
            followBtn.className = 'btn btn-outline btn-sm search-follow-btn';
            if (window.showToast) window.showToast(`Following @${user.username}`, 'success');
          }
        }
      } catch (err) {
        if (window.showToast) window.showToast(err.message || 'Action failed', 'error');
      } finally {
        followBtn.disabled = false;
      }
    });
  }

  return card;
}
