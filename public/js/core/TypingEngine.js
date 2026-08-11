export const WORD_LIST = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "name", "home", "water", "room", "small", "found", "thought", "still", "family", "hand", "world", "school", "story", "sound", "above", "together", "group", "often", "run", "important", "until", "side", "feet", "night", "walk", "white", "sea", "four", "state", "book", "hear", "stop", "later", "idea", "enough", "eat", "face", "watch", "real", "young", "talk", "soon", "song", "mountain", "river", "city", "light", "kind", "child", "place", "right", "next", "sure", "mean", "keep", "last", "long", "both", "need", "feel", "seem", "ask", "tell", "end", "why", "area", "money", "month", "lot", "study", "word", "business", "issue", "head", "house", "service", "friend", "father", "power", "hour", "game", "line", "member", "law", "car", "community", "president", "team", "minute", "body", "information", "parent", "others", "level", "office", "door", "health", "person", "art", "war", "history", "party", "result", "change", "morning", "reason", "research", "girl", "guy", "moment", "air", "teacher", "force", "education"];

export default class TypingEngine {
    constructor(exceptionHandler) {
        this.exceptionHandler = exceptionHandler;
        this.quotes = null;
        
        this.state = {
            pressedKeys: new Set(),
            testedKeys: new Set(),
            lastKey: null,
            mode: 'time',
            punctuation: false,
            numbers: false,
            timeConfig: 30,
            wordsConfig: 50,
            quoteConfig: 'medium',
            customText: '',
            timeElapsed: 0,
            timeLeft: 30,
            words: [],
            currentWordIndex: 0,
            currentInput: '',
            typedWords: [],
            wordScores: [],
            isActive: false,
            isFinished: false,
            correctChars: 0,
            totalCharsTyped: 0,
            timerInterval: null,
            combo: 1,
            maxCombo: 1,
            streak: 0,
            maxStreak: 0,
            lastRowTop: 0
        };

        // Hooks for UI updates
        this.onTick = null;
        this.onFinish = null;

        // Wrap asynchronous init
        this.fetchQuotes = this.exceptionHandler.wrap(this.fetchQuotes.bind(this), 'TypingEngine.fetchQuotes');
        this.tick = this.exceptionHandler.wrap(this.tick.bind(this), 'TypingEngine.tick');
    }

    async fetchQuotes() {
        try {
            const res = await fetch('/api/quotes');
            const data = await res.json();
            this.quotes = data;
            return data;
        } catch (err) {
            this.exceptionHandler.handle(err, 'fetchQuotes failed');
            this.quotes = {
                short: ["Hack the planet!"],
                medium: ["The sky above the port was the color of television, tuned to a dead channel."],
                long: ["A hacker to me is someone intense about something, someone who figures things out and makes something out of it."]
            };
            return this.quotes;
        }
    }

    generateWords(count) {
        let out = [];
        const puncList = [',', '.', '?', '!', ';', ':', '"', "'", '()'];
        for (let i = 0; i < count; i++) {
            let w = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
            if (this.state.numbers && Math.random() < 0.2) {
                w = Math.floor(Math.random() * 100).toString();
            }
            if (this.state.punctuation && Math.random() < 0.3) {
                let p = puncList[Math.floor(Math.random() * puncList.length)];
                if (p === '()') w = '(' + w + ')';
                else if (p === '"') w = '"' + w + '"';
                else if (p === "'") w = "'" + w + "'";
                else w = w + p;
            }
            out.push(w);
        }
        if (this.state.punctuation && out.length > 0) {
            out[0] = out[0].charAt(0).toUpperCase() + out[0].slice(1);
        }
        return out;
    }

    ensureEnoughWords() {
        if (this.state.mode === 'words' || this.state.mode === 'quote' || this.state.mode === 'zen' || this.state.mode === 'custom') return;
        if (this.state.words.length - this.state.currentWordIndex < 40) {
            this.state.words = this.state.words.concat(this.generateWords(40));
        }
    }

    startTest() {
        this.state.isActive = true;
        this.state.timerInterval = setInterval(() => this.tick(), 1000);
    }

