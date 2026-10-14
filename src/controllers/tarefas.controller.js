const tarefaModel = require("../models/tarefa.model");
const usuarioModel = require("../models/usuario.model");

const PRIORIDADES_VALIDAS = ["alta", "media", "baixa"];

const PRIORIDADE_IDS = {
  baixa: 3,
  media: 5,
  alta: 6,
};

const COLUNAS_VALIDAS = ["afazer", "andamento", "concluido"];

const tarefasController = {
  async listar(req, res) {
    try {
      const resultado = await tarefaModel.listar(req.query);

      return res.json(resultado);
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);

      return res.status(500).json({
        erro: 'Erro ao buscar tarefas'
      });
    }
  },

  async buscarPorId(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const tarefa = await tarefaModel.buscar(id);

      if (!tarefa) {
        return res.status(404).json({
          erro: "Tarefa não encontrada"
        });
      }

      return res.json(tarefa);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        erro: "Erro ao buscar tarefa"
      });
    }
  },

  async criar(req, res) {
    try {
      const {
        texto,
        prioridade,
        coluna,
        projetoId,
        projeto_id
      } = req.body;

      const usuarioId = req.usuario.id;

      // 1. Validar texto
      if (!texto || typeof texto !== "string") {
        return res.status(400).json({
          erro: "O texto da tarefa é obrigatório",
        });
      }

      // 2. Validar prioridade
      if (
        prioridade &&
        !PRIORIDADES_VALIDAS.includes(prioridade)
      ) {
        return res.status(400).json({
          erro: "Prioridade inválida. Use alta, media ou baixa",
        });
      }

      // 3. Validar coluna
      if (
        coluna &&
        !COLUNAS_VALIDAS.includes(coluna)
      ) {
        return res.status(400).json({
          erro: "Coluna inválida",
        });
      }

      // 4. Converter prioridade para o ID do banco
      const PRIORIDADE_IDS = {
        baixa: 3,
        media: 5,
        alta: 6,
      };

      const id_prioridade =
        PRIORIDADE_IDS[prioridade || "media"];

      // 5. Verificar se o usuário existe
      const usuarioExiste = await usuarioModel.buscar(usuarioId);

      if (!usuarioExiste) {
        return res.status(400).json({
          erro: "Usuário não encontrado",
        });
      }

      // 6. Definir coluna padrão
      const colunaFinal = coluna || "afazer";

      // 7. Limitar tarefas em andamento
      if (colunaFinal === "andamento") {
        const totalAndamento =
          await tarefaModel.contarPorUsuarioEColuna(
            usuarioId,
            "andamento"
          );

        if (totalAndamento >= 2) {
          return res.status(400).json({
            erro: "Limite de 2 tarefas em andamento por usuário atingido",
          });
        }
      }

      // 8. Criar tarefa
      const tarefa = await tarefaModel.adicionar({
        texto,
        id_prioridade,
        coluna: colunaFinal,
        usuarioId,
        projetoId: projetoId ?? projeto_id,
      });

      // 9. Retornar tarefa criada
      return res.status(201).json(tarefa);

    } catch (error) {
      console.error("Erro ao criar tarefa:", error);

      return res.status(500).json({
        erro: "Erro ao criar tarefa",
      });
    }
  },

  async atualizar(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { texto, prioridade, coluna, usuarioId } = req.body;

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

      const tarefaAtual = await tarefaModel.buscar(id);
      if (!tarefaAtual) {
        return res.status(404).json({ erro: "Tarefa não encontrada" });
      }

      const idUsuarioEfetivo = usuarioId
        ? parseInt(usuarioId)
        : tarefaAtual.usuario_id;

      if (
        idUsuarioEfetivo &&
        coluna === "andamento" &&
        tarefaAtual.coluna !== "andamento"
      ) {
        const totalAndamento = await tarefaModel.contarPorUsuarioEColuna(
          idUsuarioEfetivo,
          "andamento"
        );

        if (totalAndamento >= 2) {
          return res.status(400).json({
            erro: "Limite de 2 tarefas em andamento por usuário atingido",
          });
        }
      }

      const idPrioridadeEfetivo = prioridade && PRIORIDADE_IDS[prioridade]
        ? PRIORIDADE_IDS[prioridade]
        : tarefaAtual.id_prioridade;

      const dadosAtualizacao = {
        texto: texto !== undefined ? texto : tarefaAtual.texto,
        id_prioridade: idPrioridadeEfetivo,
        coluna: coluna !== undefined ? coluna : tarefaAtual.coluna,
        usuarioId: idUsuarioEfetivo,
      };

      const atualizada = await tarefaModel.atualizar(id, dadosAtualizacao);
      return res.json(atualizada);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      return res.status(500).json({ erro: "Erro interno no servidor" });
    }
  },

  async remover(req, res) {
    try {
      const id = parseInt(req.params.id);

      // Se o ID enviado na URL não for um número válido
      if (isNaN(id)) {
        return res.status(400).json({ erro: "ID enviado na URL é inválido" });
      }

      const removida = await tarefaModel.remover(id);

      if (!removida) {
        return res.status(404).json({ erro: "Tarefa não encontrada" });
      }

      return res.json({ mensagem: "Tarefa removida com sucesso", tarefa: removida });
    } catch (error) {
      console.error("Erro ao remover tarefa:", error);
      return res.status(500).json({ erro: "Erro interno no servidor ao deletar" });
    }
  },

  estatisticas(req, res) {
    const dadosEstatistcos = tarefaModel.obterEstatisticas(req.query.coluna);
    res.json(dadosEstatistcos);
  },
};

module.exports = tarefasController;
