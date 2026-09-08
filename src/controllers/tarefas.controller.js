const tarefaModel = require("../models/tarefa.model");
const usuarioModel = require("../models/usuario.model");

const PRIORIDADES_VALIDAS = ["alta", "media", "baixa"];
const COLUNAS_VALIDAS = ["afazer", "andamento", "concluido"];

const tarefasController = {
  listar(req, res) {
    const resultado = tarefaModel.listar(req.query);
    res.json(resultado);
  },

  buscarPorId(req, res) {
    const tarefa = tarefaModel.buscar(parseInt(req.params.id));

    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });

    res.json(tarefa);
  },

  criar(req, res) {
    const { texto, prioridade, coluna, usuarioId } = req.body;

    if (!texto) return res.status(400).json({ erro: "Texto obrigatório" });

    if (prioridade && !PRIORIDADES_VALIDAS.includes(prioridade)) {
      return res.status(400).json({
        erro: "Prioridade inválida. Use: alta, media ou baixa",
      });
    }

    if (coluna && !COLUNAS_VALIDAS.includes(coluna)) {
      return res.status(400).json({
        erro: "Coluna inválida. Use: afazer, andamento ou concluido",
      });
    }

    const usuarioExiste = usuarioModel.buscar(parseInt(usuarioId));
    if (!usuarioExiste) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    req.body.usuarioId = parseInt(usuarioId);

    res.status(201).json(tarefaModel.adicionar(req.body));
  },

  atualizar(req, res) {
    const { prioridade, coluna } = req.body;

    if (prioridade && !PRIORIDADES_VALIDAS.includes(prioridade)) {
      return res.status(400).json({
        erro: "Prioridade inválida. Use: alta, media ou baixa",
      });
    }

    if (coluna && !COLUNAS_VALIDAS.includes(coluna)) {
      return res.status(400).json({
        erro: "Coluna inválida. Use: afazer, andamento ou concluido",
      });
    }

    const atualizada = tarefaModel.atualizar(parseInt(req.params.id), req.body);

    if (!atualizada)
      return res.status(404).json({ erro: "Tarefa não encontrada" });

    res.json(atualizada);
  },

  remover(req, res) {
    const removida = tarefaModel.remover(parseInt(req.params.id));

    if (!removida)
      return res.status(404).json({ erro: "Tarefa não encontrada" });

    res.json({ mensagem: "Tarefa removida", tarefa: removida });
  },

  estatisticas(req, res) {
    const dadosEstatistcos = tarefaModel.obterEstatisticas(req.query.coluna);
    res.json(dadosEstatistcos);
  },
};

module.exports = tarefasController;
