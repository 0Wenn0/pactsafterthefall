# Pacts After the Fall | Pactos de ceniza

> **After the collapse, survival depends on deciding together.** Investigate a crisis, challenge competing interests, negotiate with your crew, and deliver a verdict. Across five post-apocalyptic science-fiction scenarios, every choice has consequences—and no version of the truth is complete. Who would you trust when everyone’s future is at stake?

**Pacts After the Fall** is a bilingual, browser-based multiplayer party game for **2–8 players**. Players join the same room from their own devices using a short room code. The game turns complex questions about automated systems, fairness, power, and public decisions into collaborative stories with real trade-offs.

## Scenarios

Each mission presents a self-contained crisis in a struggling settlement:

- **The Kestrel Quarantine** — *La cuarentena de Kestrel*
- **The Last Reactor** — *El último reactor*
- **The Moving Veil** — *La bruma errante*
- **The Water Compact** — *El pacto del agua*
- **The Ghost Signal** — *La señal fantasma*

## How to play

1. Create a room and share its code with **1–7 other players**.
2. Read the crisis briefing and each player’s private role information.
3. Investigate by choosing actions that uncover shared evidence. Actions and choices change as the crisis develops.
4. Discuss the evidence, negotiate, and decide which risks and interests matter most.
5. Submit a private final verdict. The crew sees the outcome, its consequences, and a learning debrief.

The game does not label one answer as morally correct. Its closing reflection helps players examine what the system measured or omitted, who benefited or carried the cost, and what could change their minds.

## Learning goals

The scenarios invite players to practice:

- **Algorithm literacy:** question the data, assumptions, and limits behind a system’s recommendation.
- **Ethical reasoning:** identify who benefits, who bears risk, and whose needs are missing.
- **Critical thinking:** compare claims with evidence and uncertainty.
- **Deliberation and negotiation:** explain priorities, listen to competing interests, and make a collective decision.
- **Reflection on consequences:** connect a verdict to the outcomes it creates.

## Languages

The interface and missions are available in **English and Spanish**. Each player can choose their preferred language independently.

## Run and deploy

### Deploy with Netlify

This project uses a Netlify Function and Netlify Blobs for persistent multiplayer rooms. Connect the GitHub repository to Netlify, then use these build settings:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

Netlify builds and bundles the function at `netlify/functions/game.ts`. Room state uses a strongly consistent Blobs store with conditional writes so concurrent actions do not silently overwrite one another. No separately managed server or database is required.

You can also deploy the included `netlify-ready-game.zip` through Netlify’s signed-in manual deploy flow. The build must run on Netlify for the function to be available.

### Build and verify locally

Requires **Node.js 22.12 or later**.

```bash
npm install
npm run build
npm test
npm run typecheck
npm run verify:function
```

The build output is written to `dist/`. To play multiplayer locally, run the project through Netlify’s local development environment so the function and Blobs integration are available.

## Tech

- Vanilla JavaScript, HTML, and CSS
- Netlify Functions (TypeScript)
- Netlify Blobs for shared room state
- Node.js test runner, TypeScript, and esbuild

## Project structure

```text
public/                  Frontend, translations, styles, and mission catalog
netlify/functions/game.ts Multiplayer HTTP endpoint
game-api.mjs              Request handling and game actions
room-store.mjs            Strong reads and conditional room updates
game-engine.mjs           Room state, rules, phases, and scoring
decision-rounds.mjs       Evolving decision content for each mission
tests/                    Multiplayer flow and function checks
netlify.toml              Netlify build and function configuration
```

## Project work

This project brings together game-system design, interactive narrative, instructional design, bilingual UX, multiplayer web development, and end-to-end flow validation. Its central design challenge is making complex civic and algorithmic trade-offs understandable through play without reducing them to a single “right answer.”

---

**Pactos de ceniza** es un juego multijugador bilingüe para **2–8 personas**. En cinco escenarios postapocalípticos de ciencia ficción, los equipos investigan una crisis, contrastan intereses, negocian y emiten un veredicto. Cada decisión tiene consecuencias y ninguna versión de los hechos está completa. El juego invita a cuestionar los datos y supuestos de los sistemas automatizados, pensar quién se beneficia y quién asume los riesgos, y reflexionar sobre las decisiones colectivas.
