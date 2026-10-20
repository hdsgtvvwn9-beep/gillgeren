(function () {
  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.querySelector('#mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => item.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((item) => observer.observe(item));
  }

  const form = document.querySelector('#message-form');
  if (!form) return;

  const nickname = document.querySelector('#nickname');
  const message = document.querySelector('#message');
  const counter = document.querySelector('#counter');
  const status = document.querySelector('#form-status');
  const list = document.querySelector('#message-list');
  const clearButton = document.querySelector('#clear-messages');
  const key = 'jingwei-campus-messages-v1';

  const escapeHTML = (value) => value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  const getMessages = () => {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (_) { return []; }
  };

  const renderMessages = () => {
    const messages = getMessages();
    if (!messages.length) {
      list.innerHTML = '<div class="empty-message">暂无本地留言，欢迎留下第一条建议。</div>';
      return;
    }
    list.innerHTML = messages.slice().reverse().map((item) => `
      <article class="message-item">
        <header><strong>${escapeHTML(item.nickname)}</strong><time>${escapeHTML(item.time)}</time></header>
        <p>${escapeHTML(item.message)}</p>
      </article>`).join('');
  };

  message.addEventListener('input', () => { counter.value = `${message.value.length} / 200`; });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameValue = nickname.value.trim();
    const messageValue = message.value.trim();
    if (!nameValue || !messageValue) return;
    const messages = getMessages();
    messages.push({ nickname: nameValue, message: messageValue, time: new Date().toLocaleString('zh-CN', { hour12: false }) });
    localStorage.setItem(key, JSON.stringify(messages.slice(-20)));
    form.reset(); counter.value = '0 / 200'; status.textContent = '留言已保存在当前浏览器。'; renderMessages();
  });
  clearButton.addEventListener('click', () => {
    if (window.confirm('只会清空当前浏览器中的演示留言，确定继续吗？')) {
      localStorage.removeItem(key); status.textContent = '本地留言已清空。'; renderMessages();
    }
  });
  renderMessages();
})();
