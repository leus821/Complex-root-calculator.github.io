import { evaluate, format, nthRoots } from 'mathjs';
import { setLanguage } from './locales';
const outputContainer = document.querySelector('.calculator__input');
const degreeContainer = document.querySelector('.sqrt-degree');
const anserWrapper = document.querySelector('.sqrt-wrapper');
const errorContainer = document.querySelector('.errors');
const accuracyContainer = document.querySelector('.calculator_button-accuracy');
const outputForm = document.querySelector('.output-form');
const accuracyForm = document.querySelector('.calculator_button-form');
const degreeForm = document.querySelector('.degree-form');
const wrapperContainer = document.querySelector('.sqrt-wrapper');

function getCurrentElement() {
  const activeElement = document.querySelector('.active');
  return {
    name: activeElement.classList.contains('sqrt-degree') ? 'degree' : 'output',
    element: activeElement,
  };
}

function isSero(button) {
  return button.classList.contains('calculator_button-zero');
}

function clearResults() {
  document.querySelectorAll('.result, .equal-sign, .results').forEach((el) => {
    el.remove();
  });
}

function saveState() {
  localStorage.setItem('output', JSON.stringify(outputContainer.value));
  localStorage.setItem('degree', JSON.stringify(degreeContainer.value));
}

function insertAtCursor(element, text) {
  const startPos = element.selectionStart;
  const endPos = element.selectionEnd;
  element.value = element.value.substring(0, startPos) + text + element.value.substring(endPos);
  const newCursorPos = startPos + text.length;
  element.setSelectionRange(newCursorPos, newCursorPos);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

function formatInput(element) {
  const originalValue = element.value;
  const cursorPosition = element.selectionStart;
  
  const allowedTokens = originalValue.match(/(\d+\.?\d*|\.\d+|sin|cos|i|[()+\-*/^])/g);
  let cleanedValue = allowedTokens ? allowedTokens.join('') : '';

  cleanedValue = cleanedValue
    .replace(/[\d.i]+/g, (numberStr) => {
      const hasI = numberStr.includes('i');
      let numericPart = numberStr.replace(/[^0-9.]/g, '');
      const dotParts = numericPart.split('.');
      if (dotParts.length > 2) {
        numericPart = dotParts[0] + '.' + dotParts.slice(1).join('');
      }
      if (hasI) { return numericPart ? numericPart + 'i' : 'i'; }
      return numericPart;
    })

    .replace(/(sin|cos|[+*/i.-])\^/g, '$1')
    
    .replace(/\b0+(\d)/g, '$1')
    .replace(/([+\-*/.^]{2,})/g, (match) => match.charAt(0))

    .replace(/\([*/+]/g, '(')
    
    .replace(/([+\-*/^])\)/g, '$1')
    .replace(/\(\)/g, '(')
    .replace(/^[+*/^]/, '');

  if (originalValue !== cleanedValue) {
    element.value = cleanedValue;
    const diff = originalValue.length - cleanedValue.length;
    const newCursorPos = Math.max(0, cursorPosition - diff);
    element.setSelectionRange(newCursorPos, newCursorPos);
    
  }
  scrollInputToEnd(element)
  saveState();
}

function scrollInputToEnd(element) {
  element.scrollLeft = element.scrollWidth;
}


function formatDegree() {
  const originalValue = degreeContainer.value;
  const cleanedValue = originalValue
    .replace(/\D/g, '') // Удаляем все не-цифры
    .replace(/^0/, '')   // Убираем ноль в начале
    .slice(0, 2);       // Ограничиваем до 2 символов
  if (originalValue !== cleanedValue) {
    degreeContainer.value = cleanedValue;
  }
}

function getResult(accuracyValue = 8) {
  const outputValue = outputContainer.value;
  const degreeValue = degreeContainer.value;
  if (!outputValue) return;
  clearResults();
  errorContainer.innerHTML = '';

  if ('./*-+('.includes(outputValue.slice(-1))) {
    errorContainer.setAttribute('data-error-name', 'sign');
    setLanguage(localStorage.getItem('lang') || 'ru');
    return;
  }

  try {
    const result = nthRoots(evaluate(outputValue), degreeValue);
    anserWrapper.insertAdjacentHTML('beforeend', `<div class='equal-sign'>=</div>`);
    const accuracy = result == 0 ? 1 : +accuracyValue > 100 ? 100 : accuracyValue || 8;
    anserWrapper.insertAdjacentHTML('beforeend', `<div class='results'></div>`);
    result.forEach((el, i) => {
      const lang = document.documentElement.lang
      let res = format(el, { precision: accuracy, notation: 'fixed' });
      if (lang === 'ru' && res.includes('Infinity')) {
        res = res.replaceAll('Infinity', 'Бесконечность')
      } else if (lang === 'en' && res.includes('Бесконечность')) {
        res = res.replaceAll('Бесконечность', 'Infinity')
      }
      document.querySelector('.results').insertAdjacentHTML('beforeend', `<div class='result'>${i + 1}) <span data-i18n-res='result'>${res}</span></div>`);
    });
    outputContainer.style.width = wrapperContainer.scrollWidth + 'px';
  } catch (err) {
    errorContainer.setAttribute('data-error-name', 'unexpected');
    setLanguage(localStorage.getItem('lang') || 'ru');
    console.error(err);
  }
}

function App() {
  outputContainer.value = JSON.parse(localStorage.getItem('output')) || '';
  formatInput(outputContainer);
  degreeContainer.value = JSON.parse(localStorage.getItem('degree')) || '2';
  formatDegree();

  outputContainer.addEventListener('input', () => formatInput(outputContainer));
  degreeContainer.addEventListener('input', () => {
    formatDegree();
    saveState();
  });

  const interactiveButtons = document.querySelectorAll('.calculator__button:not(.calculator_button-accuracy)');
  interactiveButtons.forEach(button => {
    button.addEventListener('mousedown', (e) => e.preventDefault());
  });

  const numberButtons = document.querySelectorAll('.calculator_button-number');
  numberButtons.forEach(button => {
    button.addEventListener('click', () => {
      const activeElement = getCurrentElement().element;
      if (isSero(button) && !activeElement.value) return;
      insertAtCursor(activeElement, button.innerHTML);
    });
  });

  const backSpace = document.querySelector('.calculator_button-backSpace');
  backSpace.addEventListener('click', () => {
    const el = getCurrentElement().element;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === 0 && end === 0) return;
    const isSelection = start !== end;
    el.value = el.value.substring(0, start - (isSelection ? 0 : 1)) + el.value.substring(end);
    el.selectionStart = el.selectionEnd = start - (isSelection ? 0 : 1);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

  const clearButton = document.querySelector('.calculator_button-clear');
  clearButton.addEventListener('click', () => {
    outputContainer.value = '';
    degreeContainer.value = '2';
    accuracyContainer.value = '';
    clearResults();
    saveState();
    outputContainer.style.width = '100%';
  });

  const resButton = document.querySelector('.calculator__button-result');
  resButton.addEventListener('click', () => getResult(+accuracyContainer.value));

  const navButtons = document.querySelectorAll('.calculator__button-nav');
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const el = getCurrentElement().element;
      el.focus();
      const pos = el.selectionStart;
      const dir = button.dataset.nav === 'left' ? -1 : 1;
      const newPos = Math.max(0, pos + dir);
      el.setSelectionRange(newPos, newPos);
    });
  });

  outputContainer.addEventListener('focus', (e) => {
    degreeContainer.classList.remove('active');
    e.target.classList.add('active');
  });

  degreeContainer.addEventListener("focus", (e) => {
    outputContainer.classList.remove('active');
    e.target.classList.add('active');
  });

  degreeContainer.addEventListener('blur', () => {
    if (degreeContainer.value.trim() === '') {
      degreeContainer.value = '2';
      saveState();
    }
  });

  outputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    getResult(+accuracyContainer.value);
  });
  accuracyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.children[0];
    if (!input.value) return;
    if (input.value > 100) input.value = 100;
    if (input.value < 1) input.value = 1;
    getResult(+input.value);
  });
  degreeForm.addEventListener('submit', (e) => {
    e.preventDefault()
    getResult(+accuracyContainer.value)
  });
}

App();