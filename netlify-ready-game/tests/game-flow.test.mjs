import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameHandler } from '../game-api.mjs';

class MemoryBlobStore {
  values = new Map();
  reads = 0;
  conditionalWrites = 0;
  conflicts = 0;

  async getWithMetadata(key, options) {
    assert.equal(options.consistency, 'strong', 'room reads use strong consistency');
    this.reads++;
    const item = this.values.get(key);
    return item ? { data: structuredClone(item.value), etag: item.etag } : null;
  }

  async setJSON(key, value, options = {}) {
    const current = this.values.get(key);
    if (options.onlyIfNew) {
      this.conditionalWrites++;
      if (current) { this.conflicts++; return { modified: false }; }
    } else if (options.onlyIfMatch) {
      this.conditionalWrites++;
      if (!current || current.etag !== options.onlyIfMatch) { this.conflicts++; return { modified: false }; }
    } else {
      assert.fail('room writes must use conditional writes');
    }
    const version = (current?.version || 0) + 1;
    const etag = `etag-${version}`;
    this.values.set(key, { value: structuredClone(value), etag, version });
    return { modified: true, etag };
  }
}

async function post(handler, body) {
  return handler(new Request('https://game.test/.netlify/functions/game', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
  }));
}

async function get(handler, room, player, since) {
  const query = new URLSearchParams({ room, player });
  if (since !== undefined) query.set('since', String(since));
  return handler(new Request(`https://game.test/.netlify/functions/game?${query}`));
}

test('two players complete three decisions through the Netlify endpoint, with scoring and a final winner', async () => {
  const store = new MemoryBlobStore();
  const handler = createGameHandler(store, { roundCount: 3 });
  const host = 'player-host-0001';
  const guest = 'player-guest-0002';
  const createResponse = await post(handler, { type: 'create', name: 'Mara', scenario: 'water', playerId: host });
  assert.equal(createResponse.status, 201);
  let room = (await createResponse.json()).room;
  const code = room.code;
  const joinResponse = await post(handler, { type: 'join', name: 'Sol', playerId: guest, roomCode: code });
  assert.equal(joinResponse.status, 200);
  room = (await joinResponse.json()).room;
  room = (await (await post(handler, { type: 'start', playerId: host, roomCode: code })).json()).room;
  assert.equal(room.phase, 'briefing');

  const winningChoices = [];
  const trackSnapshots = [];
  for (let round = 0; round < 3; round++) {
    room = (await (await post(handler, { type: 'advance', playerId: host, roomCode: code })).json()).room;
    assert.equal(room.phase, 'investigation');
    const [hostAction, guestAction] = Object.keys(room.scenario.actions).slice(0, 2);
    const [hostActionResponse, guestActionResponse] = await Promise.all([
      post(handler, { type: 'action', action: hostAction, playerId: host, roomCode: code }),
      post(handler, { type: 'action', action: guestAction, playerId: guest, roomCode: code })
    ]);
    assert.equal(hostActionResponse.status, 200);
    assert.equal(guestActionResponse.status, 200);
    room = (await (await get(handler, code, host)).json()).room;
    assert.equal(room.actionCount, 2, 'both simultaneous investigation actions are retained');
    room = (await (await post(handler, { type: 'advance', playerId: host, roomCode: code })).json()).room;
    assert.equal(room.phase, 'negotiation');
    room = (await (await post(handler, { type: 'chat', text: `We should compare the evidence in round ${round + 1}.`, playerId: host, roomCode: code })).json()).room;
    room = (await (await post(handler, { type: 'advance', playerId: host, roomCode: code })).json()).room;
    assert.equal(room.phase, 'vote');

    const firstChoice = room.scenario.options.find(option => !option.isFallback) || room.scenario.options[0];
    winningChoices.push(firstChoice.id);
    room = (await (await post(handler, { type: 'vote', choice: firstChoice.id, playerId: host, roomCode: code })).json()).room;
    assert.equal(room.phase, 'vote', 'the first private vote does not reveal the result');
    const guestView = (await (await get(handler, code, guest)).json()).room;
    assert.equal(guestView.players.find(player => player.id === host).vote, null, 'the other player cannot see a private vote');
    room = (await (await post(handler, { type: 'vote', choice: firstChoice.id, playerId: guest, roomCode: code })).json()).room;
    assert.equal(room.phase, 'consequences');
    assert.equal(room.winner, firstChoice.id);
    assert.equal(room.decisionHistory.length, round + 1);
    assert.ok(Object.values(room.lastDelta).some(value => value !== 0), 'the winning verdict changes a colony measure');
    trackSnapshots.push({ ...room.tracks });
    assert.deepEqual(room.tracks, room.decisionHistory.at(-1).tracks);

    if (round < 2) {
      room = (await (await post(handler, { type: 'advance', playerId: host, roomCode: code })).json()).room;
      assert.equal(room.roundIndex, round + 1);
      assert.equal(room.phase, 'briefing');
    }
  }

  assert.equal(room.roundCount, 3);
  assert.notDeepEqual(trackSnapshots[0], trackSnapshots[2], 'colony measures accumulate across decisions');
  room = (await (await post(handler, { type: 'advance', playerId: host, roomCode: code })).json()).room;
  assert.equal(room.phase, 'debrief');
  room = (await (await post(handler, { type: 'advance', playerId: host, roomCode: code })).json()).room;
  assert.equal(room.phase, 'reflection');
  room = (await (await post(handler, { type: 'reflect', text: 'We would ask who was missing from the data.', playerId: host, roomCode: code })).json()).room;
  room = (await (await post(handler, { type: 'reflect', text: 'I would ask who carries the cost.', playerId: guest, roomCode: code })).json()).room;
  room = (await (await post(handler, { type: 'advance', playerId: host, roomCode: code })).json()).room;
  assert.equal(room.phase, 'finished');
  assert.equal(room.decisionHistory.length, 3);
  assert.equal(room.decisionHistory.at(-1).choiceId, winningChoices.at(-1));
  assert.ok(room.players.every(player => typeof player.mandateMet === 'boolean' || player.mandateMet === null));
  assert.ok(store.reads > 10);
  assert.ok(store.conditionalWrites > 10);
  assert.ok(store.conflicts > 0, 'concurrent actions exercised ETag compare-and-swap retries');
});

test('polling returns no content when a room revision has not changed', async () => {
  const store = new MemoryBlobStore();
  const handler = createGameHandler(store);
  const host = 'player-poller-0001';
  const response = await post(handler, { type: 'create', name: 'Iris', scenario: 'water', playerId: host });
  const room = (await response.json()).room;
  assert.equal((await get(handler, room.code, host, room.revision)).status, 204);
});
