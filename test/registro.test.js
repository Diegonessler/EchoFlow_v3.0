const request = require('supertest');
const app = require('../app'); // Altere o caminho se necessário
const { expect } = require('chai');

describe('CT-001 - Criar Conta de Usuário (RF-001)', () => {
  it('deve registrar um novo usuário com dados válidos', async () => {
    const emailUnico = `teste${Date.now()}@gmail.com`;

    const res = await request(app)
      .post('/register')
      .type('form') // simula envio via formulário
      .send({
        nome: 'Teste Usuário',
        email: emailUnico,
        senha: '123456',
        confirma_senha: '123456'
      });

    expect(res.status).to.be.oneOf([200, 302]);
  });

  it('deve retornar erro se as senhas não coincidirem', async () => {
    const res = await request(app)
      .post('/register')
      .type('form')
      .send({
        nome: 'Teste Erro',
        email: `erro${Date.now()}@gmail.com`,
        senha: '123456',
        confirma_senha: '654321'
      });

    expect(res.status).to.equal(400);
    expect(res.text).to.include('As senhas não coincidem');
  });
});
