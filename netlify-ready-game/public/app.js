const app = document.querySelector('#app');
let roomState = null;
let mode = 'create';
let messageError = '';
let toastTimer = null;
let language = localStorage.getItem('last-handshake-language') || (navigator.languages?.some(code => code.toLowerCase().startsWith('es')) ? 'es' : 'en');
let connectionLost = false;
let missionCatalog = [];
let selectedMission = localStorage.getItem('last-handshake-mission') || 'kestrel';
let pendingVote = null;
let tutorialOpen = !localStorage.getItem('pactos-tutorial-seen');
let tutorialStep = 0;
const gameEndpoint = '/.netlify/functions/game';
let playerId = sessionStorage.getItem('pacts-player-id') || crypto.randomUUID();
let activeRoomCode = sessionStorage.getItem('pacts-room-code') || '';
let lastRevision = null;
let pollTimer = null;
let pollInFlight = false;

const copy = (en, es) => language === 'es' ? es : en;
const gameTitle = () => copy('Pacts After the Fall', 'Pactos de ceniza');

const tutorialPages = [
  {
    title: ['Set up the crew', 'Reúne a la tripulación'],
    body: ['One person chooses a mission and creates a room. Share its four-character code so 1–7 others can join from their own devices.', 'Una persona elige una misión y crea la sala. Comparte el código de cuatro caracteres para que se unan de 1 a 7 personas desde sus dispositivos.'],
    points: [['The game needs 2–8 players.', 'Se necesitan de 2 a 8 jugadores.'], ['Everyone chooses English or Spanish on their own device.', 'Cada persona elige inglés o español en su dispositivo.']]
  },
  {
    title: ['Keep an eye on your private brief', 'Lee tu informe privado'],
    body: ['Your role brings a clue the rest of the crew may not have. Some players also receive a hidden stakeholder mandate and one special influence.', 'Tu rol aporta una pista que quizá el resto no tenga. Algunas personas también reciben un mandato secreto y una influencia especial.'],
    points: [['Decide what to reveal during debate; you can bluff about your interests.', 'Durante el debate, decide qué revelar; puedes fingir sobre tus intereses.'], ['Use a special influence once, while gathering evidence or negotiating.', 'Puedes usar una influencia especial una vez, al investigar o negociar.']]
  },
  {
    title: ['Investigate the changing crisis', 'Investiga cómo cambia la crisis'],
    body: ['Each mission has four stages. Read the new situation, then each player chooses one of that stage’s four investigation actions.', 'Cada misión tiene cuatro etapas. Lee la nueva situación y luego cada persona elige una de las cuatro acciones de investigación de esa etapa.'],
    points: [['Your action adds evidence to the shared timeline; it does not cast a vote.', 'Tu acción añade pruebas a la cronología compartida; no es un voto.'], ['The available actions change as the story develops. You can choose once per stage.', 'Las acciones disponibles cambian con la historia. Puedes elegir una vez por etapa.']]
  },
  {
    title: ['Debate before deciding', 'Debate antes de decidir'],
    body: ['Use the crew channel to compare evidence, question the system’s assumptions, and negotiate. The timed debate lasts up to 90 seconds; the host can move on sooner.', 'Usa el canal de la tripulación para comparar pruebas, cuestionar los supuestos del sistema y negociar. El debate dura hasta 90 segundos; el anfitrión puede avanzar antes.'],
    points: [['Ask who benefits, who carries the risk, and what is still unknown.', 'Pregunten quién se beneficia, quién asume el riesgo y qué sigue siendo incierto.'], ['You may persuade, withhold information, or bluff. The crew decides what it trusts.', 'Puedes persuadir, reservarte información o fingir. La tripulación decide qué creer.']]
  },
  {
    title: ['Submit a private verdict', 'Registra un veredicto privado'],
    body: ['Choose a response, then confirm it. Votes stay private until everyone has submitted. The response with the most votes wins; a tie or no votes uses the announced fallback.', 'Elige una respuesta y confirma. Los votos son privados hasta que todas las personas hayan votado. Gana la opción con más votos; si hay empate o nadie vota, se aplica el plan de respaldo anunciado.'],
    points: [['You see the trade-offs, but not a score forecast.', 'Verás las consecuencias posibles, no una puntuación prevista.'], ['After the verdict, the measures show what changed: safety, trust, and autonomy.', 'Tras el veredicto verás qué cambió en seguridad, confianza y autonomía.']]
  },
  {
    title: ['See what the system missed', 'Descubre qué pasó por alto el sistema'],
    body: ['After four verdicts, the debrief explains the fictional system’s goal, its data gaps, and the assumptions behind its predictions.', 'Después de cuatro veredictos, la revisión explica el objetivo del sistema ficticio, sus vacíos de datos y los supuestos de sus predicciones.'],
    points: [['The measures are not a moral score; there is no single correct ending.', 'Los indicadores no son una puntuación moral; no hay un único final correcto.'], ['Reflect together on whose evidence counted and what you would check next time.', 'Reflexionen sobre qué pruebas contaron y qué comprobarían la próxima vez.']]
  }
];

function tutorialDialogMarkup() {
  if (!tutorialOpen) return '';
  const page = tutorialPages[tutorialStep];
  const finalPage = tutorialStep === tutorialPages.length - 1;
  return `<dialog class="tutorial-dialog" id="tutorial-dialog" aria-labelledby="tutorial-title" aria-describedby="tutorial-body">
    <div class="tutorial-sheet"><header class="tutorial-top"><span class="tutorial-mark">✳</span><span>${copy('Crew briefing', 'Informe de tripulación')}</span><button type="button" class="tutorial-close" data-tutorial-close aria-label="${copy('Close tutorial', 'Cerrar tutorial')}">×</button></header>
      <div class="tutorial-progress" role="progressbar" aria-valuemin="1" aria-valuemax="${tutorialPages.length}" aria-valuenow="${tutorialStep + 1}" aria-label="${copy(`Step ${tutorialStep + 1} of ${tutorialPages.length}`, `Paso ${tutorialStep + 1} de ${tutorialPages.length}`)}">${tutorialPages.map((_, index) => `<span class="${index <= tutorialStep ? 'complete' : ''}"></span>`).join('')}</div>
      <main class="tutorial-content" aria-live="polite"><p class="eyebrow">${copy(`Step ${tutorialStep + 1} of ${tutorialPages.length}`, `Paso ${tutorialStep + 1} de ${tutorialPages.length}`)}</p><h2 id="tutorial-title">${copy(...page.title)}</h2><p id="tutorial-body" class="tutorial-body">${copy(...page.body)}</p><ul class="tutorial-points">${page.points.map(point => `<li>${copy(...point)}</li>`).join('')}</ul></main>
      <footer class="tutorial-footer"><button type="button" class="tutorial-skip" data-tutorial-close>${copy('Skip tutorial', 'Saltar tutorial')}</button><div class="tutorial-nav">${tutorialStep ? `<button type="button" class="secondary" data-tutorial-prev>${copy('Back', 'Atrás')}</button>` : ''}<button type="button" class="primary" data-tutorial-next>${finalPage ? copy('Start playing', 'Empezar a jugar') : copy('Next', 'Siguiente')}</button></div></footer>
    </div>
  </dialog>`;
}

