const express = require("express");
const router = express.Router();
const projetosController = require("../controllers/projetos.controller");

router.get("/", projetosController.listar);

module.exports = router;