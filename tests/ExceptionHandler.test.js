import test from 'node:test';
import assert from 'node:assert/strict';
import ExceptionHandler from '../public/js/utils/ExceptionHandler.js';

test('ExceptionHandler caches the latest exception', () => {
    const handler = new ExceptionHandler();
    const error1 = new Error('First error');
    
    handler.handle(error1);
    
    assert.strictEqual(handler.latestException, error1);
    assert.strictEqual(handler.innerExceptions.length, 0);
});

test('ExceptionHandler caches inner exceptions when multiple exceptions occur', () => {
    const handler = new ExceptionHandler();
    const error1 = new Error('First error');
    const error2 = new Error('Second error');
    const error3 = new Error('Third error');
    
    handler.handle(error1);
    handler.handle(error2);
    handler.handle(error3);
    
    assert.strictEqual(handler.latestException, error3);
    assert.strictEqual(handler.innerExceptions.length, 2);
    assert.strictEqual(handler.innerExceptions[0], error1);
    assert.strictEqual(handler.innerExceptions[1], error2);
});

test('ExceptionHandler wrap method catches and handles errors', () => {
    const handler = new ExceptionHandler();
    
    const throwingFn = () => {
        throw new Error('Wrapped error');
    };
    
    const wrappedFn = handler.wrap(throwingFn, 'TestContext');
    
    // Should not throw, should handle internally
    wrappedFn();
    
    assert.strictEqual(handler.latestException.message, 'Wrapped error');
});
