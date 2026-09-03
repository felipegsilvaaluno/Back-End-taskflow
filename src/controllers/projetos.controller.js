let projetos = [
    {id: 1, descricao: "Projetos para fazer logo", ativo: true}
];

let proximoIdProjetos = 2;

const projetosController = {
  listar(req, res) {
    const { descricao } = req.query;
    let resposta = projetos;

    if (descricao) {
      resposta = resposta.filter((t) => t.descricao === descricao);
    }

    res.json(resposta);
  },

  buscarPorId(req, res) {
    const id = Number(req.params.id);

    const projetoPorId = projetos.find((t) => t.id === id);
    if (!projetoPorId) {
      return res.status(404).json({ erro: "Projeto não encontrado" });
    }
    res.json(projetoPorId);
  },

  criar(req, res) {
    const { descricao, ativo } = req.body;

    const novoProjeto = {
      id: proximoIdProjetos++,
      descricao: descricao || "teste esse projeto",
      ativo: ativo || true,
    };

    projetos.push(novoProjeto);

    res.status(201).json(novoProjeto);
  },

  atualizar(req, res) {
    const id = Number(req.params.id);
    const { descricao, ativo } = req.body;

    const indice = projetos.findIndex((t) => t.id === id);

    if (indice === -1) {
      return res.status(404).json({ erro: "projeto não encontrado" });
    }
    const projetoAtualizado = { descricao, ativo };
    projetos[indice] = projetoAtualizado;

    res.json(projetoAtualizado);
  },

  remover(req, res) {
    const id = Number(req.params.id);

    const projeto = projetos.find((t) => t.id === id);

    if (!projeto) {
      return res.status(404).json({ erro: "projeto não encontrado" });
    }
    projetos = projetos.filter((t) => t.id !== id);

    res.json({ mensagem: "usuario removido com sucesso", id });
  },
};

module.exports = projetosController;


