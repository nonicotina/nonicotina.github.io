/* ================================================================
   i18n.js – переводы, смена языка, стилевые переопределения
   ================================================================ */

// --- Хранилище ---
const translations = {};
let currentLang = 'ru'; // глобальная переменная для script.js
window.currentLang = currentLang; // пробрасываем в window

// Базовые переводы (без стилевых переопределений)
window._baseTranslations = window._baseTranslations || {};

// --- Загрузка базового перевода ---
async function loadTranslations(lang) {
  if (translations[lang]) return translations[lang]; // уже загружено
  const map = { ru: 'rus', en: 'eng', uk: 'ukr', fr: 'fra' };
  const file = map[lang] || 'rus';
  try {
    const res = await fetch(`/locale/${file}.json`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    // Сохраняем как базовый, если ещё нет
    if (!window._baseTranslations[lang]) {
      window._baseTranslations[lang] = { ...data };
    }
    // Обновляем текущий перевод (пока без стиля)
    translations[lang] = { ...data };
    return translations[lang];
  } catch (err) {
    console.error('Failed to load translations:', err);
    // Fallback – пустой объект
    return {};
  }
}

// --- Применение переводов к DOM ---
function applyTranslations(lang, data) {
  if (!data) return;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (data[key]) el.textContent = data[key];
  });
  // Обновить title
  document.title = data.site_title || 'NoNicotina';
  // Обновить логотип (текст через data-text)
  const logo = document.querySelector('.logo');
  if (logo && data.logo_text) {
    logo.setAttribute('data-text', data.logo_text);
  }
}

// --- Загрузка и применение стилевых переопределений ---
async function applyStyleOverrides(style, lang) {
  // normal – без переопределений, просто восстанавливаем базовый перевод
  const base = window._baseTranslations[lang];
  if (!base) return;

  if (!style || style === 'normal') {
    // Восстанавливаем базовый перевод
    translations[lang] = { ...base };
    applyTranslations(lang, translations[lang]);
    return;
  }

  // Попытка загрузить файл стиля
  const map = { ru: 'rus', en: 'eng', uk: 'ukr', fr: 'fra' };
  const langPrefix = map[lang] || 'rus';
  try {
    const res = await fetch(`/locale/styles/${langPrefix}_${style}.json`);
    if (!res.ok) {
      // Нет файла стиля – используем базовый
      translations[lang] = { ...base };
      applyTranslations(lang, translations[lang]);
      return;
    }
    const overrides = await res.json();
    // Слияние: базовый + переопределения
    translations[lang] = { ...base, ...overrides };
    applyTranslations(lang, translations[lang]);
  } catch (e) {
    console.warn('Style overrides not loaded:', e);
    // При ошибке – базовый
    translations[lang] = { ...base };
    applyTranslations(lang, translations[lang]);
  }
}

// --- Смена языка ---
async function changeLanguage(lang) {
  if (!['ru','en','uk','fr'].includes(lang)) lang = 'ru';
  // Загружаем базовый перевод (если ещё нет)
  await loadTranslations(lang);
  // Применяем текущий стиль (если есть)
  const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  const style = settings.style || 'normal';
  const address = settings.address || 'formal';
  // effectiveStyle: если style не normal, используем style; иначе – address (обращение)
  const effectiveStyle = style !== 'normal' ? style : address;
  await applyStyleOverrides(effectiveStyle, lang);

  // Сохраняем текущий язык глобально и в localStorage
  currentLang = lang;
  window.currentLang = lang;
  localStorage.setItem('lang', lang);

  // Обновляем активный язык в дропдауне (если есть)
  const currentFlag = document.querySelector('.lang-current img');
  const selectedLi = document.querySelector(`.lang-dropdown li[data-lang="${lang}"] img`);
  if (currentFlag && selectedLi) {
    currentFlag.src = selectedLi.src;
    currentFlag.alt = selectedLi.alt;
  }
  document.querySelector('.lang-dropdown')?.classList.remove('active');
}

// Экспорт в глобальную область видимости
window.applyStyleOverrides = applyStyleOverrides;
window.changeLanguage = changeLanguage;

// --- Автоинициализация при загрузке страницы ---
(async () => {
  const savedLang = localStorage.getItem('lang') || navigator.language.split('-')[0] || 'ru';
  const supported = ['ru','en','uk','fr'];
  const lang = supported.includes(savedLang) ? savedLang : 'ru';
  await changeLanguage(lang);
})();