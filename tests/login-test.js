import { Selector } from 'testcafe';

// ----------- TESTES GERAIS DE LOGIN E NAVEGAÇÃO -----------

fixture('EchoFlow - Testes Gerais')
    .page('http://localhost:3000');

test('Login e navegação entre páginas principais', async t => {
    const inputUsuario = Selector('input[placeholder="Usuário"]');
    const inputSenha = Selector('input[placeholder="Senha"]');
    const botaoEntrar = Selector('button').withText(/Entrar/i);

    await t
        .typeText(inputUsuario, 'diego@gmail.com')
        .typeText(inputSenha, '123')
        .expect(botaoEntrar.exists).ok()
        .expect(botaoEntrar.visible).ok()
        .click(botaoEntrar);

    // Confirma que entrou na tela inicial após o login
    await t.expect(Selector('h1, h3, body').innerText).contains('EchoFlow');

    // Botão "Descubra" para ir ao /browser
    const botaoDescubra = Selector('a[href="/browser"] button, a[href="/browser"]');
    await t.expect(botaoDescubra.exists).ok();
    await t.click(botaoDescubra);

    // Verifica se carregou a página de navegação
    await t.expect(Selector('body').innerText).contains('Populares');

    const musicaBrowser = Selector('a.tile');
    await t.expect(musicaBrowser.exists).ok('Nenhuma música encontrada em /browser');

    // Vai direto para /minhaplaylist
    await t.navigateTo('http://localhost:3000/minhaplaylist');
    await t.expect(Selector('h1, h2, body').innerText).contains('Minha Playlist');

    const musicaItem = Selector('.musica-card');
    await t.expect(musicaItem.exists).ok('Nenhuma música na playlist');

    const primeiraMusica = musicaItem.nth(0);
    await t.click(primeiraMusica);
});

// ----------- TESTES DE LOGIN NEGATIVO -----------

fixture('EchoFlow - Testes de Login Negativo')
    .page('http://localhost:3000'); // rota inicial onde o login é feito

test('Login negativo com usuário/senha inválidos', async t => {
    const inputUsuario = Selector('input[placeholder="Usuário"]');
    const inputSenha = Selector('input[placeholder="Senha"]');
    const botaoEntrar = Selector('button').withText(/Entrar/i);
    // Melhor restringir o seletor para onde a mensagem aparece, evite pegar todo o body
    const mensagemErro = Selector('.mensagem-erro, .erro-login');

    await t
        .typeText(inputUsuario, 'usuario_invalido')
        .typeText(inputSenha, 'senha_errada')
        .click(botaoEntrar)
        .expect(mensagemErro.innerText).match(/usuário ou senha inválidos/i);
});

// ----------- TESTES DE CADASTRO -----------

fixture('EchoFlow - Testes de Cadastro')
    .page('http://localhost:3000/cadastro');

test('Cadastro com dados válidos', async t => {
    await t
        .typeText('input[name="nome"]', 'Novo Usuário')
        .typeText('input[name="email"]', 'novo@usuario.com')
        .typeText('input[name="senha"]', 'senha123')
        .typeText('input[name="confirma_senha"]', 'senha123')
        .click('button[type="submit"]')
        .expect(Selector('body').innerText).contains('EchoFlow'); // redirecionamento para a tela de login
});

test('Cadastro com senhas diferentes', async t => {
    const erro = Selector('.erro-cadastro, .mensagem-erro');

    await t
        .typeText('input[name="nome"]', 'Novo Usuário')
        .typeText('input[name="email"]', 'teste2@usuario.com')
        .typeText('input[name="senha"]', 'senha123')
        .typeText('input[name="confirma_senha"]', 'senha456')
        .click('button[type="submit"]')
        .expect(erro.innerText).contains('Senhas não conferem');
});
