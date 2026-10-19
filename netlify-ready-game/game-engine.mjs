import { randomBytes, randomUUID } from 'node:crypto';
import missionData from './public/missions.json' with { type: 'json' };
import { followUpRounds, initialFourthChoice, initialInvestigationActions } from './decision-rounds.mjs';

export const missions = structuredClone(missionData.missions);
export const roles = missionData.roles;
export const agendas = missionData.agendas;

for (const mission of missions) {
  const fourth = initialFourthChoice(mission.id);
  if (fourth) mission.options.push(fourth);
  mission.actions = initialInvestigationActions(mission.id, mission.actions);
}

const scenarioById = new Map(missions.map(mission => [mission.id, mission]));
const roundsById = new Map(missions.map(mission => [mission.id, [null, ...followUpRounds(mission.id)]]));

export function newPlayerId() { return randomUUID(); }

function hydrated(room) {
  return {
    ...room,
    players: new Map(room.players),
    evidenceSources: new Set(room.evidenceSources || [])
  };
}

export function serializeRoom(room) {
  return { ...room, players: [...room.players.entries()], evidenceSources: [...room.evidenceSources] };
}

export function hydrateRoom(room) { return hydrated(room); }

function fallbackOption(room) {
  const options = currentScenario(room).options;
  return options.find(option => option.isFallback) || options.find(option => option.id === 'staged') || options[0];
}

function currentScenario(room) {
  const round = roundsById.get(room.scenario.id)?.[room.roundIndex];
  if (!round) return { ...room.scenario, roundTitle: room.scenario.title };
  const transition = room.lastDecisionType === 'contain'
    ? { en: 'After the previous decision, the response moved quickly, but people left outside the plan are asking for a voice.', es: 'Tras la decisión anterior, la respuesta avanzó rápido, pero quienes quedaron fuera del plan piden tener voz.' }
    : room.lastDecisionType === 'override'
      ? { en: 'The previous decision shared control with affected people. That built more support, but cost time and coordination.', es: 'La decisión anterior compartió el control con las personas afectadas. Eso generó más apoyo, pero consumió tiempo y coordinación.' }
      : room.lastDecisionType === 'protect'
        ? { en: 'The previous decision protected the people facing the greatest immediate harm, shifting part of the remaining risk to others.', es: 'La decisión anterior protegió a quienes enfrentaban el daño más inmediato y trasladó parte del riesgo restante a otras personas.' }
        : { en: 'The previous decision paused for verification. The crew has more time to check assumptions, but the delay has used scarce resources.', es: 'La decisión anterior se detuvo para verificar. La tripulación puede comprobar supuestos, pero la demora consumió recursos escasos.' };
  return { ...room.scenario, roundTitle: round.title, briefing: { en: `${transition.en}\n\n${round.briefing.en}`, es: `${transition.es}\n\n${round.briefing.es}` }, signals: round.signals, options: round.options, actions: round.actions };
}

export function safeRoom(roomValue, clientId) {
  const room = roomValue.players instanceof Map ? roomValue : hydrated(roomValue);
  const view = currentScenario(room);
  const { clues: _clues, specials: _specials, concepts: _concepts, systemReveal: _systemReveal, actions, ...scenarioBase } = view;
  const publicScenario = {
    ...scenarioBase,
    options: scenarioBase.options.map(option => {
      const { alignment: _alignment, ...publicOption } = option;
      if (['consequences', 'debrief', 'reflection', 'finished'].includes(room.phase)) return publicOption;
      const { delta: _delta, ...withoutScore } = publicOption;
      return withoutScore;
    }),
    actions: Object.fromEntries(Object.entries(actions).map(([key, action]) => [key, { title: action.title, description: action.description }])),
    ...(['debrief', 'reflection', 'finished'].includes(room.phase) ? { concepts: _concepts, systemReveal: _systemReveal } : {})
  };
  return {
    code: room.code, phase: room.phase, hostId: room.hostId, deadline: room.deadline, decisionReason: room.decisionReason,
    roundIndex: room.roundIndex, roundCount: room.roundCount || 4, revision: room.revision || 0, decisionHistory: room.decisionHistory,
    votesSubmitted: [...room.players.values()].filter(player => player.vote).length,
    scenario: publicScenario, tracks: room.tracks, actionCount: room.actionCount,
    selected: room.selected, winner: room.winner, events: room.events.slice(-16), chat: room.chat.slice(-24),
    reflections: room.reflections, lastDelta: room.lastDelta,
    players: [...room.players.values()].map(player => ({ id: player.id, name: player.name, role: player.role, connected: player.lastSeen ? Date.now() - player.lastSeen < 45000 : player.connected, ready: player.ready, hasActed: player.hasActed, action: player.action, vote: player.id === clientId || ['consequences', 'debrief', 'reflection', 'finished'].includes(room.phase) ? player.vote : null, reflection: player.reflection, ...(player.id === clientId || room.phase === 'finished' ? { secret: player.secret, privateInfo: player.privateInfo, specialUsed: player.specialUsed } : {}), ...(room.phase === 'finished' ? { mandateMet: player.mandateMet } : {}) })),
    you: room.players.get(clientId) ? { id: clientId, secret: room.players.get(clientId).secret, privateInfo: room.players.get(clientId).privateInfo } : null
  };
}

