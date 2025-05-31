const request = require('supertest');
const app = require('../app');

describe('POST /login', () => {
  it('deve redirecionar para /perfis com login correto', (done) => {
    request(app)
      .post('/login')
      .send({ text: 'diego@gmail.com', password: '123' }) // Verifique se essas credenciais são válidas
      .expect(302)
      .expect('Location', '/perfis') // Valida o redirecionamento
      .end(done);
  });

  it('deve redirecionar para / com login inválido', (done) => {
    request(app)
      .post('/login')
      .send({ text: 'email@errado.com', password: 'senhaerrada' })
      .expect(302)
      .expect('Location', '/') // Volta para a página de login
      .end(done);
  });
});