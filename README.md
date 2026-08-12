# Climax Keys

> **A retro-styled keyboard blueprint, typing speed test, and multiplayer racing arena.**

![Climax Keys](https://img.shields.io/badge/UI-Retro_Terminal-33ff33?style=for-the-badge)
![Multiplayer](https://img.shields.io/badge/Multiplayer-Socket.io-amber?style=for-the-badge)

**Climax Keys** is a meticulously designed typing application featuring a nostalgic neon-green CRT terminal aesthetic. It offers an interactive keyboard tester, advanced speed typing modes (with combos, streaks, and ranks), and a real-time multiplayer arena where you can race against your friends or AI bots.

## Features

### 01 Key Test
* **Interactive Tracing:** Press any key on your keyboard to highlight it on the virtual keyboard blueprint.
* **Diagnostics:** View exact key codes and track how many physical keys you have successfully tested on your board.

### 02 Speed Test
* **Multiple Modes:** Compete against the clock (Time mode), type a specific number of words (Words mode), practice classic excerpts (Quote mode), or type freely with no limits (Zen mode).
* **Custom Inputs:** Use the fully custom-built retro modal to enter exact time durations, specific word counts, or paste massive paragraphs of your own custom text.
* **Game Mechanics:** Earn streaks and combos for typing without errors. Achieve high WPM (Words Per Minute) to earn ranks (from F to SS).
* **Modifiers:** Toggle numbers and punctuation for an extra challenge.
* **Persistent Leaderboards:** Your Personal Bests and global high scores are saved persistently in a PostgreSQL database.

### 03 Multiplayer Arena
* **Real-time Racing:** Create a room and share the 4-letter room code with friends to race in real-time.
* **AI Bots:** Add bots to the lobby to practice your speed against simulated players.
* **Live Progress:** Watch live progress bars of all racers as you type.

---

## Technology Stack

* **Frontend:** Vanilla HTML, CSS, and JavaScript structured into a clean component layout (`public/css`, `public/js`). Zero frontend frameworks, optimized for raw performance and DOM manipulation.
* **Backend:** Node.js with Express.
* **Database:** PostgreSQL integrated via `node-postgres` for persistent high scores and global leaderboards.
* **Multiplayer:** Socket.io for low-latency WebSocket communication.
* **Deployment:** Multi-container `docker-compose` environment included out of the box.

---

## How to Run (Without Docker)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rekcelph/ClimaxKeys.git
   cd ClimaxKeys
   ```

2. **Setup PostgreSQL:**
   Ensure you have a local PostgreSQL instance running. Set up your environment variables or modify `server/db.js` with your database credentials.

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Play:**
   Open your browser and navigate to `http://localhost:8080`.

---

## How to Run (With Docker)

The easiest way to run the full application (Node server + PostgreSQL database) is using Docker Compose.

1. **Spin up the environment:**

   ```bash
   docker-compose up --build
   ```

2. **Play:**
   Open your browser and navigate to `http://localhost:8080`.
