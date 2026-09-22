let availableCurrencies = [];
let selectedFrom = 'USD';
let selectedTo = 'EUR';
let activePickerTarget = 'from';

const rateCache = new Map();

const displayNames = (typeof Intl !== 'undefined' && Intl.DisplayNames)
  ? new Intl.DisplayNames(['en'], { type: 'currency' })
  : null;

const amountInput         = document.getElementById('amountInput');
const fromCurrencyBtn     = document.getElementById('fromCurrencyBtn');
const toCurrencyBtn       = document.getElementById('toCurrencyBtn');
const fromFlag            = document.getElementById('fromFlag');
const toFlag              = document.getElementById('toFlag');
const fromCode            = document.getElementById('fromCode');
const toCode              = document.getElementById('toCode');
const convertedResult     = document.getElementById('convertedResult');
const rateDisplay         = document.getElementById('rateDisplay');
const feesDisplay         = document.getElementById('feesDisplay');
const convertBtn          = document.getElementById('convertBtn');
const statusBanner        = document.getElementById('statusBanner');
const statusMessage       = document.getElementById('statusMessage');

const currencyModal       = document.getElementById('currencyModal');
const modalCloseBtn       = document.getElementById('modalCloseBtn');
const currencySearchInput = document.getElementById('currencySearchInput');
const currencyList        = document.getElementById('currencyList');

function getCurrencyName(code) {
  if (displayNames) {
    try {
      const name = displayNames.of(code);
      if (name && name !== code) return name;
    } catch (e) {}
  }
  return code;
}

function getFlag(code) {
  if (code === 'EUR') return '🇪🇺';
  if (code === 'BTC') return '₿';
  if (code === 'XAU') return '🥇';
  if (code === 'XAG') return '🥈';
  const countryCode = code.slice(0, 2).toUpperCase();
  if (countryCode.length !== 2) return '🌐';
  return countryCode
    .split('')
    .map(c => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('');
}

function sym(code) {
  try {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).formatToParts(1);
    const currPart = parts.find(p => p.type === 'currency');
    return currPart ? currPart.value : code;
  } catch (e) {
    return code;
  }
}

function formatAmount(value, code) {
  const noDecimals = code === 'JPY' || code === 'KRW';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  }).format(value);
}

function formatRate(rate) {
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 1)   return rate.toFixed(4);
  return rate.toFixed(6);
}

function showStatus(msg, isError = false) {
  statusBanner.classList.remove('hidden');
  statusMessage.textContent = msg;
  statusBanner.style.color = isError ? '#e53e3e' : '#888';
}

function hideStatus() { statusBanner.classList.add('hidden'); }

function updatePickerUI() {
  fromFlag.textContent = getFlag(selectedFrom);
  fromCode.textContent = selectedFrom;

  toFlag.textContent = getFlag(selectedTo);
  toCode.textContent = selectedTo;
}

function calculate() {
  const rawVal = String(amountInput.value || '').replace(/,/g, '');
  const amount = parseFloat(rawVal);

  if (isNaN(amount) || amount < 0) {
    convertedResult.textContent = `${sym(selectedTo)}0.00`;
    rateDisplay.textContent = '—';
    return;
  }

  const cached = rateCache.get(selectedFrom);
  if (cached && cached.rates && cached.rates[selectedTo] !== undefined) {
    const rate      = cached.rates[selectedTo];
    const converted = amount * rate;

    convertedResult.textContent = `${sym(selectedTo)}${formatAmount(converted, selectedTo)}`;
    rateDisplay.textContent     = `${sym(selectedFrom)}1 = ${sym(selectedTo)}${formatRate(rate)}`;
    feesDisplay.textContent     = `${sym(selectedFrom)}0.00`;
  } else {
    convertedResult.textContent = '—';
    rateDisplay.textContent     = 'Unavailable';
  }
}

async function fetchRates(base, forceRefresh = false) {
  if (!forceRefresh && rateCache.has(base)) {
    calculate();
    return;
  }
  showStatus(`Fetching live rates for ${base}…`);
  try {
    const res = await fetch(`/get_rates/${base}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.rates) throw new Error(data.details || data.error || 'Invalid response');

    rateCache.set(base, { rates: data.rates });

    if (availableCurrencies.length === 0) {
      availableCurrencies = Object.keys(data.rates).sort();
    }

    hideStatus();
    calculate();
  } catch (err) {
    console.error(err);
    showStatus(`Could not fetch rates: ${err.message}`, true);
  }
}

function renderModalList(query = '') {
  const q = query.trim().toLowerCase();
  const currentSelected = activePickerTarget === 'from' ? selectedFrom : selectedTo;

  const filtered = availableCurrencies.filter(code => {
    if (!q) return true;
    const name = getCurrencyName(code).toLowerCase();
    return code.toLowerCase().includes(q) || name.includes(q);
  });

  if (filtered.length === 0) {
    currencyList.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: #8a8a8e; font-size: 0.9rem;">No currencies found matching "${query}"</div>`;
    return;
  }

  currencyList.innerHTML = filtered.map(code => {
    const flag = getFlag(code);
    const name = getCurrencyName(code);
    const isSelected = code === currentSelected;

    return `
      <button type="button" class="currency-item ${isSelected ? 'selected' : ''}" data-code="${code}">
        <div class="currency-item-left">
          <span class="currency-item-flag">${flag}</span>
          <div class="currency-item-info">
            <span class="currency-item-code">${code}</span>
            <span class="currency-item-name">${name}</span>
          </div>
        </div>
        ${isSelected ? '<span class="currency-item-check">✓</span>' : ''}
      </button>
    `;
  }).join('');
}

function openModal(target) {
  activePickerTarget = target;
  currencySearchInput.value = '';
  renderModalList();
  currencyModal.classList.remove('hidden');
  setTimeout(() => currencySearchInput.focus(), 50);
}

function closeModal() {
  currencyModal.classList.add('hidden');
}

fromCurrencyBtn.addEventListener('click', () => openModal('from'));
toCurrencyBtn.addEventListener('click', () => openModal('to'));
modalCloseBtn.addEventListener('click', closeModal);

currencyModal.addEventListener('click', (e) => {
  if (e.target === currencyModal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !currencyModal.classList.contains('hidden')) {
    closeModal();
  }
});

currencySearchInput.addEventListener('input', (e) => {
  renderModalList(e.target.value);
});

currencyList.addEventListener('click', async (e) => {
  const itemBtn = e.target.closest('.currency-item');
  if (!itemBtn) return;
  const code = itemBtn.dataset.code;
  if (!code) return;

  if (activePickerTarget === 'from') {
    selectedFrom = code;
    updatePickerUI();
    closeModal();
    await fetchRates(selectedFrom);
  } else {
    selectedTo = code;
    updatePickerUI();
    closeModal();
    calculate();
  }
});

amountInput.addEventListener('input', calculate);

convertBtn.addEventListener('click', async () => {
  await fetchRates(selectedFrom, true);
});

document.addEventListener('DOMContentLoaded', async () => {
  updatePickerUI();
  await fetchRates('USD');
  if (availableCurrencies.length === 0 && rateCache.has('USD')) {
    availableCurrencies = Object.keys(rateCache.get('USD').rates).sort();
  }
});
