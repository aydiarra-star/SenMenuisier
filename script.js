// Visual prototype interactions, deliberately local to this page.
const products = document.querySelectorAll('.product');
products.forEach(product => product.addEventListener('click', () => {
  products.forEach(item => item.classList.remove('active'));
  product.classList.add('active');
  document.getElementById('selected-name').textContent = product.dataset.name;
}));
document.querySelectorAll('.wood').forEach(wood => wood.addEventListener('click', () => {
  document.querySelectorAll('.wood').forEach(item => item.classList.remove('active'));
  wood.classList.add('active');
  document.getElementById('read-wood').textContent = wood.dataset.wood;
}));
for (const dimension of ['height', 'width']) {
  document.getElementById(dimension).addEventListener('input', event => {
    document.getElementById(`${dimension}-value`).textContent = event.target.value;
    document.getElementById(`read-${dimension}`).textContent = `${event.target.value} cm`;
  });
}
document.querySelectorAll('.bottom-nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelectorAll('.bottom-nav a').forEach(item => item.classList.remove('current'));
  link.classList.add('current');
}));
