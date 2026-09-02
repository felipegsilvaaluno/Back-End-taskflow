let projetos = [
    {id: 1, nome: "projeto 1", descricao: "Projetos para fazer logo", status: true}
];

let proximoIdProjetos = 2;

const projetosController = {

    listar(req, res){
        const {nome, descricao} = req.query;
        let resposta = projetos;

        if(nome){
            resposta = resposta.filter((t) => t.nome === nome);
        }
        if (descricao) {
          resposta = resposta.filter((t) => t.descricao === descricao);
        }

        res.json(resposta)
    },
}

module.exports = projetosController;


