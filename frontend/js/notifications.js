// Notifications Controller

document.addEventListener('DOMContentLoaded', () => {
  const user = UserStorage.get();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  loadNotifications();

  const markAllBtn = document.getElementById('markAllReadBtn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async () => {
      try {
        const res = await API.markAllNotificationsRead();
        if (res.success) {
          loadNotifications();
        }
      } catch (err) {
        alert(err.message || 'Failed to mark notifications as read');
      }
    });
  }
});

async function loadNotifications() {
  const container = document.getElementById('notificationsContainer');
  if (!container) return;

  container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Loading notifications...</p>`;

  try {
    const res = await API.getNotifications();
    if (res.success) {
      if (res.notifications.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"/></svg>
            <h3>No notifications yet</h3>
            <p>When someone follows you, likes your post, or comments on your updates, you'll see alerts here.</p>
          </div>
        `;
      } else {
        container.innerHTML = '';
        res.notifications.forEach((notif) => {
          container.appendChild(renderNotificationItem(notif));
        });
      }
    }
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Failed to load notifications: ${err.message}</div>`;
  }
}

function renderNotificationItem(notif) {
  const card = document.createElement('div');
  card.className = `card ${notif.read ? '' : 'card-unread'}`;
  card.style.display = 'flex';
  card.style.alignItems = 'center';
  card.style.justifyContent = 'space-between';
  card.style.marginBottom = '0.75rem';
  card.style.backgroundColor = notif.read ? 'var(--bg-card)' : 'var(--primary-light)';

  let actionText = '';
  let iconSvg = '';

  if (notif.type === 'follow') {
    actionText = 'started following you.';
    iconSvg = `<svg width="20" height="20" fill="none" stroke="var(--primary)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>`;
  } else if (notif.type === 'like') {
    actionText = 'liked your post.';
    iconSvg = `<svg width="20" height="20" fill="var(--accent)" stroke="var(--accent)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`;
  } else if (notif.type === 'comment') {
    actionText = 'commented on your post.';
    iconSvg = `<svg width="20" height="20" fill="none" stroke="var(--primary)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>`;
  }

  card.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.9rem; flex: 1;">
      <div style="padding: 0.5rem; background-color: white; border-radius: 50%; box-shadow: var(--shadow-sm);">
        ${iconSvg}
      </div>

      <a href="/profile.html?id=${notif.sender._id}">
        <img src="${notif.sender.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}" class="avatar avatar-sm" alt="${notif.sender.username}" />
      </a>

      <div>
        <p style="font-size: 0.92rem; color: var(--text-main);">
          <a href="/profile.html?id=${notif.sender._id}" style="font-weight: 700;">@${notif.sender.username}</a> ${actionText}
        </p>
        <span style="font-size: 0.78rem; color: var(--text-muted);">${formatTimeAgo(notif.createdAt)}</span>
      </div>
    </div>

    <div>
      ${!notif.read ? `
        <button class="btn btn-outline btn-sm mark-read-btn" data-id="${notif._id}" style="padding: 0.25rem 0.65rem; font-size: 0.75rem;">
          Mark Read
        </button>
      ` : ''}
    </div>
  `;

  const markBtn = card.querySelector('.mark-read-btn');
  if (markBtn) {
    markBtn.addEventListener('click', async () => {
      try {
        const res = await API.markNotificationRead(notif._id);
        if (res.success) {
          loadNotifications();
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  return card;
}
