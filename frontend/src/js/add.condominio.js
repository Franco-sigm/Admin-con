import '../css/main.css';


document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
});
