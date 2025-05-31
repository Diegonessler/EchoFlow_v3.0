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
  const sql = "INSERT INTO usuarios (email, senha, nome) VALUES (?, ?, ?)";
  const [resultado] = await conexao.query(sql, [usuario.email, usuario.senha, usuario.nome]);
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


module.exports = {
  buscarUsuario,
  buscarMusicas,
  cadastrarUsuario,
  buscarMusicasPorCategoria,
  buscarCategorias
  
};
