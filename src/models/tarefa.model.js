const pool = require('../database/db');

module.exports = {
  listar: async (query = {}) => {
    let sql = 'SELECT * FROM tarefas WHERE 1=1';
    const params = [];

    if (query.coluna) {
      params.push(query.coluna);
      sql += ` AND coluna = $${params.length}`;
    }

    if (query.id_prioridade) {
      params.push(query.id_prioridade);
      sql += ` AND id_prioridade = $${params.length}`;
    }

    if (query.usuario_id) {
      params.push(query.usuario_id);
      sql += ` AND usuario_id = $${params.length}`;
    }

    sql += ' ORDER BY id';
    const result = await pool.query(sql, params);
    return result.rows;
  },

  buscar: async (id) => {
    const result = await pool.query(
      'SELECT * FROM tarefas WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

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
    const colunaFinal = coluna || "afazer";
    const agora = new Date();

    // Se criada direto como andamento ou concluído, registra as datas correspondentes
    const iniciadaEm = colunaFinal === "andamento" ? agora : null;
    const concluidaEm = colunaFinal === "concluido" ? agora : null;

    const result = await pool.query(
      `INSERT INTO tarefas
        (texto, id_prioridade, coluna, usuario_id, projeto_id, criado_em, iniciada_em, concluida_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        texto,
        id_prioridade,
        colunaFinal,
        usuarioId,
        projetoId,
        agora,
        iniciadaEm,
        concluidaEm
      ]
    );

    return result.rows[0];
  },

  atualizar: async (id, dados) => {
    const tarefaAtual = await pool.query('SELECT * FROM tarefas WHERE id = $1', [id]);

    if (tarefaAtual.rows.length === 0) return null;

    const concluidaEm = dados.coluna === 'concluido' ? new Date() : null;

    let iniciadaEm = tarefaAtual.rows[0].iniciada_em;

    if (tarefaAtual.rows[0].coluna === 'andamento' && dados.coluna === 'afazer') {
      iniciadaEm = null;
    } else if (tarefaAtual.rows[0].coluna === 'afazer' && dados.coluna === 'andamento') {
      iniciadaEm = new Date();
    }

    const resultado = await pool.query(
      `UPDATE tarefas SET
        texto = $1,
        coluna = $2,
        usuario_id = $3,
        projeto_id = $4,
        id_prioridade = $5,
        concluida_em = $6,
        iniciada_em = $7
      WHERE id = $8
      RETURNING *`,
      [
        dados.texto,
        dados.coluna,
        dados.usuario_id,
        dados.projeto_id,
        dados.id_prioridade ?? dados.idprioridade,
        concluidaEm,
        iniciadaEm,
        id
      ]
    );

    return resultado.rows[0] || null;
  },

  remover: async (id) => {
    const result = await pool.query('DELETE FROM tarefas WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  obterEstatisticas: async (colunaFiltro) => {
    let sql = 'SELECT coluna, id_prioridade FROM tarefas';
    const params = [];

    if (colunaFiltro) {
      params.push(colunaFiltro);
      sql += ' WHERE coluna = $1';
    }

    const result = await pool.query(sql, params);
    const rows = result.rows;

    const total = rows.length;

    const porColuna = {
      afazer: rows.filter((t) => (t.coluna || "afazer") === "afazer").length,
      andamento: rows.filter((t) => t.coluna === "andamento").length,
      concluido: rows.filter((t) => t.coluna === "concluido").length,
    };

    const porPrioridade = {
      alta: rows.filter((t) => t.id_prioridade === 6).length,
      media: rows.filter((t) => t.id_prioridade === 5).length,
      baixa: rows.filter((t) => t.id_prioridade === 3).length,
    };

    const colunaMaisTarefas = Object.entries(porColuna).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || "afazer";

    return {
      total,
      porColuna,
      porPrioridade,
      colunaMaisTarefas,
    };
  },
};