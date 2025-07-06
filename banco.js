const mysql = require('mysql2/promise');


async function conectarBD() {
  if (global.conexao && global.conexao.state !== 'disconnected') {
    return global.conexao;
  }

  const conexao = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'echoflow'
  });

  global.conexao = conexao;
  return global.conexao;
}

async function buscarUsuario(usuario) {
  const conexao = await conectarBD();
  const sql = "SELECT * FROM usuarios WHERE email=? AND senha=?";
  const [usuarioEncontrado] = await conexao.query(sql, [usuario.email, usuario.senha]);

  if (usuarioEncontrado && usuarioEncontrado.length > 0) {
    return usuarioEncontrado[0];
  } else {
    return {};
  }
}

async function buscarMusicas() {
  const conexao = await conectarBD();
  const sql = "SELECT id, titulo, artista, url_audio AS audioUrl, imagem FROM musica;";
  const [musicas] = await conexao.query(sql);
  return musicas;
}

async function cadastrarUsuario(usuario) {
  const conexao = await conectarBD();
  const senhaCriptografada = await bcrypt.hash(usuario.senha, 10);
  const sql = "INSERT INTO usuarios (email, senha, nome) VALUES (?, ?, ?)";
  const [resultado] = await conexao.query(sql, [usuario.email, senhaCriptografada, usuario.nome]);
  return resultado.insertId;
}

const express = require('express');
const app = express();

// Rota para a página de categorias
app.get('/categoria/:nome', (req, res) => {
  const nomeCategoria = req.params.nome;

  // Aqui você pode buscar as músicas da categoria do banco de dados ou de uma API
  const musicas = buscarMusicasPorCategoria(nomeCategoria); // Função hipotética

  res.render('categoria', {
    nome: nomeCategoria,
    musicas: musicas
  });
});

// Função fictícia para buscar músicas por categoria
async function buscarMusicasPorCategoria(categoria) {
  const conexao = await conectarBD();
  const sql = "SELECT id, titulo, artista, url_audio AS audioUrl, imagem FROM musica WHERE genero = ?"; // Ajuste a coluna conforme necessário

  try {
    const [musicas] = await conexao.query(sql, [categoria]);
    return musicas;
  } catch (error) {
    console.error('Erro ao buscar músicas:', error);
    throw error; // Lança o erro para que ele possa ser tratado na rota
  }
}

async function buscarMusicasPorCategoria(categoria) {
  const conexao = await conectarBD();
  const sql = "SELECT id, titulo, artista, url_audio AS audioUrl, imagem FROM musica WHERE genero = ?";
  
  try {
    const [musicas] = await conexao.query(sql, [categoria]);
    return musicas;
  } catch (error) {
    console.error('Erro ao buscar músicas:', error);
    throw error; // Lança o erro para que ele possa ser tratado na rota
  }
}

async function buscarCategorias() {
  const conexao = await conectarBD();
  const sql = "SELECT DISTINCT genero FROM musica"; // Buscando gêneros únicos
  const [categorias] = await conexao.query(sql);
  return categorias.map(c => c.genero); // Retorna um array com os gêneros
}

// Para músicas favoritas:
async function buscarMusicasFavoritasPorUsuario(usuarioId) {
  const conexao = await conectarBD();
  const sql = `
    SELECT m.id, m.titulo, m.artista, m.url_audio AS audioUrl, m.imagem
    FROM musicas_favoritas mf
    JOIN musica m ON mf.musica_id = m.id
    WHERE mf.usuario_id = ?
    ORDER BY mf.criado_em DESC
  `;
  const [musicas] = await conexao.query(sql, [usuarioId]);
  return musicas;
}

async function adicionarMusicaNaPlaylist(usuarioId, musicaId) {
  const conexao = await conectarBD();

  // Verifica se já está na playlist
  const [existe] = await conexao.query(
    'SELECT * FROM musicas_favoritas WHERE usuario_id = ? AND musica_id = ?',
    [usuarioId, musicaId]
  );

  if (existe.length === 0) {
    await conexao.query(
      'INSERT INTO musicas_favoritas (usuario_id, musica_id) VALUES (?, ?)',
      [usuarioId, musicaId]
    );
  }
}

async function incrementarContadorDeOuvidas(id) {
  const conexao = await conectarBD();
  const sql = `
    UPDATE musica
    SET ouvintes = COALESCE(ouvintes, 0) + 1
    WHERE id = ?
  `;
  await conexao.query(sql, [id]);
}

