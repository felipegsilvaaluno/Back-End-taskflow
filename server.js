const express = require("express");
const app = express();
const PORTA = 3000;

let tarefas = [
  { id: 1, texto: "Estudar Node", prioridade: "alta" },
  { id: 2, texto: "Criar API", prioridade: "alta", coluna: "andamento" },
  { id: 3, texto: "Testar Postman", prioridade: "media", coluna: "concluido" },
];
let proximoId = 4; 

// USUARIOS
let usuarios = [
  { id: 1, nome: "admin", email: "admin@taskflow.com", senha: "1234" },
];
let proximoIdUsuario = 2;

app.use(express.json());

//Lista usuarios -----------------------------------------
app.get("/usuarios", (req, res) => {
  // req.query contém os filtros da URL
  const { nome, email } = req.query;
  // Começar com todos os usuarios
  let resultado = usuarios;
  // Filtrar por coluna se informado
  if (nome) {
    resultado = resultado.filter((t) => t.nome === nome);
  }
  // Filtrar por prioridade se informado
  if (email) {
    resultado = resultado.filter((t) => t.email === email);
  }
  res.json(resultado);
});

app.get("/usuarios/:id", (req, res) => {
  // req.params.id chega como STRING — converter para número
  const id = Number(req.params.id);
  // Buscar a usuario no array
  const usuario = usuarios.find((t) => t.id === id);
  // Se não encontrou — retornar 404
  if (!usuario) {
    return res.status(404).json({ erro: "Usuario não encontrado" });
  }
  // Se encontrou — retornar o usuario
  res.json(usuario);
});

app.post("/usuarios", (req, res) => {
  // req.body contém os dados enviados no body da requisição
  const { nome, email, senha } = req.body;
  // Verificar se o email já está cadastrado
  const emailExiste = usuarios.some((usuario) => usuario.email === email);

  if (emailExiste) {
    return res.status(400).json({
      erro: "Este email já está cadastrado",
    });
  }

  // Criar a nova tarefa com ID gerado pelo servidor
  const novoUsuario = {
    id: proximoIdUsuario++, // usa o ID atual e incrementa
    nome: nome || "felipe", // valor padrão se não enviado
    email: email || "admin@taskflow.com",
    senha: senha || "1223",
  };

  // Adicionar ao array em memória
  usuarios.push(novoUsuario);

  // Retornar a tarefa criada com status 201 Created
  res.status(201).json(novoUsuario);
});

app.put("/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);
  const { nome, email, senha } = req.body;
  // Encontrar o índice da tarefa no array
  const indice = usuarios.findIndex((t) => t.id === id);
  // Se não encontrou — retornar 404
  if (indice === -1) {
    return res.status(404).json({ erro: "Usuario não encontrado" });
  }
  // Substituir a tarefa no array mantendo o mesmo ID
  const usuarioAtualizado = { nome, email, senha };
  usuarios[indice] = usuarioAtualizado;
  // Retornar a tarefa atualizada com status 200
  res.json(usuarioAtualizado);
});

app.delete("/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);

  // Verificar se a tarefa existe antes de remover
  const usuario = usuarios.find((t) => t.id === id);

  if (!usuario) {
    return res.status(404).json({ erro: "usario não encontrado" });
  }
  // Remover do array com filter
  usuarios = usuarios.filter((t) => t.id !== id);
  // Retornar confirmação da remoção
  res.json({ mensagem: "usuario removido com sucesso", id });
});

//Lista tarefas e faz todo CRUD ---------------------------------------------------------

app.post("/tarefas", (req, res) => {
  // req.body contém os dados enviados no body da requisição
  const { texto, prioridade, coluna, cidade } = req.body;
  // Criar a nova tarefa com ID gerado pelo servidor
  const novaTarefa = {
    id: proximoId++, // usa o ID atual e incrementa
    texto: texto,
    prioridade: prioridade || "media", // valor padrão se não enviado
    coluna: coluna || "afazer",
    cidade: cidade || "",
  };

  // Adicionar ao array em memória
  tarefas.push(novaTarefa);

  // Retornar a tarefa criada com status 201 Created
  res.status(201).json(novaTarefa);
});

// PUT substitui TODOS os campos da tarefa pelo que foi enviado
// Diferente do PATCH que atualiza apenas campos específicos

app.put("/tarefas/:id", (req, res) => {
  const id = Number(req.params.id);
  const { texto, prioridade, coluna, cidade } = req.body;
  // Encontrar o índice da tarefa no array
  const indice = tarefas.findIndex((t) => t.id === id);
  // Se não encontrou — retornar 404
  if (indice === -1) {
    return res.status(404).json({ erro: "Tarefa não encontrada" });
  }
  // Substituir a tarefa no array mantendo o mesmo ID
  const tarefaAtualizada = { id, texto, prioridade, coluna, cidade };
  tarefas[indice] = tarefaAtualizada;
  // Retornar a tarefa atualizada com status 200
  res.json(tarefaAtualizada);
});

