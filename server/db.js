const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'climax_user',
    host: process.env.POSTGRES_HOST || 'db',
    database: process.env.POSTGRES_DB || 'climax_keys',
    password: process.env.POSTGRES_PASSWORD || 'climax_pass',
    port: process.env.POSTGRES_PORT || 5432,
});

async function initDb(retries = 5) {
    while (retries > 0) {
        try {
            const client = await pool.connect();
            
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
            console.error('Error initializing database, retrying...', err.message);
            retries -= 1;
            await new Promise(res => setTimeout(res, 2000));
        }
    }
    console.error('Failed to initialize database after multiple retries.');
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDb
};