async function buscarMusicasMaisOuvidas() {
  const conexao = await conectarBD();
  const sql = `SELECT * FROM musica ORDER BY ouvintes DESC LIMIT 10`; // note que na sua tabela o nome é 'musica' (sem "s")
  const [musicas] = await conexao.query(sql);
  return musicas;
}


async function getPlaylistPorId(id) {
  const conexao = await conectarBD();
  const [playlists] = await conexao.query('SELECT * FROM playlist WHERE id = ?', [id]);
  return playlists[0] || null;
}

async function buscarPlaylistPorUsuario(usuarioId) {
  const conexao = await conectarBD();
  const [playlists] = await conexao.query(`
    SELECT * FROM playlist WHERE usuario_id = ?
  `, [usuarioId]);
  return playlists;
}

async function getMusicasPorPlaylistId(playlistId) {
  const conexao = await conectarBD();
  const [musicas] = await conexao.query(`
    SELECT m.*
    FROM musica m
    JOIN playlist_musicas pm ON pm.musica_id = m.id
    WHERE pm.playlist_id = ?
  `, [playlistId]);
  return musicas;
}

async function buscarArtistasMaisOuvidos() {
  const conexao = await conectarBD();
  const sql = `
    SELECT artista, imagem_artista, SUM(ouvintes) AS total_ouvintes
    FROM musica
    GROUP BY artista, imagem_artista
    ORDER BY total_ouvintes DESC
    LIMIT 5
  `;
  const [artistas] = await conexao.query(sql);
  return artistas;
}

async function buscarMusicasDoArtista(nomeArtista) {
  const conexao = await conectarBD();
  const [musicas] = await conexao.query(
    'SELECT * FROM musica WHERE artista = ?',
    [nomeArtista]
  );
  return musicas;
}


async function removerMusicaDaPlaylist(usuarioId, musicaId) {
  const conexao = await conectarBD();
  const sql = 'DELETE FROM musicas_favoritas WHERE usuario_id = ? AND musica_id = ?';
  await conexao.query(sql, [usuarioId, musicaId]);
}
async function buscarTodasPlaylists() {
  const conexao = await conectarBD();
  const [playlists] = await conexao.query(`SELECT * FROM playlist`);
  return playlists;
}

async function buscarPlaylistsPorNomeOuCriador(termo) {
  const conexao = await conectarBD();
  const [playlists] = await conexao.query(`
    SELECT p.*, u.nome AS criador
    FROM playlist p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.nome LIKE ? OR u.nome LIKE ?`, [`%${termo}%`, `%${termo}%`]);
  return playlists;
}

async function buscarMusicasPorNomeOuArtista(termo) {
  const conexao = await conectarBD();
  const [musicas] = await conexao.query(`
    SELECT *
    FROM musica
    WHERE titulo LIKE ? OR artista LIKE ?
  `, [`%${termo}%`, `%${termo}%`]);

  return musicas; 

}
async function atualizarAvatarUsuario(id, avatarPath) {
  const conexao = global.conexao; // 👈 pega a conexão já existente
  await conexao.query('UPDATE usuarios SET avatar = ? WHERE id = ?', [avatarPath, id]);
}

async function alterarNomeUsuario(usuarioId, novoNome) {
  const conexao = global.conexao;

  if (!conexao) {
    throw new Error("Conexão com o banco não está definida.");
  }

  await conexao.query('UPDATE usuarios SET nome = ? WHERE id = ?', [novoNome, usuarioId]);
}

const bcrypt = require('bcryptjs');

async function alterarSenhaUsuario(idUsuario, novaSenha) {
  const conexao = await obterConexao();
  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

  await conexao.execute(
    'UPDATE usuarios SET senha = ? WHERE id = ?',
    [senhaCriptografada, idUsuario]
  );
}


module.exports = {
  conectarBD,
  alterarSenhaUsuario,
  alterarNomeUsuario,
  atualizarAvatarUsuario,
  buscarUsuario,
  buscarMusicas,
  cadastrarUsuario,
  buscarMusicasPorCategoria,
  buscarCategorias,
  buscarPlaylistPorUsuario,
  adicionarMusicaNaPlaylist,
  incrementarContadorDeOuvidas,
  buscarMusicasMaisOuvidas,
  getPlaylistPorId,
  getMusicasPorPlaylistId,
  buscarMusicasFavoritasPorUsuario,
  buscarArtistasMaisOuvidos,
  buscarMusicasDoArtista,
  buscarPlaylistsPorNomeOuCriador,
  buscarMusicasPorNomeOuArtista,
  buscarTodasPlaylists,
  removerMusicaDaPlaylist
};