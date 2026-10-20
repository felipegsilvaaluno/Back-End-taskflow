const pool = require('../database/db');

module.exports = {
  listar: async (filtros = {}) => {
    let sql = 'SELECT id, nome, email, criado_em FROM usuarios WHERE 1=1';
    const params = [];

    if (filtros.nome) {
      params.push(`%${filtros.nome}%`);
      sql += ` AND nome ILIKE $${params.length}`;
    }

    if (filtros.email) {
      params.push(filtros.email);
      sql += ` AND email = $${params.length}`;
    }

    sql += ' ORDER BY id';
    const result = await pool.query(sql, params);
    return result.rows;
  },

  buscar: async (id) => {
    const result = await pool.query(
      'SELECT id, nome, email, criado_em FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  buscarPorEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  adicionar: async ({ nome, email, senha, senha_hash }) => {
    const hashParaSalvar = senha_hash || senha || '1234';

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, criado_em)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, nome, email, criado_em`,
      [nome, email, hashParaSalvar]
    );

    return result.rows[0];
  },

  atualizar: async (id, dados) => {
    const { nome, email, senha_hash, senha } = dados;
    const hashParaSalvar = senha_hash || senha;

    const result = await pool.query(
      `UPDATE usuarios
       SET nome = COALESCE($1, nome),
           email = COALESCE($2, email),
           senha_hash = COALESCE($3, senha_hash)
       WHERE id = $4
       RETURNING id, nome, email, criado_em`,
      [nome, email, hashParaSalvar, id]
    );

    return result.rows[0] || null;
  },

  remover: async (id) => {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id, nome, email',
      [id]
    );
    return result.rows[0] || null;
  },
};