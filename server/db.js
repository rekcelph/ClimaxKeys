const { Pool } = require('pg');

class Database {
    constructor() {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER || 'climax_user',
            host: process.env.POSTGRES_HOST || 'db',
            database: process.env.POSTGRES_DB || 'climax_keys',
            password: process.env.POSTGRES_PASSWORD || 'climax_pass',
            port: process.env.POSTGRES_PORT || 5432,
        });
    }

    async connect() {
        const MAX_RETRIES = 5;
        const RETRY_DELAY = 2000;
        let attempts = 0;

        while (attempts < MAX_RETRIES) {
            try {
                const client = await this.pool.connect();

                await client.query(`
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                await client.query(`
                    CREATE TABLE IF NOT EXISTS high_scores (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                        mode VARCHAR(20) NOT NULL,
                        wpm INTEGER NOT NULL,
                        accuracy DECIMAL(5,2) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                console.log('Database tables initialized.');
                client.release();
                return;
            } catch (err) {
                attempts++;
                console.error(`Error initializing database (attempt ${attempts}/${MAX_RETRIES}):`, err.message);
                if (attempts >= MAX_RETRIES) {
                    console.error('Failed to initialize database after multiple retries.');
                    return;
                }
                await new Promise(res => setTimeout(res, RETRY_DELAY));
            }
        }
    }

    query(text, params) {
        return this.pool.query(text, params);
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = Database;
