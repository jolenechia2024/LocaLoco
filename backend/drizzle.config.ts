import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './src/drizzle',
    schema: './src/database/schema.ts',
    dialect: 'mysql',
    dbCredentials: {
        host: String(process.env.DB_HOST),
        user: String(process.env.DB_USER),
        password: String(process.env.DB_PASSWORD),
        database: String(process.env.DB_NAME),
        port: Number(process.env.DB_PORT),
    },
    verbose:true,
    strict:true
});