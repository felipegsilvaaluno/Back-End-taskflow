const pool = require('../database/db');

module.exports = {
  listar: async (filtros = {}) => {
    let sql = 'SELECT * FROM projetos WHERE 1=1';
    const params = [];

    if (filtros.descricao) {
      params.push(`%${filtros.descricao}%`);
      sql += ` AND descricao ILIKE $${params.length}`;
    }

    if (filtros.nome) {
      params.push(`%${filtros.nome}%`);
      sql += ` AND nome ILIKE $${params.length}`;
    }

    if (filtros.usuario_id) {
      params.push(filtros.usuario_id);
      sql += ` AND usuario_id = $${params.length}`;
    }

    sql += ' ORDER BY id';
    const result = await pool.query(sql, params);
    return result.rows;
  },

  buscar: async (id) => {
    const result = await pool.query(
      'SELECT * FROM projetos WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  adicionar: async ({ nome, descricao, usuario_id, usuarioId }) => {
    const idUsuario = usuario_id ?? usuarioId;
    const result = await pool.query(
      `INSERT INTO projetos (nome, descricao, usuario_id, criado_em)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [nome || 'Novo Projeto', descricao, idUsuario]
    );
    return result.rows[0];
  },

  atualizar: async (id, dados) => {
    const { nome, descricao, usuario_id, usuarioId } = dados;
    const idUsuario = usuario_id ?? usuarioId;

    const result = await pool.query(
      `UPDATE projetos
       SET nome = COALESCE($1, nome),
           descricao = COALESCE($2, descricao),
           usuario_id = COALESCE($3, usuario_id)
       WHERE id = $4
       RETURNING *`,
      [nome, descricao, idUsuario, id]
    );
    return result.rows[0] || null;
  },

  remover: async (id) => {
    const result = await pool.query(
      'DELETE FROM projetos WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },
};