const chai = require("chai");
const expect = chai.expect;
const hashPassword = require('../utils/hash'); // sem chaves

describe("Função hashPassword()", function () {
  it("deve gerar o hash SHA-256 correto", function () {
    const senha = "P@ssw0rd123";
    const hash = hashPassword(senha);
    expect(hash).to.be.a("string");
    expect(hash.length).to.equal(64);
  });

  it("deve gerar hashes diferentes para senhas diferentes", function () {
    const hash1 = hashPassword("abc");
    const hash2 = hashPassword("def");
    expect(hash1).to.not.equal(hash2);
  });
});