app.delete("/tarefas/:id", (req, res) => {
  const id = Number(req.params.id);

  // Verificar se a tarefa existe antes de remover

  const tarefa = tarefas.find((t) => t.id === id);

  if (!tarefa) {
    return res.status(404).json({ erro: "Tarefa não encontrada" });
  }

  // Remover do array com filter

  tarefas = tarefas.filter((t) => t.id !== id);

  // Retornar confirmação da remoção

  res.json({ mensagem: "Tarefa removida com sucesso", id });
});

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/tarefas", (req, res) => {
  // req.query contém os filtros da URL
  const { coluna, prioridade } = req.query;
  // Começar com todas as tarefas
  let resultado = tarefas;
  // Filtrar por coluna se informado
  if (coluna) {
    resultado = resultado.filter((t) => t.coluna === coluna);
  }
  // Filtrar por prioridade se informado
  if (prioridade) {
    resultado = resultado.filter((t) => t.prioridade === prioridade);
  }
  res.json(resultado);
});

app.get("/tarefas/:id", (req, res) => {
  // req.params.id chega como STRING — converter para número
  const id = Number(req.params.id);
  // Buscar a tarefa no array
  const tarefa = tarefas.find((t) => t.id === id);
  // Se não encontrou — retornar 404
  if (!tarefa) {
    return res.status(404).json({ erro: "Tarefa não encontrada" });
  }
  // Se encontrou — retornar a tarefa
  res.json(tarefa);
});


//-------------------------------- DESAFIO STATISTICAS  --------------------------------

app.get("/estatisticas", (req, res) => {
  const coluna = req.query.coluna;

  const tarefasFiltradas = coluna
    ? tarefas.filter((tarefa) => (tarefa.coluna || "afazer") === coluna)
    : tarefas;

  const total = tarefasFiltradas.length;

  const porColuna = {
    afazer: tarefasFiltradas.filter(
      (tarefa) => (tarefa.coluna || "afazer") === "afazer",
    ).length,

    andamento: tarefasFiltradas.filter(
      (tarefa) => tarefa.coluna === "andamento",
    ).length,

    concluido: tarefasFiltradas.filter(
      (tarefa) => tarefa.coluna === "concluido",
    ).length,
  };

  const porPrioridade = {
    alta: tarefasFiltradas.filter((tarefa) => tarefa.prioridade === "alta")
      .length,

    media: tarefasFiltradas.filter((tarefa) => tarefa.prioridade === "media")
      .length,

    baixa: tarefasFiltradas.filter((tarefa) => tarefa.prioridade === "baixa")
      .length,
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
});

// Rota 404 
app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    metodo: req.method,
    caminho: req.url,
  });
});

app.listen(PORTA, () => console.log(`Porta ${PORTA}`));
//--------------------------------------------------------------------------------

// app.get("/tarefas/:id", (req, res) => {
//   // req.params.id chega como STRING — converter para número
//   const id = Number(req.params.id);

//   // Buscar a tarefa no array
//   const tarefa = tarefas.find((t) => t.id === id);

//   // Se não encontrou — retornar 404
//   if (!tarefa) {
//     return res.status(404).json({ erro: "Tarefa não encontrada" });
//   }

//   // Se encontrou — retornar a tarefa
//   res.json(tarefa);
// });

// app.listen(PORTA, () => console.log(`Porta ${PORTA}`));

// ---------------------------------------------------------------------------------------------------

// app.get("/", (req, res) => {
//   res.json({ mensagem: "TaskFlow API funcionando!" });
// });

// app.get("/tarefas", (req, res) => {
//     if (req.headers["tokenapi"] === "5ea87093-dba6-49ae-8ffe-80c790a417b5"){
//         res.json(tarefas);
//     } else {
//         res.status(400).json({erro: "acesso negado"})
//     }
//       res.json({ tarefas });
// });

// app.get("/ok", (req, res) => {
//   res.json({ status: "ok", dados: [1, 2, 3] });
// });

// app.get("/criado", (req, res) => {
//   res.status(201).json({ mensagem: "Criado com sucesso" });
// });

// app.get("/erro", (req, res) => {
//   res.status(400).json({ erro: "Dados inválidos" });
// });

// app.get("/texto", (req, res) => {
//   res.send("Resposta em texto simples");
// });

// // Iniciar o servidor
// app.listen(PORTA, () => {
//   console.log(`Servidor rodando em http://localhost:${PORTA}`);
// });