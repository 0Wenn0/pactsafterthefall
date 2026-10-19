# Pactos de ceniza / Pacts After the Fall

A bilingual, browser-based party game for 2–8 players. Players create or join a room with its four-character code, then investigate a crisis, negotiate, cast private verdicts, see the consequences, and reflect on the AI concepts in the story. Every player may choose English or Spanish independently.

## Publish with Netlify Drop

1. Sign in to Netlify and open the team’s **Projects** page.
2. Choose **Add new project → Deploy manually** (or open Netlify Drop).
3. Unzip `netlify-ready-game.zip` and drop the extracted project folder into the deploy area while signed in. Netlify reads `netlify.toml`, runs the included build, bundles the function, and publishes the site.
4. Open the URL Netlify shows. Create a room and share its code with the other players.

Netlify must run the project build so it can bundle the function. Drag-and-drop publishing while signed out uploads files as-is and will not build the function. The game needs no GitHub connection, manually configured environment variables, API keys, or separate database setup. Netlify supplies the Blobs connection to the function.

## How multiplayer state works

The browser sends game actions to `/.netlify/functions/game` and checks for room updates about once a second. The function stores room state in a strongly consistent Netlify Blobs store and uses ETag conditional writes to prevent simultaneous player actions from silently overwriting one another. The server does not run continuously, and rooms remain available across function invocations and deploys.

## Included gameplay

Five missions unfold through four linked decisions. Each stage has new investigation actions and verdict responses. Verdicts change safety, trust, and autonomy; the end-of-game review shows the decision history, the system’s assumptions and omissions, hidden mandates, and crew reflections. The measures are not a moral score, and the game does not identify one correct answer.

## Project files

- `public/` — the full frontend, styles, translations, and mission catalog.
- `netlify/functions/game.ts` — standard Netlify Function for room creation, joining, actions, voting, and polling.
- `game-api.mjs`, `room-store.mjs`, `game-engine.mjs`, and `decision-rounds.mjs` — request handling, conditional room updates, game rules, and scenario generation, all kept outside the Functions directory and bundled as dependencies.
- `netlify.toml` — publish directory and function bundling settings. The game endpoint is the default `/.netlify/functions/game`; no function path override or redirect is used.
- `package.json` and `package-lock.json` — dependency graph and build/test scripts.
- `tests/` — a two-player, three-decision end-to-end game test using a conditional-write Blobs test double.

The packaged project is configured for Netlify’s signed-in drag-and-drop build and deploy flow. It does not require a GitHub connection, user-managed server process, secrets, or a separately provisioned database.

“The Moving Veil” explains the exclusion belt directly in its opening brief: it is a contaminated region where storms cause dangerous exposure and magnetic distortions that can disable vehicles. Its route, toll, and supply terms are also explained in plain language.
