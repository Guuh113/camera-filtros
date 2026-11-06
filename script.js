'use strict';
const video = document.getElementById('video');
const cameraButton = document.getElementById('camera');
const statusText = document.getElementById('status');
const placeholder = document.getElementById('placeholder');
const badge = document.getElementById('badge');
let stream = null;

function stopCamera(message = 'Câmera desligada. Você pode ativá-la novamente.') {
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  video.srcObject = null;
  video.style.display = 'none';
  placeholder.style.display = 'flex';
  badge.textContent = 'CÂMERA DESLIGADA';
  badge.classList.remove('live');
  cameraButton.textContent = 'Ativar câmera ↗';
  statusText.textContent = message;
}

cameraButton.addEventListener('click', async () => {
  if (stream) return stopCamera();
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    statusText.textContent = 'Abra o site por HTTPS (GitHub Pages) ou localhost para usar a câmera.';
    return;
  }
  cameraButton.disabled = true;
  statusText.textContent = 'Permita o acesso à câmera no navegador…';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    video.srcObject = stream;
    await video.play();
    video.style.display = 'block';
    placeholder.style.display = 'none';
    badge.textContent = 'AO VIVO';
    badge.classList.add('live');
    cameraButton.textContent = 'Desligar câmera ◼';
    statusText.textContent = 'Câmera ligada. Experimente os filtros abaixo.';
    stream.getVideoTracks().forEach(track => track.addEventListener('ended', () => stopCamera('A câmera foi desconectada. Ative-a novamente.')));
  } catch (error) {
    const messages = {
      NotAllowedError: 'Acesso negado. Permita a câmera nas configurações do navegador e tente novamente.',
      NotFoundError: 'Nenhuma câmera encontrada. Conecte uma câmera e tente novamente.',
      NotReadableError: 'A câmera está indisponível. Feche outros aplicativos que estejam usando a câmera.'
    };
    stopCamera(messages[error.name] || 'Não foi possível iniciar a câmera. Verifique a conexão e tente novamente.');
  } finally {
    cameraButton.disabled = false;
  }
});

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    video.style.filter = button.dataset.filter;
    document.getElementById('filterLabel').textContent = button.querySelector('strong').textContent;
    document.querySelectorAll('.filter').forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  });
});
window.addEventListener('pagehide', () => stopCamera());
