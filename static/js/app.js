const CURRENCIES = {
  USD: { name: 'US Dollar',          symbol: '$',    flag: '🇺🇸' },
  EUR: { name: 'Euro',               symbol: '€',    flag: '🇪🇺' },
  GBP: { name: 'British Pound',      symbol: '£',    flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen',       symbol: '¥',    flag: '🇯🇵' },
  CAD: { name: 'Canadian Dollar',    symbol: 'CA$',  flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar',  symbol: 'A$',   flag: '🇦🇺' },
  CHF: { name: 'Swiss Franc',        symbol: 'CHF',  flag: '🇨🇭' },
  CNY: { name: 'Chinese Yuan',       symbol: 'CN¥',  flag: '🇨🇳' },
  INR: { name: 'Indian Rupee',       symbol: '₹',    flag: '🇮🇳' },
  BRL: { name: 'Brazilian Real',     symbol: 'R$',   flag: '🇧🇷' },
  NGN: { name: 'Nigerian Naira',     symbol: '₦',    flag: '🇳🇬' },
  ZAR: { name: 'S. African Rand',    symbol: 'R',    flag: '🇿🇦' },
  SGD: { name: 'Singapore Dollar',   symbol: 'S$',   flag: '🇸🇬' },
  HKD: { name: 'Hong Kong Dollar',   symbol: 'HK$',  flag: '🇭🇰' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$',  flag: '🇳🇿' },
  SEK: { name: 'Swedish Krona',      symbol: 'kr',   flag: '🇸🇪' },
  KRW: { name: 'South Korean Won',   symbol: '₩',    flag: '🇰🇷' },
  MXN: { name: 'Mexican Peso',       symbol: 'MX$',  flag: '🇲🇽' },
  AED: { name: 'UAE Dirham',         symbol: 'AED',  flag: '🇦🇪' },
  SAR: { name: 'Saudi Riyal',        symbol: 'SAR',  flag: '🇸🇦' },
  TRY: { name: 'Turkish Lira',       symbol: '₺',    flag: '🇹🇷' },
};

const rateCache = new Map();

const amountInput     = document.getElementById('amountInput');
const fromSelect      = document.getElementById('fromCurrencySelect');
const toSelect        = document.getElementById('toCurrencySelect');
const fromFlag        = document.getElementById('fromFlag');
const toFlag          = document.getElementById('toFlag');
const convertedResult = document.getElementById('convertedResult');
const rateDisplay     = document.getElementById('rateDisplay');
const feesDisplay     = document.getElementById('feesDisplay');
const convertBtn      = document.getElementById('convertBtn');
const statusBanner    = document.getElementById('statusBanner');
const statusMessage   = document.getElementById('statusMessage');
const swapBtn = document.getElementById('swapBtn');

function sym(code) { return CURRENCIES[code]?.symbol || ''; }

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

function populateSelects() {
  const codes = Object.keys(CURRENCIES).sort();
  const opts = (selected) =>
    codes.map(c =>
      `<option value="${c}"${c === selected ? ' selected' : ''}>${c}</option>`
    ).join('');

  fromSelect.innerHTML = opts('USD');
  toSelect.innerHTML   = opts('EUR');
}

function updateFlags() {
  fromFlag.textContent = CURRENCIES[fromSelect.value]?.flag || '';
  toFlag.textContent   = CURRENCIES[toSelect.value]?.flag   || '';
}

function calculate() {
  const base   = fromSelect.value;
  const target = toSelect.value;
  const cached = rateCache.get(base);
  const rawVal = String(amountInput.value || '').replace(/,/g, '');
  const amount = parseFloat(rawVal);

  if (isNaN(amount) || amount < 0) {
    convertedResult.textContent = `${sym(target)}0.00`;
    rateDisplay.textContent = '—';
    return;
  }

  if (cached && cached.rates && cached.rates[target] !== undefined) {
    const rate      = cached.rates[target];
    const converted = amount * rate;

    convertedResult.textContent = `${sym(target)}${formatAmount(converted, target)}`;
    rateDisplay.textContent     = `${sym(base)}1 = ${sym(target)}${formatRate(rate)}`;
    feesDisplay.textContent     = `${sym(base)}0.00`;
  } else {
    convertedResult.textContent = '—';
    rateDisplay.textContent     = 'Unavailable';
  }
}

async function swapCurrencies() {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  updateFlags();
  await fetchRates(fromSelect.value);
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
    hideStatus();
    calculate();
  } catch (err) {
    console.error(err);
    showStatus(`Could not fetch rates: ${err.message}`, true);
  }
}

amountInput.addEventListener('input', calculate);

swapBtn.addEventListener('click', swapCurrencies);

fromSelect.addEventListener('change', async () => {
  updateFlags();
  await fetchRates(fromSelect.value);
});

toSelect.addEventListener('change', () => {
  updateFlags();
  calculate();
});

convertBtn.addEventListener('click', async () => {
  await fetchRates(fromSelect.value, true);
});

document.addEventListener('DOMContentLoaded', async () => {
  populateSelects();
  updateFlags();
  await fetchRates('USD');
});
