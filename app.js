const API_BASE = `${location.origin}/api`; // works when served by express
// If opening index.html directly from filesystem, fallback to localhost:3000
const directFile = location.protocol === 'file:';
const API = directFile ? 'http://localhost:3000/api' : API_BASE;

const lotSelect = document.getElementById('lotSelect');
const statusSelect = document.getElementById('statusSelect');
const refreshBtn = document.getElementById('refreshBtn');
const spacesBody = document.getElementById('spacesBody');
const message = document.getElementById('message');
const eventsList = document.getElementById('eventsList');

function setMsg(text) {
  message.textContent = text || '';
}

function badge(status) {
  const span = document.createElement('span');
  span.className = `badge ${status}`;
  span.textContent = status;
  return span;
}

async function api(path, options) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function loadLots() {
  setMsg('Loading lots…');
  try {
    const lots = await api('/lots');
    lotSelect.innerHTML = lots.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    setMsg('');
  } catch (e) {
    setMsg(`Failed to load lots: ${e.message}`);
  }
}

async function loadSpaces() {
  const lotId = lotSelect.value;
  const status = statusSelect.value;
  if (!lotId) return;

  setMsg('Loading spaces…');

  const query = new URLSearchParams({ lotId, ...(status ? { status } : {}) }).toString();
  try {
    const spaces = await api(`/spaces/search?${query}`);
    spacesBody.innerHTML = '';
    for (const s of spaces) {
      const tr = document.createElement('tr');

      const tdLabel = document.createElement('td');
      tdLabel.textContent = s.label;
      tr.appendChild(tdLabel);

      const tdStatus = document.createElement('td');
      tdStatus.appendChild(badge(s.status));
      tr.appendChild(tdStatus);

      const tdAcc = document.createElement('td');
      tdAcc.textContent = s.is_accessible ? 'Yes' : 'No';
      tr.appendChild(tdAcc);

      const tdRes = document.createElement('td');
      tdRes.textContent = s.is_reserved ? 'Yes' : 'No';
      tr.appendChild(tdRes);

      const tdAction = document.createElement('td');
      tdAction.appendChild(actionButtons(s));
      tr.appendChild(tdAction);

      spacesBody.appendChild(tr);
    }
    setMsg(`${spaces.length} space(s)`);
  } catch (e) {
    setMsg(`Failed to load spaces: ${e.message}`);
  }
}

function actionButtons(space) {
  const frag = document.createDocumentFragment();

  const btnEnter = document.createElement('button');
  btnEnter.textContent = 'Enter';
  btnEnter.onclick = () => postEvent(space.id, 'enter');

  const btnExit = document.createElement('button');
  btnExit.textContent = 'Exit';
  btnExit.style.marginLeft = '6px';
  btnExit.onclick = () => postEvent(space.id, 'exit');

  const btnBlock = document.createElement('button');
  btnBlock.textContent = 'Block';
  btnBlock.style.marginLeft = '6px';
  btnBlock.onclick = () => postEvent(space.id, 'block');

  const btnUnblock = document.createElement('button');
  btnUnblock.textContent = 'Unblock';
  btnUnblock.style.marginLeft = '6px';
  btnUnblock.onclick = () => postEvent(space.id, 'unblock');

  frag.append(btnEnter, btnExit, btnBlock, btnUnblock);
  return frag;
}

async function postEvent(spaceId, type) {
  try {
    setMsg(`Posting ${type}…`);
    await api('/occupancy', {
      method: 'POST',
      body: JSON.stringify({ spaceId, type })
    });
    await Promise.all([loadSpaces(), loadEvents()]);
    setMsg(`Event ${type} recorded.`);
  } catch (e) {
    setMsg(`Failed to post event: ${e.message}`);
  }
}

async function loadEvents() {
  try {
    const events = await api('/occupancy/recent?limit=20');
    eventsList.innerHTML = '';
    for (const ev of events) {
      const li = document.createElement('li');
      const when = new Date(ev.ts).toLocaleString();
      li.textContent = `[${when}] ${ev.label} → ${ev.event_type}${ev.plate ? ` (${ev.plate})` : ''}`;
      eventsList.appendChild(li);
    }
  } catch (e) {
    // non-fatal
  }
}

refreshBtn.addEventListener('click', loadSpaces);
lotSelect.addEventListener('change', loadSpaces);
statusSelect.addEventListener('change', loadSpaces);

(async function init() {
  await loadLots();
  await loadSpaces();
  await loadEvents();
})();
