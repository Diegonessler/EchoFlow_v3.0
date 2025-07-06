var express = require('express');  
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');

const {
  alterarSenhaUsuario,
  alterarNomeUsuario,
  atualizarAvatarUsuario,
  buscarMusicasPorNomeOuArtista, 
  buscarPlaylistsPorNomeOuCriador,
  removerMusicaDaPlaylist,
  buscarMusicasDoArtista,
  buscarArtistasMaisOuvidos,
  buscarMusicasFavoritasPorUsuario,
  getMusicasPorPlaylistId,
  getPlaylistPorId,
  buscarMusicasMaisOuvidas,
  incrementarContadorDeOuvidas,
  adicionarMusicaNaPlaylist, 
  buscarTodasPlaylists,
  buscarMusicas, 
  cadastrarUsuario, 
  buscarMusicasPorCategoria, 
  buscarCategorias, 
  buscarSessoesAtivas,
  encerrarSessao
} = require('../banco'); 

var router = express.Router();

function verificarLogin(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  } else {
    return res.redirect('/');
  }
}

router.get('/', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/perfis');
  }
  res.render('index', { titulo: 'EchoFlow - Login' });
});

router.post('/login', async (req, res, next) => {
  const { text: email, password: senha } = req.body;

  try {
    const conexao = await banco.conectarBD(); // ✅ Correto agora
    const [usuarios] = await conexao.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (usuarios.length === 0) {
      return res.status(401).render('index', {
        titulo: 'EchoFlow - Login',
        erro: 'Usuário ou senha inválidos'
      });
    }

    const usuario = usuarios[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).render('index', {
        titulo: 'EchoFlow - Login',
        erro: 'Usuário ou senha inválidos'
      });
    }

    req.session.usuario = usuario;
    res.redirect('/perfis');

  } catch (error) {
    console.error('Erro no login:', error);
    next(error);
  }
});

router.post('/register', async (req, res) => {
  const { nome, email, senha, confirma_senha } = req.body;

  if (senha !== confirma_senha) {
    return res.render('cadastro', { mensagemErro: 'Senhas não conferem' });
  }

  try {
    await cadastrarUsuario({ nome, email, senha });
    res.redirect('/');
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.render('cadastro', { mensagemErro: 'Erro ao cadastrar usuário' });
  }
});

router.get('/perfis', verificarLogin, async (req, res) => {
  try {
    const playlists = await buscarTodasPlaylists();
    const AsMaisOuvidas = await buscarMusicasMaisOuvidas();
    res.render('perfis', {
      usuario: req.session.usuario,
      playlists,
      AsMaisOuvidas
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar perfil');
  }
});

router.get('/play', verificarLogin, async (req, res) => {
  const id = req.query.id;

  try {
    const musicas = await buscarMusicas();
    const musica = musicas.find(m => m.id === parseInt(id));

    if (musica) {
      await incrementarContadorDeOuvidas(id); 
      res.render('play', { musica });
    } else {
      res.status(404).send('Música não encontrada');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar a música');
  }
});

router.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

router.get('/browser', verificarLogin, async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const musicas = await buscarMusicas();
    const categorias = await buscarCategorias(); 
    const suasPlaylists = musicas.slice(0, 5); 
    const maispopulares = musicas.slice(0, 7);
    const feitasparavoce = musicas.slice(3, 7);
    const AsMaisOuvidas = await buscarMusicasMaisOuvidas();
    const artistasMaisOuvidos = await buscarArtistasMaisOuvidos(); 

    res.render('browser', {
      usuario,
      suasPlaylists,
      maispopulares,
      feitasparavoce,
      AsMaisOuvidas,
      categorias,
      artistasMaisOuvidos
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar músicas');
  }
});

router.get('/categoria/:nome', verificarLogin, async (req, res) => {
  const nomeCategoria = req.params.nome;

  try {
    const musicas = await buscarMusicasPorCategoria(nomeCategoria);
    res.render('categoria', {
      nome: nomeCategoria,
      musicas
    });
  } catch (error) {
    console.error('Erro ao buscar músicas da categoria:', error);
    res.status(500).send('Erro ao buscar músicas da categoria');
  }
});

router.get('/minhaplaylist', verificarLogin, async (req, res) => {
  const usuarioId = req.session.usuario?.id;

  try {
    const musicas = await buscarMusicasFavoritasPorUsuario(usuarioId);
    res.render('minhaplaylist', { musicas });
  } catch (error) {
    console.error('Erro ao buscar músicas favoritas:', error);
    res.status(500).send('Erro ao carregar sua playlist');
  }
});

router.get('/playlist/:id', verificarLogin, async (req, res) => {
  try {
    const playlistId = req.params.id;
    const playlist = await getPlaylistPorId(playlistId);

    if (!playlist) {
      return res.status(404).send('Playlist não encontrada');
    }

    const musicas = await getMusicasPorPlaylistId(playlistId);
    res.render('playlist', { playlist, musicas });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar playlist');
  }
});

router.get('/artista/:nome', verificarLogin, async (req, res) => {
  const nomeArtista = decodeURIComponent(req.params.nome);

  try {
    const musicas = await buscarMusicasDoArtista(nomeArtista);
    res.render('artista', { nomeArtista, musicas });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar músicas do artista.');
  }
}); 

router.post('/adicionar-playlist', verificarLogin, async (req, res) => {
  const usuarioId = req.session.usuario?.id;
  const musicaId = req.body.musicaId;

  if (!musicaId) {
    return res.status(400).json({ sucesso: false, erro: 'ID da música não fornecido' });
  }

  try {
    await adicionarMusicaNaPlaylist(usuarioId, musicaId);
    res.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao adicionar música na playlist:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro interno ao adicionar música' });
  }
});

router.delete('/remover-playlist', verificarLogin, async (req, res) => {
  const usuarioId = req.session.usuario?.id;
  const musicaId = req.body.musicaId;

  if (!musicaId) {
    return res.status(400).json({ sucesso: false, erro: 'ID da música não fornecido' });
  }

  try {
    await removerMusicaDaPlaylist(usuarioId, musicaId); 
    res.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao remover música da playlist:', error);
    res.status(500).json({ sucesso: false, erro: 'Erro interno ao remover música' });
  }
});

router.get('/buscar', verificarLogin, async (req, res) => {
  const termo = req.query.q || '';

  try {
    const musicas = await buscarMusicasPorNomeOuArtista(termo);
    const playlists = await buscarPlaylistsPorNomeOuCriador(termo);
    res.render('resultados-busca', { termo, musicas, playlists });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao realizar a busca');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao encerrar a sessão:', err);
      return res.status(500).send('Erro ao sair.');
    }
    res.redirect('/'); 
  });
}); 

