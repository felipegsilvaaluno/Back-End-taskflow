const express = require("express");
const router = express.Router();

let usuarios = [
  { id: 1, nome: "admin", email: "admin@taskflow.com", senha: "1234" },
];
let proximoIdUsuario = 2;

router.get("/usuarios", (req, res) => {
  const { nome, email } = req.query;
  let resultado = usuarios;

  if (nome) {
    resultado = resultado.filter((t) => t.nome === nome);
  }
  if (email) {
    resultado = resultado.filter((t) => t.email === email);
  }
  res.json(resultado);
});

//---------------------------------------------------------------

router.get("/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);

  const usuario = usuarios.find((t) => t.id === id);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuario não encontrado" });
  }
  res.json(usuario);
});

//-----------------------------------------------------------------

router.post("/usuarios", (req, res) => {
  const { nome, email, senha } = req.body;

  const emailExiste = usuarios.some((usuario) => usuario.email === email);

  if (emailExiste) {
    return res.status(400).json({
      erro: "Este email já está cadastrado",
    });
  }

  const novoUsuario = {
    id: proximoIdUsuario++,
    nome: nome || "felipe",
    email: email || "admin@taskflow.com",
    senha: senha || "1223",
  };

  usuarios.push(novoUsuario);

  res.status(201).json(novoUsuario);
});

//-------------------------------------------------------------

router.put("/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);
  const { nome, email, senha } = req.body;
  const indice = usuarios.findIndex((t) => t.id === id);
 
  if (indice === -1) {
    return res.status(404).json({ erro: "Usuario não encontrado" });
  }
  const usuarioAtualizado = { nome, email, senha };
  usuarios[indice] = usuarioAtualizado;
 
  res.json(usuarioAtualizado);
});

//----------------------------------------------------------------

router.delete("/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);

  const usuario = usuarios.find((t) => t.id === id);

  if (!usuario) {
    return res.status(404).json({ erro: "usario não encontrado" });
  }
  usuarios = usuarios.filter((t) => t.id !== id);

  res.json({ mensagem: "usuario removido com sucesso", id });
});


module.exports = router;