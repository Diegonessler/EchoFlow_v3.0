var express = require('express');
const { buscarUsuario, buscarMusicas, cadastrarUsuario, buscarMusicasPorCategoria, buscarCategorias } = require('../banco');  
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { titulo: 'EchoFlow - Login' });
});

/* POST para login */
router.post('/login', async function(req, res, next) {
  const email = req.body.text;
  const senha = req.body.password;

  try {
    const usuario = await global.banco.buscarUsuario({ email, senha });
    console.log('Usuário encontrado:', usuario); // Adicionado para depuração

    if (usuario && usuario.id) {
      global.id = usuario.id;
      global.email = usuario.email;
      res.redirect('/perfis');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    next(error);
  }
});

router.post('/register', async (req, res) => {
  const { nome, email, senha, confirma_senha } = req.body;

  if (senha !== confirma_senha) {
    return res.status(400).send("Senhas não conferem");
  }

  try {
    const novoId = await cadastrarUsuario({ nome, email, senha });
    console.log("Usuário cadastrado com ID:", novoId);
    res.redirect('/'); // ou redirecione para onde quiser
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).send("Erro ao cadastrar usuário.");
  }
});

/* GET perfis page */
router.get('/perfis', async (req, res) => {
  try {
    const musicas = await buscarMusicas();

    if (!musicas || !Array.isArray(musicas)) {
      throw new Error('Músicas não retornaram como array');
    }

    const suasPlaylists = musicas.slice(0, 3);
    const feitasparavoce = musicas.slice(3, 7);
    const AsMaisOuvidas = musicas.slice(0, 6);

    res.render('perfis', {
      suasPlaylists,
      feitasparavoce,
      AsMaisOuvidas
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar músicas');
  }
});

/* GET play page */
router.get('/play', async (req, res) => {
  const id = req.query.id; // Obtém o ID da música a partir dos parâmetros de consulta

  try {
    const musicas = await buscarMusicas();
    const musica = musicas.find(m => m.id === parseInt(id));

    if (musica) {
      res.render('play', { musica });
    } else {
      res.status(404).send('Música não encontrada');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar a música');
  }
});

/* GET cadastro page */
router.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

/* POST para cadastro */
router.post('/register', async (req, res) => {
  const { nome, email, senha, confirma_senha } = req.body;

  if (senha !== confirma_senha) {
    return res.status(400).send('As senhas não coincidem');
  }

  try {
    await inserirUsuario({ nome, email, senha });
    res.redirect('/');
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).send('Erro ao cadastrar usuário');
  }
});

/* GET browser page */
router.get('/browser', async (req, res) => {
  try {
    const musicas = await buscarMusicas();
    const categorias = await buscarCategorias(); // Adicione esta linha para buscar categorias

    if (!musicas || !Array.isArray(musicas)) {
      throw new Error('Músicas não retornaram como array');
    }

    // Defina suasPlaylists como um subconjunto das músicas
    const suasPlaylists = musicas.slice(0, 5); // Ajuste o número conforme necessário
    const maispopulares = musicas.slice(0, 7);
    const feitasparavoce = musicas.slice(3, 7);
    const AsMaisOuvidas = musicas.slice(0, 2);

    // Passe as playlists e categorias para o render
    res.render('browser', {
      suasPlaylists,
      maispopulares,
      feitasparavoce,
      AsMaisOuvidas,
      categorias // Adicione aqui
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar músicas');
  }
});


router.get('/categoria/:nome', async (req, res) => {
  const nomeCategoria = req.params.nome;
  console.log(`Acessando a categoria: ${nomeCategoria}`);

  try {
    const musicas = await buscarMusicasPorCategoria(nomeCategoria);
    console.log('Músicas encontradas:', musicas);

    res.render('categoria', {
      nome: nomeCategoria,
      musicas: musicas
    });
  } catch (error) {
    console.error('Erro ao buscar músicas da categoria:', error);
    res.status(500).send('Erro ao buscar músicas da categoria');
  }
});


module.exports = router;