router.get('/configuracoes', verificarLogin, (req, res) => {
  const usuario = req.session.usuario; 
  res.render('configuracoes', { usuario });
});

// Upload de avatar com multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nome = `avatar-${Date.now()}${ext}`;
    cb(null, nome);
  }
});
const upload = multer({ storage });

router.post('/configuracoes/upload-avatar', verificarLogin, upload.single('avatar'), async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const novoAvatar = `/uploads/${req.file.filename}`;
    await atualizarAvatarUsuario(usuarioId, novoAvatar);
    req.session.usuario.avatar = novoAvatar;
    res.redirect('/configuracoes');
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).send('Erro ao atualizar foto de perfil');
  }
});

router.post('/configuracoes/alterar-nome', verificarLogin, async (req, res) => {
  const usuarioId = req.session.usuario?.id;
  const novoNome = req.body.novoNome;

  if (!novoNome || novoNome.trim().length < 2) {
    return res.status(400).json({ sucesso: false, mensagem: 'Nome inválido.' });
  }

  try {
    await alterarNomeUsuario(usuarioId, novoNome);
    req.session.usuario.nome = novoNome;
    res.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao alterar nome:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao alterar nome.' });
  }
});

router.post('/configuracoes/alterar-senha', verificarLogin, async (req, res) => {
  const usuarioId = req.session.usuario.id;
  const { senhaAtual, novaSenha } = req.body;

  try {
    const sucesso = await alterarSenhaUsuario(usuarioId, senhaAtual, novaSenha);
    if (sucesso) {
      res.json({ sucesso: true });
    } else {
      res.json({ sucesso: false, mensagem: "Senha atual incorreta." });
    }
  } catch (erro) {
    console.error("Erro ao alterar senha:", erro);
    res.status(500).json({ sucesso: false, mensagem: "Erro no servidor." });
  }
});

router.get('/configuracoes/sessoes', verificarLogin, async (req, res) => {
  const usuarioId = req.session.usuario.id;
  try {
    const sessoes = await buscarSessoesAtivas(usuarioId);
    res.render('gerenciar-sessoes', { sessoes });
  } catch (erro) {
    console.error('Erro ao buscar sessões:', erro);
    res.status(500).send('Erro ao carregar sessões');
  }
});

router.post('/configuracoes/encerrar-sessao', verificarLogin, async (req, res) => {
  const { token } = req.body;
  try {
    await encerrarSessao(token);
    res.redirect('/configuracoes/sessoes');
  } catch (erro) {
    console.error('Erro ao encerrar sessão:', erro);
    res.status(500).send('Erro ao encerrar sessão');
  }
});

module.exports = router;
 