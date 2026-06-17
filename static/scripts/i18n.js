const translations = {};
let currentLang = 'ru';

async function loadTranslations(lang) {
  if (translations[lang]) return translations[lang];
  const res = await fetch(`/locale/${lang === 'uk' ? 'ukr' : lang === 'fr' ? 'fra' : lang === 'en' ? 'eng' : 'rus'}.json`);
  const data = await res.json();
  translations[lang] = data;
  return data;
}

function applyTranslations(lang, data) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (data[key]) el.textContent = data[key];
  });
  // Обновить логотип через CSS (уже задано через content, только lang)
}

async function changeLanguage(lang) {
  const data = await loadTranslations(lang);
  applyTranslations(lang, data);
  localStorage.setItem('lang', lang);
  currentLang = lang;
}

// Инициализация при загрузке
(async () => {
  const savedLang = localStorage.getItem('lang') || navigator.language.split('-')[0];
  const supported = ['ru','en','uk','fr'];
  const lang = supported.includes(savedLang) ? savedLang : 'ru';
  await changeLanguage(lang);
})();