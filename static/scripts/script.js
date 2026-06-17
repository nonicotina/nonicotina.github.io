/* ================================================================
   script.js – вся логика, кроме i18n (он в i18n.js)
   ================================================================ */

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLangSwitch();
  initVersionSwitch();
  initMobileMenu();
  initSettingsModal();
  initBVIControls();
  initCounters();
  initSmoothScroll();
  initFAQ();
});

// ===================== ТЕМЫ =====================
function initTheme() {
  const saved = localStorage.getItem('theme') || 'system';
  setTheme(saved);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });
  // Отслеживание системной темы
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (document.documentElement.getAttribute('data-theme') === 'system') {
      updateMetaThemeColor();
    }
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
  updateMetaThemeColor();
}

function updateMetaThemeColor() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (document.documentElement.getAttribute('data-theme') === 'system' &&
     window.matchMedia('(prefers-color-scheme: dark)').matches);
  const color = isDark ? '#000000' : '#FFFFFF';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', color);
}

// ===================== ЯЗЫК =====================
function initLangSwitch() {
  const currentBtn = document.querySelector('.lang-current');
  const dropdown = document.querySelector('.lang-dropdown');
  if (!currentBtn || !dropdown) return;

  currentBtn.addEventListener('click', () => {
    dropdown.classList.toggle('active');
  });

  dropdown.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      changeLanguage(li.dataset.lang); // из i18n.js
    });
  });

  // Закрытие по клику вне дропдауна
  document.addEventListener('click', (e) => {
    if (!currentBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
}

// ===================== ПК / МОБИЛЬНАЯ ВЕРСИЯ =====================
function initVersionSwitch() {
  const btn = document.getElementById('versionSwitch');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.body.classList.toggle('force-mobile');
    const isMobile = document.body.classList.contains('force-mobile');
    localStorage.setItem('version', isMobile ? 'mobile' : 'desktop');
  });
  // Восстановить сохранённую версию
  if (localStorage.getItem('version') === 'mobile') {
    document.body.classList.add('force-mobile');
  }
}

// ===================== МОБИЛЬНОЕ МЕНЮ =====================
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navList = document.querySelector('.nav-list');
  if (!hamburger || !navList) return;

  hamburger.addEventListener('click', () => {
    navList.classList.toggle('open');
    const expanded = navList.classList.contains('open');
    hamburger.setAttribute('aria-expanded', expanded);
  });

  // Закрыть меню при клике на ссылку
  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
}

// ===================== НАСТРОЙКИ (МОДАЛЬНОЕ ОКНО) =====================
function initSettingsModal() {
  const settingsBtn = document.getElementById('settingsBtn');
  const modal = document.getElementById('settingsModal');
  const closeBtn = document.getElementById('closeSettingsModal');
  if (!settingsBtn || !modal) return;

  settingsBtn.addEventListener('click', () => modal.classList.add('open'));
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Инициализация элементов управления настройками
  initSettingControls();
}

function initSettingControls() {
  const fontSizeRange = document.getElementById('fontSizeRange');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const scaleRange = document.getElementById('scaleRange');
  const scaleValue = document.getElementById('scaleValue');
  const contrastRange = document.getElementById('contrastRange');

  if (fontSizeRange) {
    fontSizeRange.addEventListener('input', () => {
      const val = fontSizeRange.value + 'px';
      document.documentElement.style.setProperty('--font-base', val);
      if (fontSizeValue) fontSizeValue.textContent = val;
      saveSetting('fontSize', fontSizeRange.value);
    });
  }
  if (scaleRange) {
    scaleRange.addEventListener('input', () => {
      const val = scaleRange.value;
      document.documentElement.style.setProperty('--font-scale', val);
      if (scaleValue) scaleValue.textContent = Math.round(val * 100) + '%';
      saveSetting('scale', val);
    });
  }
  if (contrastRange) {
    contrastRange.addEventListener('input', () => {
      document.documentElement.style.setProperty('--contrast', contrastRange.value);
      saveSetting('contrast', contrastRange.value);
    });
  }

  // Селекты
  const addressSelect = document.getElementById('addressSelect');
  const styleSelect = document.getElementById('styleSelect');
  if (addressSelect) {
    addressSelect.addEventListener('change', () => {
      const val = addressSelect.value;
      document.body.classList.remove('address-formal', 'address-informal');
      document.body.classList.add('address-' + val);
      saveSetting('address', val);
    });
  }
  if (styleSelect) {
    styleSelect.addEventListener('change', () => {
      const val = styleSelect.value;
      document.body.classList.remove('style-formal', 'style-informal', 'style-normal', 'style-friendly');
      document.body.classList.add('style-' + val);
      saveSetting('style', val);
    });
  }

  // Восстановление сохранённых настроек
  loadSavedSettings();
}

function saveSetting(key, value) {
  const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  settings[key] = value;
  localStorage.setItem('userSettings', JSON.stringify(settings));
}

