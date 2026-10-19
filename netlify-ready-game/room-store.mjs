import { hydrateRoom, serializeRoom } from './game-engine.mjs';

export async function mutateRoom(store, key, mutate, maxRetries = 12) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const entry = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
    if (!entry) return { room: null, outcome: { changed: false, error: 'ROOM_NOT_FOUND' } };
    const room = hydrateRoom(entry.data);
    const outcome = mutate(room);
    if (!outcome.changed) return { room: entry.data, outcome };
    room.revision = (room.revision || 0) + 1;
    const serialized = serializeRoom(room);
    if (!entry.etag) continue;
    const write = await store.setJSON(key, serialized, { onlyIfMatch: entry.etag });
    if (write.modified) return { room: serialized, outcome };
  }
  return { room: null, outcome: { changed: false, error: 'ROOM_BUSY' } };
}
