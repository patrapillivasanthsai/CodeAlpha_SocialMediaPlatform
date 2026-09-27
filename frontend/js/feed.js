// Feed Controller - Handles Posts, Likes, Comments, Edit/Delete

let currentFeedFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  const feedPostsContainer = document.getElementById('feedPosts');
  const createPostForm = document.getElementById('quickCreatePostForm');
  const tabAll = document.getElementById('tabAll');
  const tabFollowing = document.getElementById('tabFollowing');

  // Load feed on init
  loadFeed();

  // Tab Listeners
  if (tabAll) {
    tabAll.addEventListener('click', () => {
      if (currentFeedFilter === 'all') return;
      currentFeedFilter = 'all';
      tabAll.classList.add('active');
      if (tabFollowing) tabFollowing.classList.remove('active');
      loadFeed();
    });
  }

  if (tabFollowing) {
    tabFollowing.addEventListener('click', () => {
      const user = UserStorage.get();
      if (!user) {
        alert('Please log in to view posts from users you follow.');
        window.location.href = '/login.html';
        return;
      }
      if (currentFeedFilter === 'following') return;
      currentFeedFilter = 'following';
      tabFollowing.classList.add('active');
      if (tabAll) tabAll.classList.remove('active');
      loadFeed();
    });
  }

  // Quick Inline Post Creation
  if (createPostForm) {
    const user = UserStorage.get();
    if (!user) {
      createPostForm.parentElement.style.display = 'none';
    } else {
      createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const contentInput = document.getElementById('quickPostContent');
        const imageInput = document.getElementById('quickPostImage');

        const content = contentInput.value.trim();
        const image = imageInput ? imageInput.value.trim() : '';

        if (!content) return;

        const submitBtn = createPostForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
          const res = await API.createPost({ content, image });
          if (res.success) {
            contentInput.value = '';
            if (imageInput) imageInput.value = '';
            // Reload feed
            loadFeed();
          }
        } catch (err) {
          alert(err.message || 'Failed to publish post');
        } finally {
          submitBtn.disabled = false;
        }
      });
    }
  }
});

async function loadFeed() {
  const container = document.getElementById('feedPosts');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
      <p>Loading posts...</p>
    </div>
  `;

  try {
    const res = await API.getPosts(currentFeedFilter);
    if (res.success) {
      if (res.posts.length === 0) {
        renderEmptyFeed(container);
      } else {
        container.innerHTML = '';
        res.posts.forEach((post) => {
          container.appendChild(renderPostCard(post));
        });
      }
    }
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger">
        Failed to load feed: ${err.message}
      </div>
    `;
  }
}

function renderEmptyFeed(container) {
  if (currentFeedFilter === 'following') {
    container.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        <h3>No posts from followed users yet</h3>
        <p>Follow interesting creators using the search page to fill your custom feed!</p>
        <a href="/search.html" class="btn btn-primary btn-sm">Discover People</a>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        <h3>No posts yet</h3>
        <p>Be the first person to share a story or update on Connectly!</p>
        <a href="/create-post.html" class="btn btn-primary btn-sm">Create First Post</a>
      </div>
    `;
  }
}

function renderPostCard(post) {
  const currentUser = UserStorage.get();
  const isOwner = currentUser && post.author && currentUser._id === post.author._id;

  const card = document.createElement('article');
  card.className = 'post-card card-hover';
  card.id = `post-${post._id}`;

  const timeAgo = formatTimeAgo(post.createdAt);

  card.innerHTML = `
    <div class="post-header">
      <div class="author-info">
        <a href="/profile.html?id=${post.author ? post.author._id : ''}">
          <img src="${post.author?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}" alt="${post.author?.username}" class="avatar" />
        </a>
        <div>
          <a href="/profile.html?id=${post.author ? post.author._id : ''}" class="author-name">@${post.author ? post.author.username : 'Unknown'}</a>
          <div class="post-time">${timeAgo}</div>
        </div>
      </div>

      ${isOwner ? `
        <div style="display: flex; gap: 0.5rem;">
          <button class="action-btn edit-post-btn" data-id="${post._id}" title="Edit Post">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button class="action-btn delete-post-btn" data-id="${post._id}" title="Delete Post" style="color: var(--accent);">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      ` : ''}
    </div>

    <div class="post-content">${escapeHTML(post.content)}</div>

    ${post.image ? `<img src="${escapeHTML(post.image)}" alt="Post image" class="post-image" loading="lazy" />` : ''}

    <div class="post-actions">
      <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}" data-id="${post._id}">
        <svg width="18" height="18" fill="${post.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        <span class="likes-count">${post.likesCount || 0}</span> Likes
      </button>

      <button class="action-btn toggle-comments-btn" data-id="${post._id}">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span class="comments-count">${post.commentsCount || 0}</span> Comments
      </button>
    </div>

    <div class="comments-section" id="comments-${post._id}" style="display: none;">
      <div class="comments-list" id="comments-list-${post._id}">
        <p style="font-size: 0.85rem; color: var(--text-muted);">Loading comments...</p>
      </div>

      ${currentUser ? `
        <form class="add-comment-form" data-postid="${post._id}">
          <input type="text" class="add-comment-input" placeholder="Write a comment..." required />
          <button type="submit" class="btn btn-primary btn-sm">Post</button>
        </form>
      ` : `
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
          <a href="/login.html">Log in</a> to leave a comment.
        </p>
      `}
    </div>
  `;

  // Attach event handlers
  setupPostCardEvents(card, post);

  return card;
}

function setupPostCardEvents(card, post) {
  // Like Button Toggle
  const likeBtn = card.querySelector('.like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      const currentUser = UserStorage.get();
      if (!currentUser) {
        alert('Please log in to like posts.');
        window.location.href = '/login.html';
        return;
      }

      const isLiked = likeBtn.classList.contains('liked');
      const likesCountSpan = card.querySelector('.likes-count');

      try {
        if (isLiked) {
          const res = await API.unlikePost(post._id);
          if (res.success) {
            likeBtn.classList.remove('liked');
            likeBtn.querySelector('svg').setAttribute('fill', 'none');
            likesCountSpan.innerText = res.likesCount;
          }
        } else {
          const res = await API.likePost(post._id);
          if (res.success) {
            likeBtn.classList.add('liked');
            likeBtn.querySelector('svg').setAttribute('fill', 'currentColor');
            likesCountSpan.innerText = res.likesCount;
          }
        }
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Toggle Comments Section
  const toggleCommentsBtn = card.querySelector('.toggle-comments-btn');
  const commentsSection = card.querySelector(`#comments-${post._id}`);
  if (toggleCommentsBtn && commentsSection) {
    toggleCommentsBtn.addEventListener('click', () => {
      const isVisible = commentsSection.style.display !== 'none';
      if (isVisible) {
        commentsSection.style.display = 'none';
      } else {
        commentsSection.style.display = 'block';
        loadComments(post._id);
      }
    });
  }

  // Add Comment Form Submit
  const commentForm = card.querySelector(`.add-comment-form`);
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = commentForm.querySelector('.add-comment-input');
      const content = input.value.trim();
      if (!content) return;

      try {
        const res = await API.addComment(post._id, content);
        if (res.success) {
          input.value = '';
          const commentsCountSpan = card.querySelector('.comments-count');
          if (commentsCountSpan) commentsCountSpan.innerText = res.commentsCount;
          loadComments(post._id);
        }
      } catch (err) {
        alert(err.message || 'Failed to post comment');
      }
    });
  }

  // Delete Own Post
  const deleteBtn = card.querySelector('.delete-post-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          const res = await API.deletePost(post._id);
          if (res.success) {
            card.remove();
          }
        } catch (err) {
          alert(err.message || 'Failed to delete post');
        }
      }
    });
  }

  // Edit Own Post
  const editBtn = card.querySelector('.edit-post-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      openEditPostModal(post);
    });
  }
}

