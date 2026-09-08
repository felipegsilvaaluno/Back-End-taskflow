const tarefaModel = require("../models/tarefa.model");
const usuarioModel = require("../models/usuario.model");

const PRIORIDADES_VALIDAS = ["alta", "media", "baixa"];
const COLUNAS_VALIDAS = ["afazer", "andamento", "concluido"];

const tarefasController = {
  listar(req, res) {
    const { coluna, prioridade } = req.query;

    let resultado = tarefaModel.listar();

    if (coluna) {
      resultado = resultado.filter((t) => (t.coluna || "afazer") === coluna);
    }
    if (prioridade) {
      resultado = resultado.filter((t) => t.prioridade === prioridade);
    }

    res.json(resultado);
  },

  buscarPorId(req, res) {
    const tarefa = tarefaModel.buscar(parseInt(req.params.id));

    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });

    res.json(tarefa);
  },

  criar(req, res) {
    const { texto, prioridade, coluna, usuarioId } = req.body;

    // 1. Validar texto
    if (!texto) return res.status(400).json({ erro: "Texto obrigatório" });

    // 2. Validar prioridade (se enviada)
    if (prioridade && !PRIORIDADES_VALIDAS.includes(prioridade)) {
      return res.status(400).json({
        erro: "Prioridade inválida. Use: alta, media ou baixa",
      });
    }

    // 3. Validar coluna (se enviada)
    if (coluna && !COLUNAS_VALIDAS.includes(coluna)) {
      return res.status(400).json({
        erro: "Coluna inválida. Use: afazer, andamento ou concluido",
      });
    }

    // 4. Validar usuário
    const usuarioExiste = usuarioModel.buscar(parseInt(usuarioId));
    if (!usuarioExiste) {
      return res.status(400).json({ erro: "Usuário não encontrado" });
    }

    req.body.usuarioId = parseInt(usuarioId);

    res.status(201).json(tarefaModel.adicionar(req.body));
  },

  atualizar(req, res) {
    const { prioridade, coluna } = req.body;

    // 1. Validar prioridade se ela for enviada no PUT
    if (prioridade && !PRIORIDADES_VALIDAS.includes(prioridade)) {
      return res.status(400).json({
        erro: "Prioridade inválida. Use: alta, media ou baixa",
      });
    }

    // 2. Validar coluna se ela for enviada no PUT
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

  // GET /tarefas/estatisticas
  estatisticas(req, res) {
    const { coluna } = req.query;

    const base = coluna
      ? tarefaModel.listarPorColuna(coluna)
      : tarefaModel.listar();

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

    res.json({
      total,
      porColuna,
      porPrioridade,
      colunaMaisTarefas,
    });
  },
};

module.exports = tarefasController;
