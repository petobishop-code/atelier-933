const header = document.querySelector('.site-header');
window.addEventListener('scroll',()=>{
  header.style.background = window.scrollY > 40 ? 'rgba(7,15,27,.94)' : 'linear-gradient(to bottom,rgba(5,15,30,.9),rgba(5,15,30,.15))';
});
