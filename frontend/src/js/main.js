import '../css/main.css';

fetch('/src/views/add.condominio.html')
  .then(res => res.text())
  .then(html => {
    document.querySelector('#app').innerHTML = html;
  });
