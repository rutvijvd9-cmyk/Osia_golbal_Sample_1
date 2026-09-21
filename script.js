const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];

const cursor=$('.cursor-glow');
window.addEventListener('pointermove',e=>{
  if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'}
});
window.addEventListener('scroll',()=>{
  const h=document.documentElement.scrollHeight-innerHeight;
  $('.progress').style.width=(scrollY/h*100)+'%';
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
},{threshold:.12});
$$('.reveal').forEach(el=>observer.observe(el));

$$('[data-count]').forEach(el=>{
  let done=false;
  const io=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting||done)return;
    done=true;
    const target=+el.dataset.count;
    const start=performance.now(), dur=1000;
    function tick(now){
      const p=Math.min((now-start)/dur,1), eased=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*eased)+'+';
      if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  },{threshold:.7});
  io.observe(el);
});

$$('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    $$('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    $('#'+btn.dataset.tab).classList.add('active');
  });
});

$$('.industry-card').forEach(card=>{
  card.style.setProperty('--card-image',`url("${card.dataset.image}")`);
});

const nav=$('.nav'), menu=$('.menu-toggle');
menu?.addEventListener('click',()=>nav.classList.toggle('open'));
$$('nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

$$('.tilt').forEach(el=>{
  el.addEventListener('pointermove',e=>{
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    el.style.transform=`perspective(1000px) rotateY(${x*4}deg) rotateX(${-y*4}deg)`;
  });
  el.addEventListener('pointerleave',()=>el.style.transform='');
});

// Industry Cards Modal Handler
const modal=$('#industryModal'),
      modalTitle=$('#modalTitle'),
      modalDesc=$('#modalDesc'),
      modalBody=$('#modalBody'),
      modalClose=$('.modal-close'),
      modalDismiss=$('.modal-dismiss-btn'),
      modalInquiry=$('.modal-inquiry-btn');

function openIndustryModal(card){
  const tabId=card.dataset.tab;
  const h3=card.querySelector('h3')?.textContent || 'Industry Details';
  const desc=card.querySelector('p')?.textContent || '';
  const num=card.querySelector('.card-num')?.textContent || '01';

  modalTitle.textContent=h3;
  modalDesc.textContent=desc;
  $('#modalBadge').textContent=`CATEGORY ${num} · PRODUCT DETAILS`;

  const sourcePanel=$('#'+tabId);
  if(sourcePanel){
    modalBody.innerHTML=sourcePanel.innerHTML;
  } else {
    modalBody.innerHTML=`<p>Detailed product specifications available upon inquiry.</p>`;
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}

function closeIndustryModal(){
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

$$('.industry-card').forEach(card=>{
  card.addEventListener('click',()=>openIndustryModal(card));
  card.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      openIndustryModal(card);
    }
  });
});

modalClose?.addEventListener('click',closeIndustryModal);
modalDismiss?.addEventListener('click',closeIndustryModal);
modalInquiry?.addEventListener('click',()=>{
  closeIndustryModal();
});

modal?.addEventListener('click',e=>{
  if(e.target===modal) closeIndustryModal();
});

window.addEventListener('keydown',e=>{
  if(e.key==='Escape' && modal.classList.contains('active')){
    closeIndustryModal();
  }
});

