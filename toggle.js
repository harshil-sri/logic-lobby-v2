document.addEventListener('DOMContentLoaded', () => {
  // --- Dark Mode Logic ---
  const currentTheme = localStorage.getItem('theme') || 'light';
  const isDarkPage = window.location.pathname.endsWith('-dark.html');

  // Enforce theme (but prevent infinite redirects)
  if (currentTheme === 'dark' && !isDarkPage) {
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    const darkName = filename.replace('.html', '-dark.html');
    window.location.replace(darkName);
    return;
  } else if (currentTheme === 'light' && isDarkPage) {
    const filename = window.location.pathname.split('/').pop();
    const lightName = filename.replace('-dark.html', '.html');
    window.location.replace(lightName);
    return;
  }

  // Hook up existing theme buttons if they exist
  const themeLightBtn = document.getElementById('theme-light-btn');
  const themeDarkBtn = document.getElementById('theme-dark-btn');
  const themeToggle = document.getElementById('themeToggle');
  const conclusionToggle = document.querySelector('button[aria-label="Toggle Day/Night Display"]');

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    if (newTheme === 'dark') {
      window.location.href = filename.replace('.html', '-dark.html');
    } else {
      window.location.href = filename.replace('-dark.html', '.html');
    }
  };

  if (themeLightBtn) themeLightBtn.addEventListener('click', toggleTheme);
  if (themeDarkBtn) themeDarkBtn.addEventListener('click', toggleTheme);
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (conclusionToggle) conclusionToggle.addEventListener('click', toggleTheme);

  // If no native buttons exist or just as a fallback, inject a floating toggle
  if (!themeLightBtn && !themeDarkBtn && !themeToggle && !conclusionToggle) {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'floating-theme-toggle';
    toggleBtn.style.position = 'fixed';
    toggleBtn.style.bottom = '20px';
    toggleBtn.style.right = '20px';
    toggleBtn.style.zIndex = '9999';
    toggleBtn.style.width = '48px';
    toggleBtn.style.height = '48px';
    toggleBtn.style.borderRadius = '50%';
    toggleBtn.style.border = 'none';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    toggleBtn.style.display = 'flex';
    toggleBtn.style.alignItems = 'center';
    toggleBtn.style.justifyContent = 'center';
    toggleBtn.style.fontSize = '24px';
    toggleBtn.style.transition = 'all 0.2s ease';
    
    if (currentTheme === 'dark') {
        toggleBtn.innerHTML = '☀️';
        toggleBtn.style.backgroundColor = '#1A1626';
        toggleBtn.style.color = '#fff';
    } else {
        toggleBtn.innerHTML = '🌙';
        toggleBtn.style.backgroundColor = '#fff';
        toggleBtn.style.color = '#000';
    }

    document.body.appendChild(toggleBtn);
    toggleBtn.addEventListener('click', toggleTheme);
  }

  // --- Navigation Logic ---
  // A mapping of the sequence
  const sequence = [
    { page: 'index', triggerId: 'begin-action' },
    { page: 'question1', triggerId: 'submit-btn' },
    { page: 'question2', triggerId: 'submit-btn' },
    { page: 'question3', triggerId: 'submitBtn' },
    { page: 'verification', triggerId: 'sim-success' }, // Assume simulation success triggers next
    { page: 'conclusion', triggerId: 'continue' }, // If there is a continue on conclusion
    { page: 'poster', triggerId: null }
  ];

  // Also hook up "a" tags if any
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      let targetHref = link.getAttribute('href');
      if (targetHref && targetHref.endsWith('.html') && !targetHref.startsWith('http')) {
        e.preventDefault();
        targetHref = targetHref.replace('-dark.html', '.html');
        if (currentTheme === 'dark') {
            targetHref = targetHref.replace('.html', '-dark.html');
        }
        window.location.href = targetHref;
      }
    });
  });

  // Wire up the sequential buttons
  const currentPageBase = (window.location.pathname.split('/').pop() || 'index.html').replace('-dark.html', '.html').replace('.html', '');
  const currentIndex = sequence.findIndex(item => item.page === currentPageBase);
  
  if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
    const nextItem = sequence[currentIndex + 1];
    const triggerId = sequence[currentIndex].triggerId;
    
    if (triggerId) {
      const btn = document.getElementById(triggerId);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          let targetUrl = nextItem.page + '.html';
          if (currentTheme === 'dark') {
            targetUrl = nextItem.page + '-dark.html';
          }
          window.location.href = targetUrl;
        });
      }
    }
  }

  // Special case for conclusion to poster
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(btn => {
    if (btn.innerText && (btn.innerText.toLowerCase().includes('reveal') || btn.innerText.toLowerCase().includes('certificate'))) {
      btn.addEventListener('click', () => {
         window.location.href = currentTheme === 'dark' ? 'poster-dark.html' : 'poster.html';
      });
    }
  });

});
