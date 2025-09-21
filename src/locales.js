export const translations = {}

const language = navigator.language.split('-')[0]

document.querySelectorAll(".switch-lang").forEach(el => {
  if (el.dataset.lang === localStorage.getItem('lang')) {
    el.classList.add('active-lang')
  }
  
  el.addEventListener('click', async () => {
  await loadTranslations(el.dataset.lang)
  setLanguage(el.dataset.lang)
  document.querySelectorAll('.switch-lang').forEach(el => {
    el.classList.remove('active-lang')
  })
  if (localStorage.getItem('lang') === el.dataset.lang) {
    el.classList.add('active-lang')
    localStorage.setItem('lang', el.dataset.lang)
  }
})
})

export async function getTranslations(name) {
  const lang = document.documentElement.lang
  return translations[lang][name]
}

async function loadTranslations(lang = language) {
  if (translations[lang]) return

  try {
    const response = await fetch(`./locales/${lang}.json`)
    translations[lang] = await response.json()
  } catch (err) {
    console.error('Fail')
  }
}

export function setErrors(lang = language) {
  const el = document.querySelector('[data-error-name]')
  
  const key = el.dataset.errorName;
  const translation = translations[lang][key]
  if (translation) {
    el.textContent = translation
  }
}

export function setLanguage(lang) {
   document.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.dataset.i18nKey;
    const translation = translations[lang][key];
    if (translation) {
      element.textContent = translation;
    }
  });

  document.querySelectorAll('[data-i18n-key-placeholder]').forEach(element => {
    const key = element.dataset.i18nKeyPlaceholder;
    const translation = translations[lang][key];
    if (translation) {
      element.placeholder = translation;
    }
  });

  const el = document.querySelector('[data-error-name]')
  const key = el.dataset.errorName;
  const translation = translations[lang][key]
  if (translation) {
    el.textContent = translation
  }

  document.querySelectorAll('[data-i18n-res]').forEach(el => {
    const key = el.dataset.i18nRes
    const translation = translations[lang][key]
    if (translation) {
      if (el.innerHTML.includes('Бесконечность') || el.innerHTML.includes('Infinity')) {
        el.innerHTML = el.innerHTML.replaceAll('Бесконечность', translation)
        el.innerHTML = el.innerHTML.replaceAll('Infinity', translation)
      } 
      
    }
  })

  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang)
}

async function initLocation() {
  const currentLang = localStorage.getItem('lang') || language
  await loadTranslations(currentLang)
  setLanguage(currentLang)
  localStorage.setItem('lang', currentLang);
}
document.addEventListener('DOMContentLoaded', initLocation());