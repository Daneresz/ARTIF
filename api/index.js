import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from '../routes/route.js';
import fs from 'fs';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// Caminho correto das views e public
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Servir arquivos estáticos
app.use(express.static(join(__dirname, '../public')));
app.set('views', join(__dirname, '../views'));

// Servir uploads do /tmp em produção (Vercel)
if (process.env.NODE_ENV === 'production') {
    app.use('/uploads', express.static('/tmp/uploads', { 
        setHeaders: (res, path) => {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }
    }));
}

// Health check para Vercel
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas
app.use(routes);

// Error handler global
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Exporta o handler compatível com Vercel
export default app;
