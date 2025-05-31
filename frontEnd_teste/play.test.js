/**
 * @jest-environment jest-environment-jsdom
 */
const { fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');

describe('Página de player', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <audio id="audioPlayer">
        <source src="musica.mp3" type="audio/mpeg">
      </audio>
      <div class="controls">
        <button onclick="document.getElementById('audioPlayer').play()">▶</button>
        <button onclick="document.getElementById('audioPlayer').pause()">⏸</button>
      </div>
    `;
  });

  test('Deve ter um player de áudio na tela', () => {
    const audio = document.getElementById('audioPlayer');
    expect(audio).toBeInTheDocument();
  });

  test('Botão de play deve disparar play no áudio', () => {
    const audio = document.getElementById('audioPlayer');
    const playSpy = jest.spyOn(audio, 'play').mockImplementation(() => {});
    const playButton = document.querySelector('button');

    fireEvent.click(playButton);
    expect(playSpy).toHaveBeenCalled();
  });

  test('Botão de pause deve disparar pause no áudio', () => {
    const audio = document.getElementById('audioPlayer');
    const pauseSpy = jest.spyOn(audio, 'pause').mockImplementation(() => {});
    const pauseButton = document.querySelectorAll('button')[1];

    fireEvent.click(pauseButton);
    expect(pauseSpy).toHaveBeenCalled();
  });
});
