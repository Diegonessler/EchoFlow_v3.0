const request = require('supertest');
const app = require('../app'); // importa o app do Express

describe('GET /', function () {
  it('deve responder com status 200 e conter "EchoFlow"', function (done) {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .end(function (err, res) {
        if (err) return done(err);
        if (!res.text.includes("EchoFlow")) {
          return done(new Error("Resposta não contém 'EchoFlow'"));
        }
        done();
      });
  });

  it('deve responder com status 200 e conter "EchoFlow - Login"', function (done) {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .end(function (err, res) {
        if (err) return done(err);
        if (!res.text.includes("EchoFlow - Login")) {
          return done(new Error("Resposta não contém 'EchoFlow - Login'"));
        }
        done();
      });
  });
});

describe('GET /perfis', function () {
  it('deve responder com status 200 e conter playlists', function (done) {
    request(app)
  .get('/perfis')
  .expect(200)
  .expect('Content-Type', /html/)
  .end(function (err, res) {
    if (err) return done(err);
    if (!res.text.includes("Playlists") && !res.text.includes("Feitas Para Você")) {
      return done(new Error("Página de perfis não contém conteúdo esperado"));
    }
    done();
  });

  });
});