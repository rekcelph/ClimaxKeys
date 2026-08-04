# Climax Keys ⌨️

> **A retro-styled keyboard blueprint, typing speed test, and multiplayer racing arena.**

![Climax Keys](https://img.shields.io/badge/UI-Retro_Terminal-33ff33?style=for-the-badge)
![Multiplayer](https://img.shields.io/badge/Multiplayer-Socket.io-amber?style=for-the-badge)

Climax Keys is a meticulously designed typing application featuring a nostalgic neon-green CRT terminal aesthetic. It offers an interactive keyboard tester, advanced speed typing modes (with combos, streaks, and ranks), and a real-time multiplayer arena where you can race against your friends or AI bots.

---

## ✨ Features

### 01 Key Test
* **Interactive Tracing:** Press any key on your keyboard to highlight it on the virtual keyboard blueprint.
* **Diagnostics:** View exact key codes and track how many physical keys you have successfully tested on your board.

### 02 Speed Test
* **Multiple Modes:** Compete against the clock (Time mode) or type a specific number of words (Words mode).
* **Custom Inputs:** Use the fully custom-built retro modal to enter exact time durations, specific word counts, or paste massive paragraphs of your own custom text.
* **Game Mechanics:** Earn streaks and combos for typing without errors. Achieve high WPM (Words Per Minute) to earn ranks (from F to SS).
* **Modifiers:** Toggle numbers and punctuation for an extra challenge.

### 03 Multiplayer Arena
* **Real-time Racing:** Create a room and share the 4-letter room code with friends to race in real-time.
* **AI Bots:** Add bots to the lobby to practice your speed against simulated players.
* **Live Progress:** Watch live progress bars of all racers as you type.

---

## 🛠️ Technology Stack

* **Frontend:** Vanilla HTML, CSS, and JavaScript. Zero frontend frameworks, optimized for raw performance and DOM manipulation.
* **Backend:** Node.js with Express.
* **Multiplayer:** Socket.io for low-latency WebSocket communication.
* **Deployment:** Docker support included out of the box.

---

## 🚀 How to Run (Local)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rekcelph/ClimaxKeys.git
   cd ClimaxKeys
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Play:**
   Open your browser and navigate to `http://localhost:8080`.

---

## 🐳 How to Run (Docker)

You can easily containerize and run the application using the included Dockerfile.

1. **Build the image:**
   ```bash
   docker build -t climax-keys .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8080:8080 climax-keys
   ```

3. **Play:**
   Open your browser and navigate to `http://localhost:8080`.