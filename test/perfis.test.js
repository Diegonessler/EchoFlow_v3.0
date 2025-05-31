const request = require('supertest');
const app = require('../app'); // Ajuste o caminho conforme seu projeto

describe('GET /perfis', function () {
  const agent = request.agent(app); // Para manter sessão entre requisições

  before(function (done) {
    agent
      .post('/login')
      .send({ text: 'diego@gmail.com', password: '123' }) // Credenciais de teste
      .expect(302)
      .expect('Location', '/perfis')
      .end(done);
  });

  it('deve responder com status 200 e conter elementos esperados no HTML', function (done) {
    agent
      .get('/perfis')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((res) => {
  if (!res.text.includes('<h1>EchoFlow</h1>')) {
    throw new Error('Título "EchoFlow" não encontrado na página');
  }
  if (!res.text.includes('<h2>Lista de Perfis</h2>')) {
    throw new Error('Cabeçalho "Lista de Perfis" não encontrado na página');
  }
  if (!res.text.includes('<h3>Feito pra Você</h3>')) {
    throw new Error('Seção "Feito pra Você" não encontrada na página');
  }
  if (!res.text.includes('<h3>As Mais Ouvidas 🎧</h3>')) {
    throw new Error('Seção "As Mais Ouvidas" não encontrada na página');
  }
  if (!res.text.match(/<p>.*<\/p>/)) {
    throw new Error('Nenhuma música encontrada na página');
  }
  if (!res.text.includes('© 2024 WebSoft Ltda. Todos os direitos reservados.')) {
    throw new Error('Footer não encontrado na página');
  }
})

      .end(done);
  });
});
