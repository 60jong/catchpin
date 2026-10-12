// FAQ 아코디언 — 한 번에 하나만 펼친다 (디자인 원본과 동일한 동작)
const buttons = document.querySelectorAll('[data-faq]');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const willOpen = button.getAttribute('aria-expanded') !== 'true';
    buttons.forEach((other) => setOpen(other, other === button && willOpen));
  });
});

function setOpen(button, open) {
  button.setAttribute('aria-expanded', String(open));
  button.querySelector('span').style.transform = `rotate(${open ? 180 : 0}deg)`;
  document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
}
