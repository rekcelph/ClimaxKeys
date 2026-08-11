import ExceptionHandler from './utils/ExceptionHandler.js';
import AudioEngine from './core/AudioEngine.js';
import TypingEngine from './core/TypingEngine.js';
import MultiplayerManager from './core/MultiplayerManager.js';
import UIManager from './ui/UIManager.js';

const exceptionHandler = new ExceptionHandler();

try {
    const audioEngine = new AudioEngine(exceptionHandler);
    const typingEngine = new TypingEngine(exceptionHandler);
    const multiplayerManager = new MultiplayerManager(exceptionHandler);
    
    const uiManager = new UIManager(exceptionHandler, typingEngine, audioEngine, multiplayerManager);
    uiManager.init();
} catch (error) {
    exceptionHandler.handle(error, 'App Initialization');
}