function closeTutorial() {
  tutorialOpen = false;
  localStorage.setItem('pactos-tutorial-seen', '1');
  renderTutorial();
}

function openTutorial() {
  tutorialStep = 0;
  tutorialOpen = true;
  renderTutorial();
}

function renderTutorial() {
  const root = document.querySelector('#tutorial-root');
  if (!root) return;
  root.innerHTML = tutorialDialogMarkup();
  const dialog = root.querySelector('#tutorial-dialog');
  if (!dialog) return;
  dialog.showModal();
  dialog.querySelector('[data-tutorial-next]')?.focus();
  dialog.querySelector('[data-tutorial-close]')?.addEventListener('click', closeTutorial);
  dialog.querySelector('[data-tutorial-prev]')?.addEventListener('click', () => { tutorialStep--; renderTutorial(); });
  dialog.querySelector('[data-tutorial-next]')?.addEventListener('click', () => {
    if (tutorialStep === tutorialPages.length - 1) closeTutorial();
    else { tutorialStep++; renderTutorial(); }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeTutorial(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) closeTutorial(); });
}

const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const localize = value => value && typeof value === 'object' ? (value[language] || value.en || '') : translateText(String(value ?? ''));
const phaseNames = { lobby: 'Crew assembly', briefing: 'Crisis briefing', investigation: 'Gather evidence', negotiation: 'Make your case', vote: 'Choose a response', consequences: 'Consequences', debrief: 'System reveal', reflection: 'Crew reflection', finished: 'Mission complete' };
const phaseIndex = { briefing: 1, investigation: 2, negotiation: 3, vote: 4, consequences: 5, debrief: 6, reflection: 7, finished: 8 };

function translateText(value) {
  if (language !== 'es') return value;
  const spanish = window.gameSpanish || {};
  const trim = value.trim();
  const actionMatch = trim.match(/^Use (.+)$/);
  if (actionMatch) return value.replace(trim, `Usar ${spanish[actionMatch[1]] || actionMatch[1]}`);
  const crewCount = trim.match(/^(\d+) crew$/);
  if (crewCount) return value.replace(trim, `${crewCount[1]} integrantes`);
  const mandate = trim.match(/^Hidden mandate · (.+)$/);
  if (mandate) return value.replace(trim, `Mandato secreto · ${spanish[mandate[1]] || mandate[1]}`);
  if (spanish[trim]) return value.replace(trim, spanish[trim]);
  let match = trim.match(/^(\d+) of 8 players · (waiting for one more crew member|crew can launch)$/);
  if (match) return value.replace(trim, `${match[1]} de 8 jugadores · ${spanish[match[2]]}`);
  match = trim.match(/^(\d+) of (\d+) players have used an action\.$/);
  if (match) return value.replace(trim, `${match[1]} de ${match[2]} jugadores ya realizaron una acción.`);
  match = trim.match(/^(\d+) of (\d+) votes submitted\. Votes stay private until the crew’s response is set\.$/);
  if (match) return value.replace(trim, `${match[1]} de ${match[2]} votos registrados. Los votos son privados hasta que se determine la respuesta de la tripulación.`);
  match = trim.match(/^(\d+):(\d+) left$/);
  if (match) return value.replace(trim, `${match[1]}:${match[2]} restantes`);
  match = trim.match(/^(.*?) · (\d+\/8)$/);
  if (match && spanish[match[1]]) return value.replace(trim, `${spanish[match[1]]} · ${match[2]}`);
  match = trim.match(/^(Safety|Trust|Autonomy): (\d+) of 5$/);
  if (match) return value.replace(trim, `${spanish[match[1]]}: ${match[2]} de 5`);
  match = trim.match(/^(.*?) raises a stakeholder issue$/);
  if (match) return value.replace(trim, `${match[1]} plantea un interés de una parte involucrada`);
  match = trim.match(/^(.*?): (Inspect model inputs|Verify maintenance log|Request resident account)$/);
  if (match && spanish[match[2]]) return value.replace(trim, `${match[1]}: ${spanish[match[2]]}`);
  match = trim.match(/^A crew decision under uncertainty · (\d+) players$/);
  if (match) return value.replace(trim, `Una decisión de la tripulación ante la incertidumbre · ${match[1]} jugadores`);
  match = trim.match(/^Crew decision · (.+)$/);
  if (match) return value.replace(trim, `Decisión de la tripulación · ${spanish[match[1]] || match[1]}`);
  return value;
}
function applyLanguage() {
  document.documentElement.lang = language;
  document.title = gameTitle();
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = language === 'es' ? 'Un juego social de ciencia ficción en tiempo real sobre IA, intereses ocultos y decisiones con consecuencias.' : 'A real-time sci-fi party game about AI, hidden interests, and decisions with consequences.';
  const walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest('[data-user-content]')) continue;
    node.nodeValue = translateText(node.nodeValue);
  }
  for (const element of app.querySelectorAll('[placeholder], [aria-label], [title]')) {
    for (const attr of ['placeholder', 'aria-label', 'title']) {
      if (element.hasAttribute(attr)) element.setAttribute(attr, translateText(element.getAttribute(attr)));
    }
  }
}
function languageSwitch() {
  return `<div class="language-switch" role="group" aria-label="${language === 'es' ? 'Idioma' : 'Language'}"><button type="button" data-language="en" aria-label="Play in English" aria-pressed="${language === 'en'}">EN</button><button type="button" data-language="es" aria-label="Play in Spanish" aria-pressed="${language === 'es'}">ES</button></div>`;
}

