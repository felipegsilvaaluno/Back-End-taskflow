require("dotenv").config();

const logger = require("./src/middlewares/logger");
const validarContentType = require("./src/middlewares/validarContentType");
const temporizador = require("./src/middlewares/temporizador");
const autenticar = require("./src/middlewares/autenticar");
const tratarErros = require('./src/middlewares/erro.middleware');
const criarErro = require("./src/utils/criarErro");

const pool = require('./src/database/db');

const express = require("express");

const tarefasRoutes = require("./src/routes/tarefas.routes");
const usuariosRoutes = require("./src/routes/usuarios.routes");
const projetosRoutes = require("./src/routes/projetos.routes");
const authRoutes = require("./src/routes/auth.routes");
const prioridadeRoutes = require("./src/routes/prioridades.routes");

const swaggerUi = require('swagger-ui-express');
const openapi = require('./src/docs/openapi');

// CDN atualizada para carregar os arquivos minificados corretamente na Vercel
const SWAGGER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3';

const app = express();
const cors = require("cors");
const PORTA = process.env.PORTA || 3000;

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Erro ao conectar:', err.message);
  else console.log('Banco conectado:', res.rows[0].now);
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

app.use(express.json());
app.use(validarContentType);
app.use(logger);
app.use(temporizador);

// Rota dos Docs com os links ajustados
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, {
  customCssUrl: `${SWAGGER_CDN}/swagger-ui.min.css`,
  customJs: [
    `${SWAGGER_CDN}/swagger-ui-bundle.js`,
    `${SWAGGER_CDN}/swagger-ui-standalone-preset.js`,
  ],
}));

app.use("/auth", authRoutes);
app.use("/usuarios", autenticar, usuariosRoutes);
app.use("/tarefas", autenticar, tarefasRoutes);
app.use("/projetos", autenticar, projetosRoutes);
app.use("/prioridades", autenticar, prioridadeRoutes);

// Rota 404
app.use((req, res) => {
  const rota = `${req.method} ${req.url}`;
  throw criarErro(404, `Rota ${rota} não encontrada`);
});

app.use(tratarErros);

// Executa o listen APENAS se estiver rodando localmente (não na Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORTA, () => console.log(`Porta ${PORTA}`));
}

// OBRIGATÓRIO PARA A VERCEL: Exporta a aplicação para virar função Serverless
module.exports = app;