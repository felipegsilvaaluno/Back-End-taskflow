const tarefas = require('./tarefas.docs');
const usuarios = require('./usuarios.docs');
const projetos = require('./projetos.docs'); // 1. Importa a doc de projetos
const comum = require('./comum');

module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'TaskFlow API',
        version: '1.0.0',
        description: 'API do TaskFlow · SENAI CTGAS-ER',
    },
    security: [{ bearerAuth: [] }],

    servers: [{ url: 'http://localhost:3000', description: 'Local' }],

    // 2. Unifica todas as rotas
    paths: {
        ...tarefas.paths,
        ...usuarios.paths,
        ...projetos.paths
    },

    components: {
        // 3. Unifica todos os schemas
        schemas: {
            ...comum.schemas,
            ...tarefas.schemas,
            ...usuarios.schemas,
            ...projetos.schemas
        },

        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};