function addEvent(room, title, text) { room.events.push({ title, text, at: Date.now() }); }

function makeRoom(clientId, name, scenarioId, code, roundCount = 4) {
  const room = { code, hostId: clientId, phase: 'lobby', scenario: scenarioById.get(scenarioId) || missions[0], players: new Map(), tracks: { safety: 2, trust: 2, autonomy: 2 }, actionCount: 0, evidenceSources: new Set(), selected: null, winner: null, decisionReason: null, deadline: null, events: [], chat: [], reflections: [], roundIndex: 0, roundCount, decisionHistory: [], lastDelta: null, revision: 1 };
  room.players.set(clientId, { id: clientId, name, role: null, connected: true, lastSeen: Date.now(), ready: true, hasActed: false, action: null, vote: null, reflection: '' });
  return room;
}

function startGame(room) {
  for (const [id, player] of room.players) if (player.lastSeen && Date.now() - player.lastSeen >= 45000) room.players.delete(id);
  if (room.players.size < 2 || room.players.size > 8) return false;
  const list = [...room.players.values()];
  const roleDeck = [...roles].sort(() => Math.random() - 0.5);
  const agendaDeck = [...agendas].sort(() => Math.random() - 0.5);
  const hiddenCount = list.length >= 7 ? 2 : 1;
  list.sort(() => Math.random() - 0.5).forEach((player, i) => {
    const role = roleDeck[i % roleDeck.length];
    player.role = role.name; player.privateInfo = { en: `${role.description.en} ${room.scenario.clues[i % room.scenario.clues.length].en}`, es: `${role.description.es} ${room.scenario.clues[i % room.scenario.clues.length].es}` }; player.clueIndex = i % room.scenario.clues.length; player.hasActed = false; player.vote = null; player.reflection = '';
    const agendaIndex = i % agendaDeck.length;
    const specialIndex = agendas.findIndex(agenda => agenda.id === agendaDeck[agendaIndex].id);
    player.secret = i < hiddenCount ? { ...agendaDeck[agendaIndex], special: room.scenario.specials[specialIndex] } : null; player.specialUsed = false;
  });
  room.phase = 'briefing'; room.events = []; room.chat = []; room.reflections = []; room.tracks = { safety: 2, trust: 2, autonomy: 2 }; room.actionCount = 0; room.evidenceSources.clear(); room.selected = null; room.winner = null; room.decisionReason = null; room.roundIndex = 0; room.decisionHistory = []; room.lastDelta = null; room.lastDecisionType = null;
  addEvent(room, { en: 'Emergency channel open', es: 'Canal de emergencia abierto' }, room.scenario.opening);
  return true;
}

