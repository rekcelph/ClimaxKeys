export default class ExceptionHandler {
    constructor() {
        this.latestException = null;
        this.innerExceptions = [];
    }

    handle(error, context = '') {
        if (this.latestException) {
            this.innerExceptions.push(this.latestException);
        }
        this.latestException = error;

        console.error(`[Exception] ${context ? context + ':' : ''}`, error);
        if (this.innerExceptions.length > 0) {
            console.error('[Inner Exceptions Cached]', this.innerExceptions);
        }
    }

    wrap(fn, context = '') {
        return (...args) => {
            try {
                return fn(...args);
            } catch (err) {
                this.handle(err, context);
            }
        };
    }
}