function loadSavedSettings() {
  const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  if (settings.fontSize) {
    document.documentElement.style.setProperty('--font-base', settings.fontSize + 'px');
    const range = document.getElementById('fontSizeRange');
    const val = document.getElementById('fontSizeValue');
    if (range) range.value = settings.fontSize;
    if (val) val.textContent = settings.fontSize + 'px';
  }
  if (settings.scale) {
    document.documentElement.style.setProperty('--font-scale', settings.scale);
    const range = document.getElementById('scaleRange');
    const val = document.getElementById('scaleValue');
    if (range) range.value = settings.scale;
    if (val) val.textContent = Math.round(settings.scale * 100) + '%';
  }
  if (settings.contrast) {
    document.documentElement.style.setProperty('--contrast', settings.contrast);
    const range = document.getElementById('contrastRange');
    if (range) range.value = settings.contrast;
  }
  if (settings.address) {
    document.body.classList.remove('address-formal', 'address-informal');
    document.body.classList.add('address-' + settings.address);
    const select = document.getElementById('addressSelect');
    if (select) select.value = settings.address;
  }
  if (settings.style) {
    document.body.classList.remove('style-formal', 'style-informal', 'style-normal', 'style-friendly');
    document.body.classList.add('style-' + settings.style);
    const select = document.getElementById('styleSelect');
    if (select) select.value = settings.style;
  }
}

// ===================== BVI (слабовидящие) =====================
function initBVIControls() {
  // Открытие/закрытие панели BVI
  const bviPanel = document.getElementById('bviPanel');
  if (!bviPanel) return;

  // Кнопка скрытия панели
  document.getElementById('bviHide')?.addEventListener('click', () => {
    document.body.classList.remove('bvi-active');
  });

  // Кнопка сброса BVI (обычная версия)
  document.getElementById('bviReset')?.addEventListener('click', () => {
    document.body.classList.remove('bvi-active');
    // Сбросить все BVI-стили (можно добавить очистку)
  });

  // Иконка для слабовидящих (предположим, где-то есть кнопка .bvi-toggle-btn)
  const bviToggleBtn = document.querySelector('.bvi-toggle-btn');
  bviToggleBtn?.addEventListener('click', () => {
    document.body.classList.toggle('bvi-active');
  });

  // Обработчики для блоков BVI (шрифт, размер, цвет, изображения, речь)
  // Шрифт
  bviPanel.querySelectorAll('.bvi-block-font .bvi-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      bviPanel.querySelectorAll('.bvi-block-font .bvi-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      if (link.classList.contains('bvi-font-family-arial')) {
        document.body.style.fontFamily = 'Arial, sans-serif';
      } else if (link.classList.contains('bvi-font-family-times')) {
        document.body.style.fontFamily = '"Times New Roman", serif';
      }
    });
  });

  // Размер шрифта BVI
  bviPanel.querySelectorAll('.bvi-block-fontSize .bvi-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      bviPanel.querySelectorAll('.bvi-block-fontSize .bvi-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const size = link.dataset.fontsize;
      if (size) {
        document.documentElement.style.setProperty('--font-base', size + 'px');
        document.getElementById('fontSizeRange')?.setAttribute('value', size);
        const valEl = document.getElementById('fontSizeValue');
        if (valEl) valEl.textContent = size + 'px';
      }
    });
  });

  // Цветопередача BVI
  bviPanel.querySelectorAll('.bvi-block-color .bvi-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      bviPanel.querySelectorAll('.bvi-block-color .bvi-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const theme = link.dataset.theme;
      document.body.setAttribute('data-bvi-theme', theme);
    });
  });

  // Изображения
  bviPanel.querySelector('.bvi-images-on')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.remove('bvi-images-off', 'bvi-images-grayscale');
    document.body.classList.add('bvi-images-on');
  });
  bviPanel.querySelector('.bvi-images-off')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.add('bvi-images-off');
    document.body.classList.remove('bvi-images-on', 'bvi-images-grayscale');
  });
  bviPanel.querySelector('.bvi-images-grayscale')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.add('bvi-images-grayscale');
    document.body.classList.remove('bvi-images-on', 'bvi-images-off');
  });

  // Синтез речи (заглушка)
  bviPanel.querySelector('.bvi-speech-on')?.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      const text = document.body.textContent;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  });
  bviPanel.querySelector('.bvi-speech-off')?.addEventListener('click', () => {
    speechSynthesis.cancel();
  });
}

// ===================== АНИМАЦИЯ СЧЁТЧИКОВ =====================
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.count;
        animateValue(el, 0, target, 2000);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateValue(el, start, end, duration) {
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(progress * (end - start) + start);
    el.textContent = current + (end > 99 ? '+' : '');
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

// ===================== ПЛАВНЫЙ СКРОЛЛ =====================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // Обновить URL хеш
        history.pushState(null, null, href);
      }
    });
  });
}

// ===================== FAQ (аккордеон) =====================
function initFAQ() {
  // Просто нативное поведение details, можно добавить анимацию
  const details = document.querySelectorAll('.faq-item');
  details.forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) {
        // подсветка или анимация
      }
    });
  });
}

// ===================== ПРОЧЕЕ =====================
// Можно добавить дополнительные фичи: модалка для контактов, форма подписки и т.д.
// Пока оставим как есть.