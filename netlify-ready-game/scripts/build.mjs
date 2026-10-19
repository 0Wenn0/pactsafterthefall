import { cp, mkdir, rm, access } from 'node:fs/promises';
import { constants } from 'node:fs';

const source = new URL('../public/', import.meta.url);
const output = new URL('../dist/', import.meta.url);
await access(new URL('index.html', source), constants.R_OK);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
// The full mission source contains private clues and scoring details. The
// public catalog is served through the function, which exposes only summaries.
await rm(new URL('missions.json', output), { force: true });
console.log('Production assets copied to dist/. Netlify bundles netlify/functions/game.ts during deploy.');
