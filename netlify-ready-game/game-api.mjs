import {
  advanceExpiredTimers,
  applyCommand,
  createRoom,
  GAME_ERRORS,
  joinRoom,
  makeRoomCode,
  missions,
  newPlayerId,
  safeRoom,
} from './game-engine.mjs';
import { mutateRoom } from './room-store.mjs';

const maxRetries = 12;
function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store', ...headers } });
}
function roomKey(code) { return `room:${code}`; }
function validPlayerId(value) {
  const id = String(value || '');
  return /^[a-zA-Z0-9_-]{8,80}$/.test(id) ? id : '';
}
function validCode(value) {
  const code = String(value || '').trim().toUpperCase();
  return /^[A-F0-9]{4}$/.test(code) ? code : '';
}
function stateResponse(room, playerId) {
  if (!room || room.closed || !room.players.some(([id]) => id === playerId)) {
    return json({ type: 'error', message: 'You are not a member of this room.' }, 404);
  }
  return json({ type: 'state', room: safeRoom(room, playerId) });
}

export function createGameHandler(store, { roundCount = 4 } = {}) {
  return async request => {
    try {
      if (request.method === 'GET') {
        const url = new URL(request.url);
        if (url.searchParams.get('catalog') === '1') {
          return json({ missions: missions.map(({ id, title, pitch }) => ({ id, title, pitch })) });
        }
        const code = validCode(url.searchParams.get('room'));
        const playerId = validPlayerId(url.searchParams.get('player'));
        if (!code || !playerId) return json({ type: 'error', message: GAME_ERRORS.missing }, 400);
        const result = await mutateRoom(store, roomKey(code), room => ({ changed: advanceExpiredTimers(room) }), maxRetries);
        if (result.outcome.error) return json({ type: 'error', message: GAME_ERRORS.missing }, 404);
        if (!result.room || result.room.closed || !result.room.players.some(([id]) => id === playerId)) {
          return json({ type: 'error', message: 'You are not a member of this room.' }, 404);
        }
        const revision = Number(result.room.revision || 0);
        const since = Number(url.searchParams.get('since'));
        if (Number.isFinite(since) && since === revision) return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
        return stateResponse(result.room, playerId);
      }

      if (request.method !== 'POST') return json({ type: 'error', message: 'Method not allowed.' }, 405, { allow: 'GET, POST' });
      const message = await request.json();
      const type = String(message.type || '');
      const playerId = validPlayerId(message.playerId) || newPlayerId();
      const name = String(message.name || 'Crew member').trim().slice(0, 20) || 'Crew member';

      if (type === 'create') {
        for (let attempt = 0; attempt < 20; attempt++) {
          const code = makeRoomCode();
          const room = createRoom(playerId, name, String(message.scenario || 'kestrel'), code, roundCount);
          const write = await store.setJSON(roomKey(code), room, { onlyIfNew: true });
          if (write.modified) return json({ type: 'state', room: safeRoom(room, playerId) }, 201);
        }
        return json({ type: 'error', message: GAME_ERRORS.busy }, 503);
      }

      const code = validCode(message.roomCode || message.code);
      if (!code) return json({ type: 'error', message: GAME_ERRORS.missing }, 400);
      const result = await mutateRoom(store, roomKey(code), room => {
        const timerChanged = advanceExpiredTimers(room);
        if (type === 'join') {
          const joined = joinRoom(room, playerId, name);
          return { ...joined, changed: timerChanged || joined.changed };
        }
        if (!room.players.has(playerId)) return { changed: timerChanged, error: 'You are not a member of this room.' };
        const applied = applyCommand(room, playerId, message);
        if (applied.deleteRoom) {
          room.closed = true;
          room.phase = 'finished';
          return { ...applied, changed: true };
        }
        return { ...applied, changed: timerChanged || applied.changed };
      }, maxRetries);

      if (result.outcome.error) {
        const status = result.outcome.error === GAME_ERRORS.busy ? 503 : [GAME_ERRORS.missing, 'ROOM_NOT_FOUND'].includes(result.outcome.error) ? 404 : 400;
        return json({ type: 'error', message: result.outcome.error }, status);
      }
      return stateResponse(result.room, playerId);
    } catch (error) {
      console.error('Netlify game function error', error);
      return json({ type: 'error', message: 'The game service could not complete that action. Please try again.' }, 500);
    }
  };
}
