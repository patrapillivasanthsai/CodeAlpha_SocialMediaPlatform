// Profile Page Logic - User Profile, Followers/Following Lists, Edit Profile

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentUser = UserStorage.get();
  let targetUserId = urlParams.get('id');

  if (!targetUserId && currentUser) {
    targetUserId = currentUser._id;
  }

  if (!targetUserId) {
    window.location.href = '/login.html';
    return;
  }

  loadUserProfile(targetUserId);
});

async function loadUserProfile(userId) {
  const container = document.getElementById('profileHeaderContainer');
  const postsContainer = document.getElementById('userPostsContainer');

  if (!container) return;

  try {
    const res = await API.getUserProfile(userId);
    if (res.success) {
      const user = res.user;
      const currentUser = UserStorage.get();
      const isSelf = currentUser && currentUser._id === user._id;

      container.innerHTML = `
        <div class="card" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <img src="${user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}" alt="${user.username}" class="avatar avatar-lg" />
              <div>
                <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">@${user.username}</h2>
                <p style="font-size: 0.85rem; color: var(--text-muted);">Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div>
              ${isSelf ? `
                <button class="btn btn-outline btn-sm" onclick="window.openEditProfileModal('${user._id}', '${escapeHTML(user.username)}', '${escapeHTML(user.bio || '')}', '${escapeHTML(user.profileImage)}')">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  Edit Profile
                </button>
              ` : `
                <button id="followToggleBtn" class="btn ${user.isFollowing ? 'btn-outline' : 'btn-accent'} btn-sm">
                  ${user.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              `}
            </div>
          </div>

          <p style="font-size: 0.98rem; color: var(--text-main); line-height: 1.6;">
            ${user.bio ? escapeHTML(user.bio) : '<em>No bio written yet.</em>'}
          </p>

          <div style="display: flex; gap: 2rem; border-top: 1px solid var(--border-color); padding-top: 0.9rem; margin-top: 0.25rem;">
            <div style="cursor: pointer;" onclick="window.showFollowListModal('Followers', ${JSON.stringify(user.followers || []).replace(/"/g, '&quot;')})">
              <strong id="followersCount" style="font-size: 1.15rem; color: var(--accent);">${user.followersCount}</strong>
              <span style="font-size: 0.9rem; color: var(--text-muted); margin-left: 0.3rem;">Followers</span>
            </div>
            <div style="cursor: pointer;" onclick="window.showFollowListModal('Following', ${JSON.stringify(user.following || []).replace(/"/g, '&quot;')})">
              <strong id="followingCount" style="font-size: 1.15rem; color: var(--accent);">${user.followingCount}</strong>
              <span style="font-size: 0.9rem; color: var(--text-muted); margin-left: 0.3rem;">Following</span>
            </div>
          </div>
        </div>
      `;

      // Setup Follow / Unfollow Listener
      const followToggleBtn = document.getElementById('followToggleBtn');
      if (followToggleBtn) {
        followToggleBtn.addEventListener('click', async () => {
          if (!currentUser) {
            if (window.showToast) window.showToast('Please log in to follow users', 'info');
            window.location.href = '/login.html';
            return;
          }

          const isFollowing = user.isFollowing;
          followToggleBtn.disabled = true;

          try {
            if (isFollowing) {
              const res = await API.unfollowUser(user._id);
              if (res.success) {
                user.isFollowing = false;
                followToggleBtn.innerText = 'Follow';
                followToggleBtn.className = 'btn btn-accent btn-sm';
                document.getElementById('followersCount').innerText = res.followersCount;
                if (window.showToast) window.showToast(`Unfollowed @${user.username}`, 'info');
              }
            } else {
              const res = await API.followUser(user._id);
              if (res.success) {
                user.isFollowing = true;
                followToggleBtn.innerText = 'Unfollow';
                followToggleBtn.className = 'btn btn-outline btn-sm';
                document.getElementById('followersCount').innerText = res.followersCount;
                if (window.showToast) window.showToast(`Following @${user.username}`, 'success');
              }
            }
          } catch (err) {
            if (window.showToast) window.showToast(err.message || 'Follow action failed', 'error');
          } finally {
            followToggleBtn.disabled = false;
          }
        });
      }

      // Load user posts
      loadUserPosts(userId, postsContainer);
    }
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger">
        Unable to load user profile: ${err.message}
      </div>
    `;
  }
}

async function loadUserPosts(userId, container) {
  if (!container) return;

  container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Loading user posts...</p>`;

  try {
    const res = await API.getUserPosts(userId);
    if (res.success) {
      if (res.posts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <h3>No posts published yet</h3>
            <p>This user hasn't posted anything on Connectly yet.</p>
          </div>
        `;
      } else {
        container.innerHTML = '';
        res.posts.forEach((post) => {
          container.appendChild(renderPostCard(post));
        });
      }
    }
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Failed to load posts</div>`;
  }
}

function openEditProfileModal(userId, currentUsername, currentBio, currentAvatar) {
  let modal = document.getElementById('editProfileModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editProfileModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Profile</h3>
        <button class="modal-close" onclick="window.closeEditProfileModal()">&times;</button>
      </div>
      <form id="editProfileForm">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input type="text" id="editUsername" class="form-control" value="${currentUsername}" required minlength="3" />
        </div>
        <div class="form-group">
          <label class="form-label">Bio</label>
          <textarea id="editBio" class="form-control" rows="3" placeholder="Tell the world a bit about yourself...">${currentBio}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Profile Image URL</label>
          <input type="url" id="editAvatar" class="form-control" value="${currentAvatar}" placeholder="https://example.com/avatar.jpg" />
        </div>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.closeEditProfileModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Profile</button>
        </div>
      </form>
    </div>
  `;

  modal.style.display = 'flex';

  const form = document.getElementById('editProfileForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('editUsername').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const profileImage = document.getElementById('editAvatar').value.trim();

    try {
      const res = await API.updateUserProfile(userId, { username, bio, profileImage });
      if (res.success) {
        UserStorage.set(res.user);
        closeEditProfileModal();
        if (window.showToast) window.showToast('Profile updated successfully!', 'success');
        loadUserProfile(userId);
      }
    } catch (err) {
      if (window.showToast) window.showToast(err.message || 'Failed to update profile', 'error');
    }
  });
}

function closeEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  if (modal) modal.style.display = 'none';
}

function showFollowListModal(title, usersList) {
  let modal = document.getElementById('followListModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'followListModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const listHtml = usersList.length === 0
    ? `<p style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No ${title.toLowerCase()} yet.</p>`
    : usersList.map(u => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0; border-bottom: 1px solid var(--border-color);">
          <a href="/profile.html?id=${u._id}" style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${u.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}" class="avatar avatar-sm" />
            <span style="font-weight: 700; color: var(--text-main);">@${u.username}</span>
          </a>
          <a href="/profile.html?id=${u._id}" class="btn btn-outline btn-sm" onclick="document.getElementById('followListModal').style.display='none'">View</a>
        </div>
      `).join('');

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" onclick="document.getElementById('followListModal').style.display='none'">&times;</button>
      </div>
      <div style="max-height: 350px; overflow-y: auto;">
        ${listHtml}
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.showFollowListModal = showFollowListModal;