function setPlayerId(id) {
  playerId = id;
  sessionStorage.setItem('pacts-player-id', id);
}
function handleGameResponse(payload) {
  if (payload.type === 'error') {
    messageError = payload.message || 'The game service could not complete that action. Please try again.';
    render();
    return;
  }
  if (payload.type !== 'state' || !payload.room) return;
  const incomingRevision = Number(payload.room.revision || 0);
  if (roomState && incomingRevision < Number(roomState.revision || 0)) return;
  roomState = payload.room;
  lastRevision = incomingRevision;
  activeRoomCode = roomState.code;
  sessionStorage.setItem('pacts-room-code', activeRoomCode);
  messageError = '';
  if (connectionLost) connectionLost = false;
  render();
}
async function pollRoom() {
  if (pollInFlight || !activeRoomCode || !playerId) return;
  pollInFlight = true;
  const params = new URLSearchParams({ room: activeRoomCode, player: playerId });
  if (lastRevision !== null) params.set('since', String(lastRevision));
  try {
    const response = await fetch(`${gameEndpoint}?${params}`, { cache: 'no-store' });
    if (response.status === 204) {
      if (connectionLost) { connectionLost = false; render(); }
      return;
    }
    const payload = await response.json();
    if (!response.ok && payload.type !== 'error') throw new Error('The game service could not restore this room.');
    handleGameResponse(payload);
  } catch {
    if (!connectionLost) {
      connectionLost = true;
      messageError = 'Connection lost. The mission state could not be restored.';
      render();
    }
  } finally {
    pollInFlight = false;
  }
}
function startPolling() {
  if (pollTimer) window.clearInterval(pollTimer);
  pollRoom();
  pollTimer = window.setInterval(pollRoom, 1200);
}
async function send(message) {
  messageError = '';
  const payload = { ...message, playerId, ...(activeRoomCode ? { roomCode: activeRoomCode } : {}) };
  try {
    const response = await fetch(gameEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    const result = await response.json();
    if (!response.ok && result.type !== 'error') throw new Error('The game service could not complete that action. Please try again.');
    handleGameResponse(result);
  } catch (error) {
    messageError = error.message || 'Connection lost. The mission state could not be restored.';
    connectionLost = true;
    render();
  }
}
function openRoom(action, name, code, scenario) {
  messageError = '';
  activeRoomCode = action === 'join' ? code : '';
  lastRevision = null;
  setPlayerId(crypto.randomUUID());
  send({ type: action, name, code, scenario });
  if (!pollTimer) startPolling();
}
function notify(text) {
  document.querySelector('.copy-toast')?.remove();
  const el = document.createElement('div'); el.className = 'copy-toast'; el.textContent = text; document.body.append(el);
  window.clearTimeout(toastTimer); toastTimer = window.setTimeout(() => el.remove(), 1800);
}
function joinForm() {
  const mission = missionCatalog.find(item => item.id === selectedMission) || missionCatalog[0];
  return `<main class="screen home">
    <section class="home-story" aria-label="Game introduction">
      <div class="brand"><span class="brand-mark">✳</span><span>${gameTitle()}</span></div>
      <div class="home-copy"><div class="eyebrow">A real-time sci-fi party game</div><h1>${language === 'es' ? 'Pactos de<br>ceniza' : 'Pacts After<br>the Fall'}</h1><p>${language === 'es' ? 'Cuando los sistemas fallan, las pruebas se contradicen. La tripulación toma cuatro decisiones conectadas y cada interés cuenta.' : 'When systems fail, evidence fractures. Your crew makes four linked decisions—and every interest at the table matters.'}</p></div>
      <div class="language-row"><span>Language</span>${languageSwitch()}</div>
      <div class="story-foot"><span class="live-dot"></span> 2–8 players · 25–30 minutes · one device each</div>
    </section>
    <section class="home-panel"><div class="join-box">
      <div class="eyebrow">${language === 'es' ? 'PROTOCOLO DE MISIÓN' : 'MISSION CONTROL'}</div><h2>Enter the mission</h2><p>Create a room for your crew, or join a room that’s already waiting.</p>
      <div class="mode-switch" role="tablist" aria-label="Room action"><button type="button" data-mode="create" class="${mode === 'create' ? 'active' : ''}" aria-selected="${mode === 'create'}">Create a room</button><button type="button" data-mode="join" class="${mode === 'join' ? 'active' : ''}" aria-selected="${mode === 'join'}">Join a room</button></div>
      <form id="room-form">${mode === 'create' && missionCatalog.length ? `<label class="field-label" for="mission-choice">${language === 'es' ? 'Elige una misión' : 'Choose a mission'}</label><select class="text-field mission-select" id="mission-choice">${missionCatalog.map(item => `<option value="${item.id}" ${item.id === selectedMission ? 'selected' : ''}>${safe(localize(item.title))}</option>`).join('')}</select><p class="mission-summary">${safe(localize(mission?.pitch))}</p>` : ''}<label class="field-label" for="player-name">Your name</label><input class="text-field" id="player-name" maxlength="20" placeholder="How should the crew know you?" autocomplete="nickname" required>
        ${mode === 'join' ? '<label class="field-label" for="room-code">Room code</label><input class="text-field code-field" id="room-code" maxlength="4" minlength="4" placeholder="A7F2" autocomplete="off" required>' : ''}
        <button class="primary wide" type="submit">${mode === 'create' ? 'Create mission room' : 'Join mission room'}</button><p class="form-error" role="alert">${safe(messageError)}</p>
      </form>
      <div class="join-note"><span class="note-mark">✳</span><span>Hidden interests, visible consequences. The game examines your reasoning, not whether you chose the “right” side.</span></div><button type="button" class="tutorial-trigger home-tutorial-trigger" data-open-tutorial>${copy('How to play', 'Cómo jugar')}</button>
    </div></section>
  </main>`;
}
function brand() { return `<div class="brand"><span class="brand-mark">✳</span><span>${gameTitle()}</span></div>`; }
function playerList(room, lobby = false) {
  return room.players.map(p => `<div class="player-row"><span class="avatar">${safe(p.name.trim().charAt(0).toUpperCase() || '?')}</span><span class="player-name"><span data-user-content>${safe(p.name)}</span>${p.id === room.hostId ? ' <span class="host-badge">HOST</span>' : ''}${p.role && !lobby ? `<span class="player-role">${safe(localize(p.role))}</span>` : ''}</span><span class="player-state">${p.connected ? (lobby ? 'Ready' : p.hasActed ? 'Acted' : 'Here') : 'Reconnecting'}</span></div>`).join('');
}
function meters(room) {
  const rows = [['safety', 'Safety'], ['trust', 'Trust'], ['autonomy', 'Autonomy']];
  const labels = { safety: copy('Safety', 'Seguridad'), trust: copy('Trust', 'Confianza'), autonomy: copy('Autonomy', 'Autonomía') };
  return `<div class="meters">${rows.map(([key]) => `<div class="meter-row"><span class="meter-label">${labels[key]}</span><div class="meter-track" role="img" aria-label="${labels[key]}: ${room.tracks[key]} ${copy('of', 'de')} 5">${Array.from({ length: 5 }, (_, i) => `<span class="meter-unit ${i < room.tracks[key] ? `on ${key}` : ''}"></span>`).join('')}</div><span class="meter-value">${room.tracks[key]}/5</span></div>`).join('')}</div>`;
}
function impactPreview(option, room, detailed = false) {
  const rows = [
    ['safety', copy('Safety', 'Seguridad')],
    ['trust', copy('Trust', 'Confianza')],
    ['autonomy', copy('Autonomy', 'Autonomía')]
  ];
  const deltas = rows.map(([key, label]) => {
    const before = detailed ? room.tracks[key] - (room.lastDelta?.[key] || 0) : room.tracks[key];
    const after = detailed ? room.tracks[key] : Math.max(0, Math.min(5, before + (option.delta?.[key] || 0)));
    const change = after - before;
    const changeText = change > 0 ? `+${change}` : String(change);
    const descriptor = change > 0 ? copy('up', 'sube') : change < 0 ? copy('down', 'baja') : copy('unchanged', 'sin cambio');
    return `<span class="impact-chip ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}">${label} ${before}→${after} (${changeText})<span class="sr-only">, ${descriptor}</span></span>`;
  }).join('');
  return `<div class="impact-preview"><span class="impact-label">${detailed ? copy('Actual change after the verdict', 'Cambio real tras el veredicto') : copy('Possible change', 'Cambio posible')}</span><div class="impact-chips">${deltas}</div></div>`;
}
function eventList(room) {
  if (!room.events.length) return '<div class="empty-event">Evidence and decisions will appear here.</div>';
  return `<div class="event-list">${room.events.slice().reverse().map(event => `<article class="event"><span class="event-dot"></span><div><strong>${safe(localize(event.title))}</strong><p>${safe(localize(event.text))}</p></div></article>`).join('')}</div>`;
}
function privateCard(room) {
  const me = room.players.find(p => p.id === room.you?.id);
  if (!me?.role) return '';
  const canUseSpecial = me.secret && !me.specialUsed && ['investigation', 'negotiation'].includes(room.phase);
  const secret = me.secret;
  const special = secret?.special;
  return `<section class="panel panel-pad private-panel"><div class="panel-heading"><h2>Your private brief</h2><span class="panel-kicker">Only you can see this</span></div><div class="private-role">${safe(localize(me.role))}</div><p class="private-copy">${safe(localize(me.privateInfo || ''))}</p>${secret ? `<p class="private-copy secret-copy"><strong>Hidden mandate · ${safe(localize(secret.name))}</strong><br>${safe(localize(secret.mandate))}<br><em>This is a stakeholder interest. Choose what to share.</em></p>${canUseSpecial ? `<p class="private-copy"><strong>One-time influence:</strong> ${safe(localize(special))}</p><button class="quiet-button" data-special>${language === 'es' ? 'Usar influencia' : 'Use influence'}</button>` : me.specialUsed ? '<p class="panel-kicker">One-time influence used</p>' : ''}` : '<p class="private-copy secret-copy">You have no covert mandate. Your role still has interests worth negotiating.</p>'}</section>`;
}
function timerText(room) {
  if (!room.deadline) return '';
  const seconds = Math.max(0, Math.ceil((room.deadline - Date.now()) / 1000));
  return `<span class="timer" data-deadline="${room.deadline}">${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} left</span>`;
}
function chatPanel(room) {
  const chat = room.chat.length ? room.chat.map(item => `<div class="chat-line"><strong data-user-content>${safe(item.name)}:</strong> <span data-user-content>${safe(item.text)}</span></div>`).join('') : '<div class="chat-line">The crew channel is open. Share evidence, questions, and offers.</div>';
  const available = ['investigation', 'negotiation', 'vote'].includes(room.phase);
  return `<section class="panel panel-pad"><div class="panel-heading"><h2>Crew channel</h2><span class="panel-kicker">${available ? 'Open to everyone' : 'Read-only'}</span></div><div class="chat-box"><div class="chat-log" id="chat-log">${chat}</div>${available ? '<form class="chat-send" id="chat-form"><input id="chat-message" name="message" maxlength="400" placeholder="Share a thought…" aria-label="Message to crew"><button type="submit">Send</button></form>' : ''}</div></section>`;
}
function lobbyView(room) {
  const isHost = room.you?.id === room.hostId;
  const count = room.players.length;
  return `<div class="game-shell"><header class="topbar">${brand()}<div class="topbar-right"><button type="button" class="tutorial-trigger" data-open-tutorial>${copy('How to play', 'Cómo jugar')}</button>${languageSwitch()}<span>Room code</span><span class="room-code">${safe(room.code)} <button type="button" id="copy-code">COPY</button></span></div></header>
    <div class="center-wrap"><section class="panel finished" style="max-width:700px"><div class="eyebrow">Crew assembly</div><h2>${safe(localize(room.scenario.title))}</h2><p>${safe(localize(room.scenario.pitch))}</p><p>Invite 1–7 other people. Each player receives a private role brief; one or two players also receive a hidden stakeholder mandate.</p><div class="lobby-count">${count} of 8 players · ${count < 2 ? 'waiting for one more crew member' : 'crew can launch'}</div><div class="lobby-list">${playerList(room, true)}</div>${isHost ? `<button class="primary" id="start-game" ${count < 2 ? 'disabled' : ''}>Start the mission</button>` : '<div class="waiting-state"><span class="live-dot"></span>Waiting for the host to start the mission.</div>'}<p class="form-error" role="alert">${safe(messageError)}</p></section></div></div>`;
}
function phaseControls(room, me) {
  const isHost = room.you?.id === room.hostId;
  if (room.phase === 'briefing') return `<div class="phase-actions"><p class="phase-hint">${copy('First, gather evidence. No decision is made yet.', 'Primero reunirán pruebas. Todavía no se decide.')}</p>${isHost ? `<button class="primary" data-advance>${copy('Start gathering evidence', 'Empezar a reunir pruebas')}</button>` : `<span class="phase-hint">${copy('The host will start evidence gathering.', 'El anfitrión abrirá la fase de pruebas.')}</span>`}</div>`;
  if (room.phase === 'investigation') {
    const acted = room.players.filter(p => p.hasActed).length;
    return `<div class="phase-actions"><p class="phase-hint">${acted} ${copy('of', 'de')} ${room.players.length} ${copy('players have used an action. Each action adds shared evidence; it does not decide the response.', 'personas ya eligieron una acción. Cada acción aporta pruebas compartidas; no decide la respuesta.')}</p>${isHost ? `<button class="primary" data-advance ${acted < room.players.length ? 'disabled' : ''}>${acted < room.players.length ? copy('Waiting on every player', 'Esperando a toda la tripulación') : copy('Finish evidence and debate', 'Cerrar pruebas y pasar al debate')}</button>` : `<span class="phase-hint">${copy('Discuss what the evidence can and cannot show.', 'Hablen de lo que las pruebas muestran y de lo que no pueden demostrar.')}</span>`}</div>`;
  }
  if (room.phase === 'negotiation') return `<div class="phase-actions"><p class="phase-hint">${copy('This is the debate, not the verdict. Make your case, ask who benefits, or change your mind.', 'Este es el debate, no el veredicto. Defiendan su postura, pregunten quién se beneficia o cambien de opinión.')}</p>${timerText(room)}${isHost ? `<button class="primary" data-advance>${copy('Go to this stage’s verdict', 'Pasar al veredicto de esta etapa')}</button>` : `<span class="phase-hint">${copy('This stage’s vote opens when the host is ready or when time runs out.', 'La votación de esta etapa se abre cuando el anfitrión lo decida o se agote el tiempo.')}</span>`}</div>`;
  if (room.phase === 'consequences') { const last = room.roundIndex >= room.roundCount - 1; return `<div class="phase-actions"><p class="phase-hint">${copy(`Decision ${room.roundIndex + 1} of ${room.roundCount} is resolved. Measures reflect the accumulated choices.`, `La decisión ${room.roundIndex + 1} de ${room.roundCount} quedó resuelta. Los indicadores reflejan las decisiones acumuladas.`)}</p>${isHost ? `<button class="primary" data-advance>${last ? copy('Review the full mission and learn', 'Revisar la misión y aprender') : copy(`Continue to decision ${room.roundIndex + 2}`, `Continuar a la decisión ${room.roundIndex + 2}`)}</button>` : `<span class="phase-hint">${last ? copy('The host will open the final learning review.', 'El anfitrión abrirá la reflexión final.') : copy('The host will open the next stage of the crisis.', 'El anfitrión abrirá la siguiente etapa de la crisis.')}</span>`}</div>`; }
  if (room.phase === 'debrief') return `<div class="phase-actions"><p class="phase-hint">These concepts explain the system’s design and limits. They do not decide whether the crew was right.</p>${isHost ? '<button class="primary" data-advance>Reflect as a crew</button>' : '<span class="phase-hint">Take a moment to consider the reveal.</span>'}</div>`;
  if (room.phase === 'reflection') return `<div class="phase-actions"><p class="phase-hint">The mission closes when the crew is ready to review what happened.</p>${isHost ? '<button class="primary" data-advance>Close mission</button>' : '<span class="phase-hint">Share a reflection before the host closes.</span>'}</div>`;
  return '';
}
function investigationPanel(room, me) {
  if (room.phase !== 'investigation') return '';
  const acted = me?.hasActed;
  const actions = Object.entries(room.scenario.actions);
  return `<section class="panel panel-pad"><div class="panel-heading"><h2>${copy('Choose one crew action', 'Elige una acción de la tripulación')}</h2><span class="panel-kicker">${copy(`Evidence · Stage ${room.roundIndex + 1} of ${room.roundCount}`, `Pruebas · Etapa ${room.roundIndex + 1} de ${room.roundCount}`)} · ${acted ? copy('Action used', 'Acción usada') : copy('Evidence window', 'Fase de pruebas')}</span></div><p class="phase-hint">${copy('Each stage offers new ways to investigate the changing crisis.', 'Cada etapa ofrece nuevas formas de investigar cómo evoluciona la crisis.')}</p><div class="action-grid">${actions.map(([action, item]) => `<button class="action-card" data-action="${action}" ${acted ? 'disabled' : ''}><strong>${safe(localize(item.title))}</strong><span>${safe(localize(item.description))}</span></button>`).join('')}</div>${phaseControls(room, me)}</section>`;
}
function votePanel(room, me) {
  if (room.phase !== 'vote') return '';
  const selected = me?.vote || pendingVote;
  const choices = room.scenario.options;
  const waiting = room.votesSubmitted ?? 0;
  const fallback = choices.find(option => option.isFallback) || choices.find(option => option.id === 'staged') || choices[0];
  const submitted = Boolean(me?.vote);
  const decisionRule = copy('When time expires, the most-submitted option wins. A tie—or no votes—defaults to the fallback plan below. The measures change only after the verdict is resolved.', 'Al agotarse el tiempo, gana la opción con más votos registrados. Si hay empate o nadie vota, se aplica el plan de respaldo de abajo. Los indicadores solo cambian cuando se resuelve el veredicto.');
  return `<section class="panel panel-pad vote-panel"><div class="panel-heading"><div><div class="eyebrow">${copy(`Decision ${room.roundIndex + 1} of ${room.roundCount}`, `Decisión ${room.roundIndex + 1} de ${room.roundCount}`)}</div><h2>${copy('Choose the crew’s response', 'Elijan la respuesta de la tripulación')}</h2></div>${timerText(room)}</div><p class="vote-intro">${copy('Choose among four responses written for this stage of the crisis. Compare their risks; no score forecast is shown.', 'Elijan entre cuatro respuestas creadas para esta etapa de la crisis. Comparen sus riesgos; no se muestra una puntuación prevista.')}</p><div class="vote-grid">${choices.map(option => `<button type="button" class="vote-card ${selected === option.id ? 'selected' : ''}" data-vote="${option.id}" aria-pressed="${selected === option.id}" ${submitted ? 'disabled' : ''}><span class="vote-choice-head"><strong>${safe(localize(option.name))}</strong><span class="selection-mark">${selected === option.id ? copy('Selected', 'Seleccionado') : copy('Select', 'Elegir')}</span></span><span class="vote-subtitle">${safe(localize(option.subtitle))}</span><span class="vote-consequence"><strong>${copy('What follows', 'Qué puede pasar')}</strong>${safe(localize(option.result))}</span></button>`).join('')}</div><aside class="fallback-note"><strong>${copy('If the crew does not decide', 'Si la tripulación no decide')}</strong><p>${copy('At the deadline, this fallback is applied if nobody votes or if the vote is tied:', 'Al agotarse el tiempo, este plan se aplica si nadie vota o si hay empate:')} <b>${safe(localize(fallback.name))}</b>. ${safe(localize(fallback.result))}</p></aside><div class="vote-submit-row"><p class="phase-hint" aria-live="polite">${submitted ? copy('Your final verdict is locked.', 'Tu veredicto final quedó registrado.') : `${waiting} ${copy('of', 'de')} ${room.players.length} ${copy('verdicts submitted. Votes stay private.', 'veredictos registrados. Los votos siguen siendo privados.')}`}</p>${submitted ? `<span class="vote-locked">${copy('Waiting for the crew…', 'Esperando al resto…')}</span>` : `<button type="button" class="primary" data-submit-vote ${selected ? '' : 'disabled'}>${copy('Confirm my final verdict', 'Confirmar mi veredicto final')}</button>`}</div><p class="vote-rule">${decisionRule}</p></section>`;
}
function revealPanel(room) {
  if (room.phase !== 'debrief' && room.phase !== 'reflection' && room.phase !== 'finished') return '';
  const concepts = room.scenario.concepts || [];
  return `<section class="panel panel-pad"><div class="panel-heading"><h2>What the system was doing</h2><span class="panel-kicker">Plain-language mission debrief</span></div><p class="phase-hint" style="margin-bottom:13px">${safe(localize(room.scenario.systemReveal))}</p><div class="concept-list">${concepts.map(item => `<article class="concept"><strong>${safe(localize(item.title))}</strong><p>${safe(localize(item.text))}</p></article>`).join('')}</div></section>`;
}
function consequencesPanel(room) {
  if (!['consequences', 'debrief', 'reflection', 'finished'].includes(room.phase)) return '';
  const choice = room.scenario.options.find(option => option.id === room.winner) || room.scenario.options.find(option => option.isFallback) || room.scenario.options.find(option => option.id === 'staged');
  const consequence = room.winner ? localize(choice.result) : (language === 'es' ? 'No hubo votos antes del plazo. La tripulación adopta una respuesta gradual para poder reunir más pruebas.' : 'No votes arrived before the deadline. The crew takes the staged response to preserve the chance to gather more evidence.');
  const decisionNote = room.decisionReason === 'no-votes'
    ? copy('No verdict was submitted. The published fallback plan was applied automatically.', 'Nadie registró un veredicto. Se aplicó automáticamente el plan de respaldo anunciado.')
    : room.decisionReason === 'tie'
      ? copy('The vote was tied. The published fallback plan resolved the tie.', 'La votación terminó en empate. Se aplicó el plan de respaldo anunciado.')
      : '';
  return `<section class="panel panel-pad"><div class="panel-heading"><h2>${copy(`Decision ${room.roundIndex + 1}: consequences`, `Decisión ${room.roundIndex + 1}: consecuencias`)}</h2><span class="panel-kicker">${copy('Crew decision', 'Decisión de la tripulación')} · ${safe(localize(choice.name))}</span></div>${decisionNote ? `<p class="decision-note">${decisionNote}</p>` : ''}<p class="private-copy">${safe(consequence)}</p>${impactPreview(choice, room, true)}${meters(room)}</section>`;
}
function decisionHistoryPanel(room) {
  if (!room.decisionHistory?.length) return '';
  return `<section class="panel panel-pad"><div class="panel-heading"><h2>${copy('The chain of decisions', 'La cadena de decisiones')}</h2><span class="panel-kicker">${room.decisionHistory.length} ${copy('of 4 resolved', 'de 4 resueltas')}</span></div><div class="event-list">${room.decisionHistory.map((item, index) => `<article class="event"><span class="event-dot"></span><div><strong>${copy(`Decision ${index + 1}: `, `Decisión ${index + 1}: `)}${safe(localize(item.name))}</strong><p>${safe(localize(item.result))}</p><p class="panel-kicker">${copy('Measures after this choice', 'Indicadores tras esta decisión')}: ${copy('Safety', 'Seguridad')} ${item.tracks.safety}/5 · ${copy('Trust', 'Confianza')} ${item.tracks.trust}/5 · ${copy('Autonomy', 'Autonomía')} ${item.tracks.autonomy}/5</p></div></article>`).join('')}</div></section>`;
}
function reflectionPanel(room, me) {
  if (room.phase !== 'reflection' && room.phase !== 'finished') return '';
  const submitted = Boolean(me?.reflection);
  const list = room.reflections?.length ? room.reflections.map(item => `<div class="reflection-item"><strong data-user-content>${safe(item.name)}</strong><span data-user-content>${safe(item.text)}</span></div>`).join('') : '<p class="phase-hint">Reflections will appear here as the crew shares them.</p>';
  return `<section class="panel panel-pad"><div class="panel-heading"><h2>What will you carry forward?</h2><span class="panel-kicker">Your reflection</span></div><ul class="reflection-prompts"><li>What did you believe at the start, and what changed your view?</li><li>Whose interests or evidence were easiest to overlook?</li><li>What would you want to verify before facing a similar system in real life?</li></ul><form id="reflection-form"><textarea id="reflection-input" class="reflection-input" name="reflection" maxlength="500" placeholder="Write a thought for the crew…">${safe(me?.reflection || '')}</textarea><button class="quiet-button" style="margin-top:8px" type="submit">${submitted ? 'Update reflection' : 'Share reflection'}</button></form><div style="margin-top:12px">${list}</div></section>`;
}
function finishedPanel(room) {
  const option = room.scenario.options.find(item => item.id === room.winner) || room.scenario.options.find(item => item.isFallback) || room.scenario.options.find(item => item.id === 'staged');
  const mandates = room.players.map(player => `<div class="reflection-item"><strong data-user-content>${safe(player.name)} · ${safe(localize(player.role || 'Crew member'))}</strong>${player.secret ? `${safe(localize(player.secret.name))} · ${safe(player.mandateMet ? (language === 'es' ? 'Mandato cumplido' : 'Mandate met') : (language === 'es' ? 'Mandato no cumplido' : 'Mandate not met'))}<br>${safe(localize(player.secret.mandate))}` : (language === 'es' ? 'Sin mandato oculto.' : 'No covert mandate.')}</div>`).join('');
  return `<section class="panel finished"><div class="eyebrow">${language === 'es' ? 'Misión completada' : 'Mission complete'}</div><h2>${language === 'es' ? 'La colonia vivirá con las consecuencias.' : 'The colony keeps the consequences.'}</h2><p>${language === 'es' ? 'La tripulación eligió' : 'The crew chose'} <strong>${safe(localize(option.name))}</strong>. ${language === 'es' ? 'Los indicadores muestran qué protegió esa decisión y qué puso en riesgo.' : 'The safety, trust, and autonomy measures show what that decision protected and what it placed at risk.'}</p><h3 class="title-serif">${language === 'es' ? 'Mandatos revelados' : 'Mandates revealed'}</h3><div class="lobby-list">${mandates}</div><h3 class="title-serif">${language === 'es' ? 'Reflexiones de la tripulación' : 'Crew reflections'}</h3>${room.players.filter(p => p.reflection).map(p => `<div class="reflection-item"><strong data-user-content>${safe(p.name)}</strong><span data-user-content>${safe(p.reflection)}</span></div>`).join('') || `<p>${language === 'es' ? 'Nadie compartió una reflexión.' : 'No reflections were shared this round.'}</p>`}<p>${language === 'es' ? 'No hay una puntuación moral única. Comparen las razones, las pruebas disponibles y qué podría cambiar su opinión la próxima vez.' : 'There is no single moral score. Compare the reasons people gave, what the evidence supported, and what could change your mind next time.'}</p></section>`;
}
function activeView(room) {
  const me = room.players.find(p => p.id === room.you?.id);
  if (room.phase === 'lobby') return lobbyView(room);
  if (room.phase !== 'vote') pendingVote = null;
  const idx = phaseIndex[room.phase] || 1;
  const isHost = room.you?.id === room.hostId;
  const main = room.phase === 'briefing' ? `<section class="panel intro-panel"><div class="eyebrow">${copy(`Decision ${room.roundIndex + 1} · Crisis update`, `Decisión ${room.roundIndex + 1} · Actualización de la crisis`)}</div><h2>${safe(localize(room.scenario.roundTitle || room.scenario.title))}</h2><p>${safe(localize(room.scenario.briefing))}</p></section><section class="panel panel-pad"><div class="panel-heading"><h2>${copy('Signals to weigh', 'Señales que deben valorar')}</h2><span class="panel-kicker">${copy('Some facts may conflict', 'Algunos datos pueden contradecirse')}</span></div><div class="signal-list">${room.scenario.signals.map(s => `<article class="signal"><strong>${safe(localize(s.title))}</strong><p>${safe(localize(s.text))}</p></article>`).join('')}</div>${phaseControls(room, me)}</section>`
    : room.phase === 'investigation' ? investigationPanel(room, me)
    : room.phase === 'negotiation' ? `<section class="panel panel-pad"><div class="panel-heading"><h2>${copy('Debate and negotiate', 'Debatan y negocian')}</h2>${timerText(room)}</div><p class="private-copy">${copy('Compare the evidence, question what the forecast assumes, and name who will bear the cost of each response. You may bargain for support, reveal a stake, or keep an interest private. No verdict is recorded in this step.', 'Comparen las pruebas, cuestionen los supuestos del pronóstico y nombren a quienes asumirán el costo. Pueden negociar apoyos, revelar intereses o mantenerlos en privado. En esta fase aún no se registra ningún veredicto.')}</p>${phaseControls(room, me)}</section>`
    : room.phase === 'vote' ? votePanel(room, me)
    : room.phase === 'consequences' ? consequencesPanel(room)
    : room.phase === 'debrief' ? `${consequencesPanel(room)}${decisionHistoryPanel(room)}${revealPanel(room)}`
    : room.phase === 'reflection' ? revealPanel(room)
    : finishedPanel(room);
  const flow = [
    { id: 'explore', label: copy('Explore', 'Explorar'), phases: ['briefing', 'investigation'] },
    { id: 'debate', label: copy('Debate', 'Debatir'), phases: ['negotiation'] },
    { id: 'verdict', label: copy('Final verdict', 'Veredicto'), phases: ['vote'] },
    { id: 'review', label: copy('Impact & learning', 'Impacto y aprendizaje'), phases: ['consequences', 'debrief', 'reflection', 'finished'] }
  ];
  const activeFlow = flow.findIndex(item => item.phases.includes(room.phase));
  return `<div class="game-shell"><header class="topbar">${brand()}<div class="topbar-right"><button type="button" class="tutorial-trigger" data-open-tutorial>${copy('How to play', 'Cómo jugar')}</button>${languageSwitch()}<span data-user-content>${safe(me?.name || '')}</span><span class="room-code">${safe(room.code)} <button type="button" id="copy-code">COPY</button></span></div></header>
    ${connectionLost ? `<div class="connection-alert" role="alert">${translateText('Connection lost. The mission state could not be restored.')}</div>` : ''}
    <div class="mission-head"><div><div class="eyebrow">${safe(localize(room.scenario.kicker))}</div><h1>${safe(localize(room.scenario.title))}</h1><p class="subtitle">${copy(`Decision ${room.roundIndex + 1} of ${room.roundCount}`, `Decisión ${room.roundIndex + 1} de ${room.roundCount}`)} · ${room.players.length} ${copy('players', 'jugadores')}</p></div><span class="phase-chip">${safe(translateText(phaseNames[room.phase]))} · ${idx}/8</span></div>
    <nav class="decision-flow" aria-label="${copy('Decision flow', 'Flujo de decisión')}"><ol>${flow.map((item, i) => `<li class="flow-step ${i < activeFlow ? 'complete' : ''} ${i === activeFlow ? 'current' : ''}" ${i === activeFlow ? 'aria-current="step"' : ''}><span class="flow-number">${i < activeFlow ? '✓' : i + 1}</span><span>${item.label}</span></li>`).join('')}</ol></nav>
    <main class="game-grid"><div class="main-column">${main}${room.phase === 'consequences' ? phaseControls(room, me) : ''}${room.phase === 'debrief' ? phaseControls(room, me) : ''}${room.phase === 'reflection' ? phaseControls(room, me) : ''}${room.phase === 'reflection' ? reflectionPanel(room, me) : ''}${room.phase === 'finished' ? revealPanel(room) : ''}${(room.phase === 'investigation' || room.phase === 'negotiation' || room.phase === 'vote') ? `<section class="panel panel-pad"><div class="panel-heading"><h2>Evidence and crew notes</h2><span class="panel-kicker">Shared timeline</span></div>${eventList(room)}</section>` : ''}</div>
      <aside class="side-column">${privateCard(room)}<section class="panel panel-pad"><div class="panel-heading"><h2>${copy('Colony measures', 'Indicadores de la colonia')}</h2><span class="panel-kicker">0–5</span></div>${meters(room)}<p class="measure-note">${copy('Safety = physical risk · Trust = community confidence · Autonomy = local control. Higher is stronger; this is not a moral score.', 'Seguridad = riesgo físico · Confianza = cohesión comunitaria · Autonomía = control local. Un valor mayor indica una condición más sólida; no es una puntuación moral.')}</p></section><section class="panel panel-pad"><div class="panel-heading"><h2>${copy('On the channel', 'En el canal')}</h2><span class="panel-kicker">${room.players.length} ${copy('crew', 'integrantes')}</span></div><div class="player-list">${playerList(room)}</div></section>${chatPanel(room)}</aside></main></div>`;
}
function render() {
  const chatDraft = document.querySelector('#chat-message')?.value;
  const reflectionDraft = document.querySelector('#reflection-input')?.value;
  app.innerHTML = roomState ? activeView(roomState) : joinForm();
  applyLanguage();
  if (chatDraft !== undefined && document.querySelector('#chat-message')) document.querySelector('#chat-message').value = chatDraft;
  if (reflectionDraft !== undefined && document.querySelector('#reflection-input')) document.querySelector('#reflection-input').value = reflectionDraft;
  bind();
  renderTutorial();
  const log = document.querySelector('#chat-log'); if (log) log.scrollTop = log.scrollHeight;
}
function bind() {
  document.querySelectorAll('[data-open-tutorial]').forEach(button => button.addEventListener('click', openTutorial));
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    language = button.dataset.language; localStorage.setItem('last-handshake-language', language); render();
  }));
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; messageError = ''; render(); }));
  document.querySelector('#room-form')?.addEventListener('submit', event => {
    event.preventDefault(); const name = document.querySelector('#player-name')?.value.trim() || 'Crew member';
    const code = document.querySelector('#room-code')?.value.trim().toUpperCase(); openRoom(mode, name, code, selectedMission);
  });
  document.querySelector('#mission-choice')?.addEventListener('change', event => { selectedMission = event.target.value; localStorage.setItem('last-handshake-mission', selectedMission); const mission = missionCatalog.find(item => item.id === selectedMission); const summary = document.querySelector('.mission-summary'); if (summary && mission) summary.textContent = localize(mission.pitch); });
  document.querySelector('#copy-code')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(roomState.code); notify('Room code copied'); }
    catch { notify(`Room code: ${roomState.code}`); }
  });
  document.querySelector('#start-game')?.addEventListener('click', () => send({ type: 'start' }));
  document.querySelectorAll('[data-advance]').forEach(button => button.addEventListener('click', () => send({ type: 'advance' })));
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => send({ type: 'action', action: button.dataset.action })));
  document.querySelector('[data-special]')?.addEventListener('click', () => send({ type: 'special' }));
  document.querySelectorAll('[data-vote]').forEach(button => button.addEventListener('click', () => { pendingVote = button.dataset.vote; render(); }));
  document.querySelector('[data-submit-vote]')?.addEventListener('click', () => { if (pendingVote) send({ type: 'vote', choice: pendingVote }); });
  document.querySelector('#chat-form')?.addEventListener('submit', event => {
    event.preventDefault(); const field = event.currentTarget.elements.message; const text = field.value.trim(); if (!text) return; send({ type: 'chat', text }); field.value = ''; field.focus();
  });
  document.querySelector('#reflection-form')?.addEventListener('submit', event => { event.preventDefault(); send({ type: 'reflect', text: event.currentTarget.elements.reflection.value.trim() }); });
}
window.setInterval(() => {
  const el = document.querySelector('[data-deadline]'); if (!el) return;
  const seconds = Math.max(0, Math.ceil((Number(el.dataset.deadline) - Date.now()) / 1000));
  el.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} left`;
}, 1000);
render();
fetch(`${gameEndpoint}?catalog=1`).then(response => response.json()).then(data => { missionCatalog = data.missions || []; if (!missionCatalog.some(item => item.id === selectedMission)) selectedMission = missionCatalog[0]?.id || 'kestrel'; render(); }).catch(() => {});
if (activeRoomCode) startPolling();
window.setInterval(() => { if (activeRoomCode && playerId) send({ type: 'heartbeat' }); }, 15000);