async function loadComments(postId) {
  const container = document.getElementById(`comments-list-${postId}`);
  if (!container) return;

  try {
    const res = await API.getComments(postId);
    if (res.success) {
      if (res.comments.length === 0) {
        container.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">No comments yet. Be the first!</p>';
      } else {
        const currentUser = UserStorage.get();
        container.innerHTML = res.comments
          .map((c) => {
            const canDelete = currentUser && (currentUser._id === c.author._id);
            return `
              <div class="comment-item" id="comment-${c._id}">
                <a href="/profile.html?id=${c.author._id}">
                  <img src="${c.author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}" class="avatar avatar-sm" />
                </a>
                <div class="comment-body">
                  <div style="display: flex; justify-content: space-between;">
                    <a href="/profile.html?id=${c.author._id}" class="comment-author">@${c.author.username}</a>
                    <div>
                      <span class="comment-time">${formatTimeAgo(c.createdAt)}</span>
                      ${canDelete ? `<button onclick="window.deleteComment('${c._id}', '${postId}')" style="background:none; border:none; color:var(--accent); cursor:pointer; font-size:0.75rem; margin-left:0.5rem;">Delete</button>` : ''}
                    </div>
                  </div>
                  <div class="comment-text">${escapeHTML(c.content)}</div>
                </div>
              </div>
            `;
          })
          .join('');
      }
    }
  } catch (err) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: var(--accent);">Failed to load comments</p>`;
  }
}

async function deleteComment(commentId, postId) {
  if (confirm('Delete this comment?')) {
    try {
      const res = await API.deleteComment(commentId);
      if (res.success) {
        const postCard = document.getElementById(`post-${postId}`);
        if (postCard) {
          const commentsCountSpan = postCard.querySelector('.comments-count');
          if (commentsCountSpan) commentsCountSpan.innerText = res.commentsCount;
        }
        loadComments(postId);
      }
    } catch (err) {
      alert(err.message || 'Could not delete comment');
    }
  }
}

function openEditPostModal(post) {
  let modal = document.getElementById('editPostModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editPostModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Edit Post</h3>
        <button class="modal-close" onclick="window.closeEditPostModal()">&times;</button>
      </div>
      <form id="editPostForm">
        <div class="form-group">
          <label class="form-label">Post Content</label>
          <textarea id="editContent" class="form-control" rows="4" required>${escapeHTML(post.content)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Image URL (Optional)</label>
          <input type="url" id="editImage" class="form-control" value="${escapeHTML(post.image || '')}" placeholder="https://example.com/image.jpg" />
        </div>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.closeEditPostModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </form>
    </div>
  `;

  modal.style.display = 'flex';

  const form = document.getElementById('editPostForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('editContent').value.trim();
    const image = document.getElementById('editImage').value.trim();

    try {
      const res = await API.updatePost(post._id, { content, image });
      if (res.success) {
        closeEditPostModal();
        loadFeed();
      }
    } catch (err) {
      alert(err.message || 'Failed to update post');
    }
  });
}

function closeEditPostModal() {
  const modal = document.getElementById('editPostModal');
  if (modal) modal.style.display = 'none';
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Attach global window handlers for inline onclicks
window.deleteComment = deleteComment;
window.openEditPostModal = openEditPostModal;
window.closeEditPostModal = closeEditPostModal;