function changePhase(room, next) {
  room.phase = next;
  if (next === 'negotiation') room.deadline = Date.now() + 90000;
  else if (next === 'vote') room.deadline = Date.now() + 45000;
  else room.deadline = null;
  if (next === 'investigation') addEvent(room, { en: 'Investigation window', es: 'Fase de investigación' }, { en: 'Inspect the system, verify an independent record, or ask affected residents.', es: 'Revisa el sistema, verifica un registro independiente o escucha a las personas afectadas.' });
  if (next === 'negotiation') addEvent(room, { en: 'Debate and negotiation', es: 'Debate y negociación' }, { en: 'Compare evidence and interests. Each player has 90 seconds to make a case or change their mind. This stage’s verdict comes next.', es: 'Comparen las pruebas y los intereses. Cada persona tiene 90 segundos para defender su postura o cambiar de opinión. Después registrarán el veredicto de esta etapa.' });
  if (next === 'vote') addEvent(room, { en: 'Final verdict', es: 'Veredicto final' }, { en: 'Choose one response and confirm your private vote. A tie or no votes applies the announced fallback plan.', es: 'Elijan una respuesta y confirmen su voto privado. Si hay empate o nadie vota, se aplica el plan de respaldo anunciado.' });
  if (next === 'consequences' && room.winner) {
    const choice = currentScenario(room).options.find(option => option.id === room.winner);
    room.lastDecisionType = choice.alignment || choice.id;
    room.lastDelta = {};
    for (const key of Object.keys(room.tracks)) {
      const before = room.tracks[key]; room.tracks[key] = Math.max(0, Math.min(5, before + choice.delta[key])); room.lastDelta[key] = room.tracks[key] - before;
    }
    room.decisionHistory.push({ roundIndex: room.roundIndex, choiceId: choice.id, alignment: choice.alignment || choice.id, name: choice.name, result: choice.result, tracks: { ...room.tracks }, delta: { ...room.lastDelta } });
    addEvent(room, { en: 'Choice in motion', es: 'La decisión está en marcha' }, choice.result);
  }
  if (next === 'debrief') addEvent(room, { en: 'What the system was doing', es: 'Qué hacía el sistema' }, room.scenario.systemReveal);
  if (next === 'finished') {
    for (const player of room.players.values()) {
      const mandate = player.secret?.id;
      player.mandateMet = mandate === 'continuity' ? room.decisionHistory.some(decision => decision.alignment === 'contain')
        : mandate === 'contract' ? room.decisionHistory.every(decision => decision.alignment !== 'override')
        : mandate === 'access' ? (player.specialUsed || room.evidenceSources.has('residents'))
        : mandate === 'evidence' ? room.evidenceSources.size >= 2 : null;
    }
  }
}

export function applyCommand(roomValue, clientId, msg) {
  const room = roomValue.players instanceof Map ? roomValue : hydrated(roomValue);
  const player = room.players.get(clientId);
  if (!player) return { changed: false, error: 'You are not a member of this room.' };
  if (msg.type === 'heartbeat') {
    if (!player.lastSeen || Date.now() - player.lastSeen >= 12000) { player.lastSeen = Date.now(); player.connected = true; return { changed: true }; }
    return { changed: false };
  }
  if (msg.type === 'start' && clientId === room.hostId && room.phase === 'lobby') return { changed: startGame(room) };
  if (msg.type === 'advance' && clientId === room.hostId) {
    const next = { briefing: 'investigation', investigation: 'negotiation', negotiation: 'vote', consequences: 'debrief', debrief: 'reflection', reflection: 'finished' }[room.phase];
    if (room.phase === 'consequences' && room.roundIndex < (room.roundCount || 4) - 1) {
      room.roundIndex++; room.phase = 'briefing'; room.winner = null; room.decisionReason = null; room.lastDelta = null; room.actionCount = 0;
      for (const crewMember of room.players.values()) { crewMember.hasActed = false; crewMember.action = null; crewMember.vote = null; }
      addEvent(room, { en: `Decision ${room.roundIndex + 1} begins`, es: `Comienza la decisión ${room.roundIndex + 1}` }, currentScenario(room).briefing);
      return { changed: true };
    }
    if (room.phase === 'investigation' && [...room.players.values()].some(crewMember => (!crewMember.lastSeen || Date.now() - crewMember.lastSeen < 45000) && !crewMember.hasActed)) return { changed: false };
    if (next) { changePhase(room, next); return { changed: true }; }
  }
  if (msg.type === 'action' && room.phase === 'investigation' && !player.hasActed) {
    const result = currentScenario(room).actions[msg.action]; if (!result) return { changed: false };
    player.hasActed = true; player.action = msg.action; room.actionCount++;
    room.evidenceSources.add(result.source || msg.action);
    addEvent(room, { en: `${player.name}: ${result.title.en}`, es: `${player.name}: ${result.title.es}` }, result.evidence);
    return { changed: true };
  }
  if (msg.type === 'special' && ['investigation', 'negotiation'].includes(room.phase) && player.secret && !player.specialUsed) {
    player.specialUsed = true;
    if (player.secret.id === 'access') { player.action = 'residents'; room.evidenceSources.add('residents'); }
    if (player.secret.id === 'evidence') room.evidenceSources.add('independent-audit');
    addEvent(room, { en: `${player.name} raises a stakeholder issue`, es: `${player.name} plantea un interés de una parte involucrada` }, player.secret.special);
    return { changed: true };
  }
  if (msg.type === 'chat' && ['investigation', 'negotiation', 'vote'].includes(room.phase)) {
    const text = String(msg.text || '').trim().slice(0, 400); if (!text) return { changed: false };
    room.chat.push({ name: player.name, text, at: Date.now() }); return { changed: true };
  }
  if (msg.type === 'vote' && room.phase === 'vote' && !player.vote && currentScenario(room).options.some(option => option.id === msg.choice)) {
    player.vote = msg.choice;
    const activePlayers = [...room.players.values()].filter(crewMember => !crewMember.lastSeen || Date.now() - crewMember.lastSeen < 45000);
    const votes = activePlayers.filter(crewMember => crewMember.vote);
    if (votes.length === activePlayers.length) {
      const counts = Object.fromEntries(currentScenario(room).options.map(option => [option.id, votes.filter(crewMember => crewMember.vote === option.id).length]));
      const top = Math.max(...Object.values(counts));
      const tied = Object.keys(counts).filter(key => counts[key] === top);
      room.decisionReason = tied.length > 1 ? 'tie' : 'vote';
      room.winner = tied.length > 1 ? fallbackOption(room).id : tied[0];
      changePhase(room, 'consequences');
    }
    return { changed: true };
  }
  if (msg.type === 'reflect' && room.phase === 'reflection') {
    const text = String(msg.text || '').trim().slice(0, 500); if (!text) return { changed: false };
    player.reflection = text; room.reflections = [...room.players.values()].filter(crewMember => crewMember.reflection).map(crewMember => ({ name: crewMember.name, text: crewMember.reflection }));
    return { changed: true };
  }
  if (msg.type === 'leave') {
    room.players.delete(clientId);
    if (!room.players.size) return { changed: true, deleteRoom: true };
    if (room.hostId === clientId) room.hostId = room.players.keys().next().value;
    return { changed: true };
  }
  return { changed: false };
}

