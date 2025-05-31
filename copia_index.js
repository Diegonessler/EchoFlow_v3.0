var express = require('express');
var router = express.Router();

//
// rotas GET
//

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { titulo: 'MFlix - Login' });
});

/* POST para login */
router.post('/login', async function(req, res, next){
  const email = req.body.email;
  const senha = req.body.senha;

  const usuario = await global.banco.buscarUsuario({email,senha});

  if (usuario.usucodigo)
  {
    // cria um registro de seção de uso utilizando o objeto GLOBAL
    global.usucodigo = usuario.usucodigo;
    global.usuemail = usuario.usuemail;
    
    // redireciona o usuario diretamente para a rota GET /browse
    res.redirect('/browse');
  }
  else
  {
    res.redirect('/');
  }
});
router.get('/browse',function (req,res,next){
  res.render('browse');



});



module.exports = router;