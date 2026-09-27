// Create Post Page & Widget Controller with Image Removal & Character Guidance

document.addEventListener('DOMContentLoaded', () => {
  const user = UserStorage.get();
  if (!user && window.location.pathname.includes('create-post')) {
    window.location.href = '/login.html';
    return;
  }

  const createPostForm = document.getElementById('createPostPageForm');
  const contentInput = document.getElementById('postContent');
  const charCounter = document.getElementById('charCounter');
  const imageInput = document.getElementById('postImageUrl');
  const imagePreview = document.getElementById('imagePreviewContainer');
  const imagePreviewImg = document.getElementById('imagePreviewImg');
  const removeImageBtn = document.getElementById('removeImageBtn');

  // Character Counter Guidance
  if (contentInput && charCounter) {
    contentInput.addEventListener('input', () => {
      const len = contentInput.value.length;
      charCounter.innerText = `${len} / 2000 characters`;
      charCounter.style.color = len > 1800 ? 'var(--accent)' : 'var(--text-muted)';
    });
  }

  // Image Preview & Removal Logic
  if (imageInput && imagePreviewImg && imagePreview) {
    const updatePreview = () => {
      const url = imageInput.value.trim();
      if (url) {
        imagePreviewImg.src = url;
        imagePreview.style.display = 'block';
        imagePreviewImg.onerror = () => {
          imagePreview.style.display = 'none';
        };
      } else {
        imagePreview.style.display = 'none';
      }
    };

    imageInput.addEventListener('input', updatePreview);

    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', () => {
        imageInput.value = '';
        imagePreview.style.display = 'none';
        if (window.showToast) window.showToast('Image attachment removed', 'info');
      });
    }
  }

  // Submit Handler
  if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = contentInput ? contentInput.value.trim() : '';
      const image = imageInput ? imageInput.value.trim() : '';

      if (!content) {
        if (window.showToast) window.showToast('Please write some post content', 'error');
        return;
      }

      const submitBtn = createPostForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Publishing...';

      try {
        const res = await API.createPost({ content, image });
        if (res.success) {
          if (window.showToast) window.showToast('Post published successfully!', 'success');
          setTimeout(() => {
            window.location.href = '/feed.html';
          }, 600);
        }
      } catch (err) {
        if (window.showToast) window.showToast(err.message || 'Failed to create post', 'error');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Publish Post';
      }
    });
  }
});
