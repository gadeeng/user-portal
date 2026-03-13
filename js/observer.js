  const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Stagger children in grids
document.querySelectorAll('.features-grid .feat-card, .pricing-grid .pkg-card').forEach((el,i)=>{
  el.style.transitionDelay=(i*.08)+'s';
});