    tick() {
        if (this.state.mode === 'time') {
            this.state.timeLeft -= 1;
            if (this.onTick) this.onTick();
            if (this.state.timeLeft <= 0) this.finishTest();
        } else {
            this.state.timeElapsed += 1;
            if (this.onTick) this.onTick();
        }
    }

    scoreWord(target, typed) {
        let correct = 0;
        let len = Math.max(target.length, typed.length);
        for (let i = 0; i < Math.min(target.length, typed.length); i++) {
            if (target[i] === typed[i]) correct++;
        }
        return { correct, total: len };
    }

    finalizeCurrentWord() {
        const target = this.state.words[this.state.currentWordIndex];
        const s = this.scoreWord(target, this.state.currentInput);
        this.state.correctChars += s.correct;
        this.state.totalCharsTyped += s.total;
        this.state.typedWords[this.state.currentWordIndex] = this.state.currentInput;
        this.state.wordScores[this.state.currentWordIndex] = s;

        const perfect = (this.state.currentInput === target);
        if (perfect) {
            this.state.combo++;
            this.state.streak++;
            if (this.state.combo > this.state.maxCombo) this.state.maxCombo = this.state.combo;
            if (this.state.streak > this.state.maxStreak) this.state.maxStreak = this.state.streak;
        } else {
            this.state.combo = 1;
            this.state.streak = 0;
        }

        this.state.currentWordIndex++;
        this.state.currentInput = '';
        
        if (this.state.mode === 'words' && this.state.currentWordIndex >= this.state.wordsConfig) {
            this.finishTest();
            return { finished: true, perfect };
        }
        
        this.ensureEnoughWords();
        return { finished: false, perfect };
    }

    unfinalizeLastWord() {
        if (this.state.currentWordIndex <= 0) return false;
        this.state.currentWordIndex--;
        const prevScore = this.state.wordScores[this.state.currentWordIndex];
        if (prevScore) {
            this.state.correctChars -= prevScore.correct;
            this.state.totalCharsTyped -= prevScore.total;
        }
        this.state.currentInput = this.state.typedWords[this.state.currentWordIndex] || '';
        this.state.typedWords[this.state.currentWordIndex] = undefined;
        this.state.wordScores[this.state.currentWordIndex] = undefined;
        this.state.combo = 1;
        this.state.streak = 0;
        return true;
    }

    finishTest() {
        clearInterval(this.state.timerInterval);
        this.state.isActive = false;
        this.state.isFinished = true;
        if (this.onFinish) this.onFinish();
    }

    resetTest() {
        clearInterval(this.state.timerInterval);
        if (this.state.mode === 'custom') {
            this.state.words = this.state.customText ? this.state.customText.split(/\s+/) : ['custom', 'text', 'missing'];
        } else if (this.state.mode === 'quote') {
            const quoteData = this.quotes || { medium: ["Loading quotes..."] };
            const list = quoteData[this.state.quoteConfig || 'medium'] || quoteData['medium'];
            const quote = list[Math.floor(Math.random() * list.length)];
            this.state.words = quote.split(/\s+/);
        } else if (this.state.mode === 'zen') {
            this.state.words = [];
        } else {
            const wordCount = this.state.mode === 'words' ? this.state.wordsConfig : 60;
            this.state.words = this.generateWords(wordCount);
        }
        
        this.state.currentWordIndex = 0;
        this.state.currentInput = '';
        this.state.typedWords = [];
        this.state.wordScores = [];
        this.state.isActive = false;
        this.state.isFinished = false;
        this.state.timeLeft = this.state.timeConfig;
        this.state.timeElapsed = 0;
        this.state.correctChars = 0;
        this.state.totalCharsTyped = 0;
        this.state.combo = 1;
        this.state.maxCombo = 1;
        this.state.streak = 0;
        this.state.maxStreak = 0;
        this.state.lastRowTop = 0;
    }

    calculateWpm(elapsed) {
        return elapsed > 0 ? ((this.state.correctChars / 5) / (elapsed / 60)) : 0;
    }

    calculateRawWpm(elapsed) {
        return elapsed > 0 ? ((this.state.totalCharsTyped / 5) / (elapsed / 60)) : 0;
    }
}
