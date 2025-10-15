const API = `${location.origin}/api`;

const lotSelect = document.getElementById('lotSelect');
const refreshBtn = document.getElementById('refreshBtn');
const spacesBody = document.getElementById('spacesBody');
const message = document.getElementById('message');

const lotName = document.getElementById('lotName');
const spotNumber = document.getElementById('spotNumber');
const plate = document.getElementById('plate');
const amount = document.getElementById('amount');
const payBtn = document.getElementById('payBtn');
const payResult = document.getElementById('payResult');

function badge(cls, text) {
  const s = document.createElement('span');
  s.className = `badge ${cls}`;
  s.textContent = text;
  return s;
}

async function api(path, opts) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (!res.ok) {
    let err = 'Request failed';
    try { const j = await res.json(); err = j.error || err; } catch {}
    throw new Error(err);
  }
  return res.json();
}

async function loadLots() {
  message.textContent = 'Loading lots…';
  try {
    const lots = await api('/lots');
    lotSelect.innerHTML = lots.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    lotName.textContent = lots[0]?.name || '—';
    message.textContent = '';
  } catch (e) {
    message.textContent = e.message;
  }
}

async function loadSpaces() {
  const lotId = Number(lotSelect.value);
  if (!lotId) return;
  message.textContent = 'Loading spaces…';
  try {
    const spaces = await api(`/lots/${lotId}/spaces`);
    spacesBody.innerHTML = '';
    for (const s of spaces) {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.textContent = s.number;
      tr.appendChild(tdNum);

      const tdType = document.createElement('td');
      tdType.appendChild(s.isQuick15 ? badge('quick', 'Quick-15') : badge('ok', 'Normal'));
      tr.appendChild(tdType);

      const tdAvail = document.createElement('td');
      if (s.isQuick15) {
        tdAvail.appendChild(badge(s.isAvailable ? 'ok' : 'no', s.isAvailable ? 'Check visually' : 'Likely busy'));
      } else {
        tdAvail.appendChild(badge(s.isAvailable ? 'ok' : 'no', s.isAvailable ? 'Available' : 'Unavailable'));
      }
      tr.appendChild(tdAvail);

      spacesBody.appendChild(tr);
    }
    message.textContent = `${spaces.length} spots`;
  } catch (e) {
    message.textContent = e.message;
  }
}

lotSelect.addEventListener('change', async () => {
  const opt = lotSelect.options[lotSelect.selectedIndex];
  lotName.textContent = opt?.textContent || '—';
  await loadSpaces();
});

refreshBtn.addEventListener('click', loadSpaces);

payBtn.addEventListener('click', async () => {
  const lotId = Number(lotSelect.value);
  const body = {
    lotId,
    spotNumber: Number(spotNumber.value),
    plate: String(plate.value).trim(),
    amount: Number(amount.value)
  };
  payResult.textContent = 'Processing…';
  try {
    const r = await api('/pay', { method: 'POST', body: JSON.stringify(body) });
    payResult.textContent = `Success: Spot ${r.spaceNumber} for plate ${r.plate}. Time: ${r.minutes} min. Ends at ${new Date(r.endsAt).toLocaleString()}.`;
    await loadSpaces();
  } catch (e) {
    payResult.textContent = `Error: ${e.message}`;
  }
});

(async function init() {
  await loadLots();
  await loadSpaces();
})();
