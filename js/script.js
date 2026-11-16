const a=document.getElementById('song'),bs=document.querySelectorAll('[data-music]'),hint=document.getElementById('hint'),root=document.documentElement;
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const IDLE='Tap the turntable to drop the needle \u266A';
/* the UI always follows what the <audio> element really does (iOS can pause or refuse at any time) */
function ui(p){root.classList.toggle('playing',p);bs.forEach(b=>b.setAttribute('aria-pressed',p));hint.textContent=p?'Now playing. Tap to lift the needle.':IDLE}
a.addEventListener('playing',()=>ui(true));
a.addEventListener('pause',()=>ui(false));
a.addEventListener('waiting',()=>{if(!a.paused)hint.textContent='Loading the song\u2026'});
a.addEventListener('error',()=>{ui(false);hint.textContent='The song could not load. Check your connection and tap again.'});
bs.forEach(b=>b.addEventListener('click',()=>{
  if(!a.paused){a.pause();return}
  if(a.error||a.networkState===3)a.load();           /* retry after a failed load */
  hint.textContent='Loading the song\u2026';
  const p=a.play();                                   /* must be called straight from the tap for iOS */
  if(p&&p.catch)p.catch(e=>{ui(false);hint.textContent=e&&e.name==='NotAllowedError'?'Tap the turntable once more to start the song.':'The song could not load. Tap to try again.'});
}));

/* photo stacks: every .sw on the page is its own carousel */
const P=[[0,0,0],[5,9,4],[-6,-9,7],[8,5,11]];
document.querySelectorAll('.sw').forEach((sw,k)=>{
  const st=sw.querySelector('.stack'),cs=[...st.querySelectorAll('.pc')],order=cs.map((_,i)=>i),multi=cs.length>1;
  let busy=false,t,sx=null,vis=false;
  if(!multi)sw.classList.add('single');
  function render(){order.forEach((ci,pos)=>{const[r,x,y]=P[pos]||P[3],c=cs[ci];c.style.transform='translate('+x+'px,'+y+'px) rotate('+r+'deg)';c.style.zIndex=10-pos;c.setAttribute('aria-hidden',pos?'true':'false')})}
  function next(){if(!multi||busy)return;busy=true;const c=cs[order[0]];c.classList.add('fly');setTimeout(()=>{c.classList.add('nt');order.push(order.shift());render();c.offsetWidth;c.classList.remove('fly','nt');busy=false},420)}
  function prev(){if(!multi||busy)return;busy=true;order.unshift(order.pop());const c=cs[order[0]];c.classList.add('fly','nt');render();c.offsetWidth;c.classList.remove('nt');requestAnimationFrame(()=>c.classList.remove('fly'));setTimeout(()=>{busy=false},450)}
  function go(){clearInterval(t);if(!rm&&multi&&vis)t=setInterval(next,4800+k*500)}
  sw.querySelector('.snext').onclick=()=>{next();go()};sw.querySelector('.sprev').onclick=()=>{prev();go()};
  st.addEventListener('pointerdown',e=>{sx=e.clientX;clearInterval(t)});st.addEventListener('pointercancel',()=>{sx=null});
  st.addEventListener('pointerup',e=>{if(sx===null)return;const d=e.clientX-sx;sx=null;if(d>40)prev();else next();setTimeout(go,6000)});
  st.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){next();go()}if(e.key==='ArrowLeft'){prev();go()}});
  ['pointerenter','focusin'].forEach(e=>st.addEventListener(e,()=>clearInterval(t)));['pointerleave','focusout'].forEach(e=>st.addEventListener(e,go));
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting;sw.classList.toggle('vis',vis);vis?go():clearInterval(t)},{threshold:.2}).observe(sw);else{vis=true;sw.classList.add('vis');go()}
  render();
});

if(!rm&&'IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('section:not(#home)').forEach(s=>{s.classList.add('rv');io.observe(s)})}

/* decorations (petals, record, folders, lilies) only animate while they are on screen */
{const els=[document.getElementById('home'),document.querySelector('.folders')].filter(Boolean);
 if('IntersectionObserver' in window){const io2=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('vis',e.isIntersecting)));els.forEach(e=>io2.observe(e))}else els.forEach(e=>e.classList.add('vis'))}

/* navbar: mobile menu + highlight the section you are reading */
{const bt=document.querySelector('.burger'),menu=document.getElementById('menu'),links=[...menu.querySelectorAll('a')];
 const close=()=>{menu.classList.remove('open');bt.setAttribute('aria-expanded','false');bt.setAttribute('aria-label','Open menu')};
 bt.addEventListener('click',()=>{const o=menu.classList.toggle('open');bt.setAttribute('aria-expanded',o);bt.setAttribute('aria-label',o?'Close menu':'Open menu')});
 menu.addEventListener('click',e=>{if(e.target.closest('a'))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 document.addEventListener('click',e=>{if(!e.target.closest('header'))close()});
 const secs=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);let tick=false;
 function spy(){tick=false;const y=innerHeight*.35;let cur=secs[0];secs.forEach(s=>{if(s.getBoundingClientRect().top<=y)cur=s});
  if(innerHeight+scrollY>=document.documentElement.scrollHeight-6)cur=secs[secs.length-1];
  links.forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+cur.id))}
 addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(spy)}},{passive:true});addEventListener('resize',spy);spy();}