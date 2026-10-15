const pool = require('../database/db');

// let tarefas = [
//   {
//     id: 1,
//     texto: "Estudar Node",
//     prioridade: "alta",
//     coluna: "andamento",
//     cidade: "",
//     usuarioId: 1,
//     concluidaEm: null,
//   },
//   {
//     id: 2,
//     texto: "Criar API",
//     prioridade: "alta",
//     coluna: "andamento",
//     cidade: "",
//     usuarioId: 1,
//     concluidaEm: null,
//   },
//   {
//     id: 3,
//     texto: "Testar Postman",
//     prioridade: "media",
//     coluna: "concluido",
//     cidade: "",
//     usuarioId: 1,
//     concluidaEm: "2026-03-01T10:00:00.000Z",
//   },
// ];

// let proximoId = 4;

module.exports = {
  listar: async () => {
    const result = await pool.query(
      'SELECT * FROM tarefas ORDER BY id'
    );
    return result.rows;
  },

  listarPorColuna: (coluna) =>
    tarefas.filter((t) => (t.coluna || "afazer") === coluna),

  listarPorPrioridade: (prioridade) =>
    tarefas.filter((t) => t.prioridade === prioridade),

  // buscar: (id) => tarefas.find((t) => t.id === id),

  buscar: async (id) => {
    const result = await pool.query(
      'SELECT * FROM tarefas WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  contarPorUsuario: (usuarioId) =>
    tarefas.filter((t) => t.usuarioId === usuarioId).length,

  contarPorUsuarioEColuna: async (usuarioId, coluna) => {
    const result = await pool.query(
      'SELECT COUNT(*) FROM tarefas WHERE usuario_id = $1 AND coluna = $2',
      [usuarioId, coluna]
    );
    return parseInt(result.rows[0].count, 10);
  },
    
  adicionar: async ({
    texto,
    id_prioridade,
    coluna,
    usuarioId,
    projetoId
  }) => {
    const result = await pool.query(
      `INSERT INTO tarefas
      (texto, id_prioridade, coluna, usuario_id, projeto_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
      [
        texto,
        id_prioridade,
        coluna || "afazer",
        usuarioId,
        projetoId
      ]
    );

    return result.rows[0];
  },


  atualizar: async (id, dados) => {
    const { texto, id_prioridade, coluna, usuarioId } = dados;

    const result = await pool.query(
      `UPDATE tarefas 
     SET texto = COALESCE($1, texto),
         id_prioridade = COALESCE($2, id_prioridade),
         coluna = COALESCE($3, coluna),
         usuario_id = COALESCE($4, usuario_id)
     WHERE id = $5 
     RETURNING *`,
      [texto, id_prioridade, coluna, usuarioId, id]
    );

    return result.rows[0] || null;
  },

 

  remover: async (id) => {
    const result = await pool.query('DELETE FROM tarefas WHERE id=$1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  obterEstatisticas: (coluna) => {
    const base = coluna
      ? tarefas.filter((t) => (t.coluna || "afazer") === coluna)
      : tarefas;

    const total = base.length;

    const porColuna = {
      afazer: base.filter((t) => (t.coluna || "afazer") === "afazer").length,
      andamento: base.filter((t) => t.coluna === "andamento").length,
      concluido: base.filter((t) => t.coluna === "concluido").length,
    };

    const porPrioridade = {
      alta: base.filter((t) => t.prioridade === "alta").length,
      media: base.filter((t) => t.prioridade === "media").length,
      baixa: base.filter((t) => t.prioridade === "baixa").length,
    };

    const colunaMaisTarefas = Object.entries(porColuna).sort(
      (a, b) => b[1] - a[1],
    )[0][0];

    return {
      total,
      porColuna,
      porPrioridade,
      colunaMaisTarefas,
    };
  },
};
