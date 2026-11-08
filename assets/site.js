(function(){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

/* scroll reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px'});
$$('.rv').forEach(el=>io.observe(el));

/* count-up numbers */
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);
  const el=e.target,to=+el.dataset.to;if(reduce){el.textContent=to.toLocaleString();return}
  const t0=performance.now(),dur=1500;
  const step=n=>{const k=clamp((n-t0)/dur),v=1-Math.pow(1-k,3);el.textContent=Math.round(to*v).toLocaleString();if(k<1)requestAnimationFrame(step)};
  el.textContent='0';requestAnimationFrame(step)}),{threshold:.6});
$$('.cu').forEach(el=>cio.observe(el));

/* keep giant words inside their panels, whatever font loads */
function fit(){$$('.fit').forEach(el=>{el.style.fontSize='';const cs=getComputedStyle(el);const pad=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);const avail=el.clientWidth-pad;let fs=parseFloat(cs.fontSize),n=0;while(el.scrollWidth-pad>avail+1&&n++<40){fs*=.96;el.style.fontSize=fs+'px'}})}
fit();addEventListener('resize',fit);(document.fonts&&document.fonts.ready||Promise.resolve()).then(fit);

/* menu */
const menu=$('.menu');
if(menu){const b=menu.querySelector('.menu-btn');
  b.addEventListener('click',e=>{e.stopPropagation();const o=menu.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  document.addEventListener('click',e=>{if(!menu.contains(e.target)){menu.classList.remove('open');b.setAttribute('aria-expanded','false')}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.classList.remove('open');b.setAttribute('aria-expanded','false')}});
}

/* page transitions: blur out before going to another page (same-page # links only scroll) */
document.addEventListener('click',e=>{
  const a=e.target.closest('a');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank')return;
  const href=a.getAttribute('href')||'';
  if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||/^https?:/.test(href))return;
  const [page,hash]=href.split('#');const here=location.pathname.split('/').pop()||'index.html';
  if(page===here||page===''){return}
  if(reduce)return;
  e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>{location.href=href},420);
});
addEventListener('pageshow',()=>document.body.classList.remove('leaving'));

/* gallery filters */
const tiles=$$('.tile');
if(tiles.length&&$('.filters')){
  let brand='all',type='all';
  const apply=()=>{let n=0;tiles.forEach(t=>{const ok=(brand==='all'||t.dataset.b===brand)&&(type==='all'||t.dataset.t===type);t.classList.toggle('hide',!ok);if(ok)n++});$('#count').textContent=n+' ชิ้น'};
  $$('.chip[data-brand]').forEach(c=>c.addEventListener('click',()=>{brand=c.dataset.brand;$$('.chip[data-brand]').forEach(x=>x.setAttribute('aria-pressed',x===c));apply()}));
  $$('.chip[data-type]').forEach(c=>c.addEventListener('click',()=>{type=c.dataset.type;$$('.chip[data-type]').forEach(x=>x.setAttribute('aria-pressed',x===c));apply()}));
  const q=new URLSearchParams(location.search).get('brand')||location.hash.slice(1);
  const pre=q&&$(`.chip[data-brand="${q}"]`);if(pre)pre.click();else apply();
  addEventListener('hashchange',()=>{const c=$(`.chip[data-brand="${location.hash.slice(1)}"]`);if(c){c.click();$('.filters').scrollIntoView({behavior:reduce?'auto':'smooth'})}});
}

/* lightbox */
const lb=$('#lb');
if(lb){
  const img=lb.querySelector('img'),cap=lb.querySelector('.cap'),pos=lb.querySelector('.pos');
  let list=[],i=0,last=null;
  const show=k=>{i=(k+list.length)%list.length;const d=list[i].dataset;img.classList.add('swap');
    setTimeout(()=>{img.src=d.src;img.alt=d.alt||'';img.onload=()=>img.classList.remove('swap')},reduce?0:160);
    cap.innerHTML=`${d.cap}<span>${d.sub||''}</span>`;pos.textContent=`${i+1} / ${list.length}`};
  const open=el=>{list=$$('[data-src]').filter(x=>!x.classList.contains('hide'));last=el;lb.classList.add('open');document.body.style.overflow='hidden';show(list.indexOf(el));lb.querySelector('.close').focus()};
  const close=()=>{lb.classList.remove('open');document.body.style.overflow='';last&&last.focus()};
  $$('[data-src]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();open(el)}));
  lb.querySelector('.close').addEventListener('click',close);
  lb.querySelector('.prev').addEventListener('click',()=>show(i-1));
  lb.querySelector('.next-b').addEventListener('click',()=>show(i+1));
  lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('stage'))close()});
  document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});
}

/* contact form: builds a ready-to-send message (no server yet) */
const form=$('#brief');
if(form){
  let kind='';
  $$('#brief .chip').forEach(c=>c.addEventListener('click',()=>{kind=c.textContent.trim();$$('#brief .chip').forEach(x=>x.setAttribute('aria-pressed',x===c))}));
  form.addEventListener('submit',e=>{e.preventDefault();let ok=true;
    ['name','contact','detail'].forEach(n=>{const f=form.elements[n],w=f.closest('.field');const bad=!f.value.trim();w.classList.toggle('bad',bad);if(bad)ok=false});
    if(!ok){form.querySelector('.bad input,.bad textarea').focus();return}
    const v=n=>form.elements[n].value.trim();
    const msg=`สวัสดีครับ/ค่ะ คุณ Tanachok\n\nชื่อ: ${v('name')}\nแบรนด์: ${v('brand')||'-'}\nติดต่อกลับ: ${v('contact')}\nประเภทงาน: ${kind||'-'}\n\nรายละเอียด:\n${v('detail')}`;
    $('#msg').textContent=msg;form.hidden=true;$('#done').classList.add('on');
    $('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(msg);document.querySelectorAll('#copy .roll span').forEach(s=>s.textContent='คัดลอกแล้ว ✓')}catch(err){}};
  });
  $('#again')&&$('#again').addEventListener('click',()=>{form.hidden=false;$('#done').classList.remove('on')});
}
})();

/* video filters */
(function(){
  const cards=[...document.querySelectorAll('.vcard')],chips=[...document.querySelectorAll('.chip[data-vcat]')];
  if(!cards.length)return;
  chips.forEach(c=>c.addEventListener('click',()=>{const k=c.dataset.vcat;let n=0;
    chips.forEach(x=>x.setAttribute('aria-pressed',x===c));
    cards.forEach(v=>{const ok=k==='all'||v.dataset.cat===k;v.classList.toggle('hide',!ok);if(ok){n++;v.classList.add('in')}});
    document.getElementById('vcount').textContent=n+' วิดีโอ'}));
})();