export function advanceExpiredTimers(roomValue, now = Date.now()) {
  const room = roomValue.players instanceof Map ? roomValue : hydrated(roomValue);
  if (!room.deadline || room.deadline > now) return false;
  if (room.phase === 'negotiation') { changePhase(room, 'vote'); return true; }
  if (room.phase !== 'vote') return false;
  const activePlayers = [...room.players.values()].filter(player => !player.lastSeen || now - player.lastSeen < 45000);
  const votes = activePlayers.filter(player => player.vote);
  if (!votes.length) { room.winner = fallbackOption(room).id; room.decisionReason = 'no-votes'; }
  else {
    const counts = Object.fromEntries(currentScenario(room).options.map(option => [option.id, votes.filter(player => player.vote === option.id).length]));
    const top = Math.max(...Object.values(counts)); const tied = Object.keys(counts).filter(key => counts[key] === top);
    room.decisionReason = tied.length > 1 ? 'tie' : 'vote'; room.winner = tied.length > 1 ? fallbackOption(room).id : tied[0];
  }
  changePhase(room, 'consequences');
  return true;
}

export function createRoom(clientId, name, scenarioId, code, roundCount = 4) {
  return serializeRoom(makeRoom(clientId, String(name || 'Commander').trim().slice(0, 20) || 'Commander', scenarioId, code, roundCount));
}

export function makeRoomCode() { return randomBytes(3).toString('hex').slice(0, 4).toUpperCase(); }

export const GAME_ERRORS = {
  missing: 'That room code was not found. Check it and try again.',
  started: 'This mission has already started.',
  full: 'This room is full. The crew limit is eight.',
  busy: 'The room is receiving several actions. Please try again.'
};

export function joinRoom(roomValue, clientId, name) {
  const room = roomValue.players instanceof Map ? roomValue : hydrated(roomValue);
  if (room.phase !== 'lobby') return { changed: false, error: GAME_ERRORS.started };
  for (const [id, player] of room.players) if (player.lastSeen && Date.now() - player.lastSeen >= 45000) room.players.delete(id);
  if (room.players.has(clientId)) return { changed: false };
  if (room.players.size >= 8) return { changed: false, error: GAME_ERRORS.full };
  room.players.set(clientId, { id: clientId, name: String(name || 'Crew member').trim().slice(0, 20) || 'Crew member', role: null, connected: true, lastSeen: Date.now(), ready: true, hasActed: false, action: null, vote: null, reflection: '' });
  return { changed: true };
}
