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

// Tabs logic (if tab buttons are present)
$$('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    $$('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    const target = $('#'+btn.dataset.tab);
    if(target) target.classList.add('active');
  });
});

$$('.industry-card').forEach(card=>{
  card.style.setProperty('--card-image',`url("${card.dataset.image}")`);
});

const menu=$('.menu-toggle'),
      sidebarDrawer=$('#sidebarDrawer'),
      sidebarClose=$('.sidebar-close'),
      sidebarBackdrop=$('#sidebarBackdrop');

function openNav(){
  document.body.classList.add('nav-open');
  menu?.setAttribute('aria-expanded','true');
  if(menu) menu.textContent = '✕';
  sidebarDrawer?.setAttribute('aria-hidden','false');
}

function closeNav(){
  document.body.classList.remove('nav-open');
  menu?.setAttribute('aria-expanded','false');
  if(menu) menu.textContent = '☰';
  sidebarDrawer?.setAttribute('aria-hidden','true');
}

menu?.addEventListener('click',()=>{
  if(document.body.classList.contains('nav-open')){
    closeNav();
  } else {
    openNav();
  }
});
sidebarClose?.addEventListener('click',closeNav);
sidebarBackdrop?.addEventListener('click',closeNav);
function scrollToTarget(targetId){
  const el = document.getElementById(targetId);
  if(!el) return;
  const nav = document.querySelector('.nav');
  const navHeight = nav ? nav.offsetHeight : (window.innerWidth <= 760 ? 70 : 82);
  const targetY = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: 'smooth'
  });
}

$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e => {
    // If it's a contact button, the modal handler handles it without scrolling
    if (a.classList.contains('open-contact-btn')) {
      e.preventDefault();
      closeNav();
      return;
    }
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      const targetId = href.slice(1);
      if (targetId) {
        e.preventDefault();
        const wasOpen = document.body.classList.contains('nav-open');
        closeNav();
        // Allow sidebar CSS transition/reflow before measuring or scrolling
        if (wasOpen) {
          setTimeout(() => {
            scrollToTarget(targetId);
          }, 150);
        } else {
          scrollToTarget(targetId);
        }
      }
    } else {
      closeNav();
    }
  });
});

window.addEventListener('keydown',e=>{
  if(e.key==='Escape' && document.body.classList.contains('nav-open')){
    closeNav();
  }
});

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


// Contact Us Popup Modal Handler
const contactModal = $('#contactModal'),
      contactModalClose = $('#contactModalClose'),
      contactForm = $('#contactQueryForm'),
      formStatus = $('#formStatus');

function openContactModal() {
  if (!contactModal) return;
  closeIndustryModal();
  if (typeof closeNav === 'function') closeNav();
  contactModal.classList.add('active');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function resetContactFormStatus() {
  if (formStatus) {
    formStatus.className = 'form-status';
    formStatus.textContent = '';
  }
}

function closeContactModal() {
  if (!contactModal) return;
  contactModal.classList.remove('active');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  resetContactFormStatus();
}

// Clear message when visitor returns to website window/tab after leaving or closing their mail client
window.addEventListener('focus', () => {
  if (formStatus && formStatus.textContent) {
    resetContactFormStatus();
  }
});

$$('.open-contact-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    resetContactFormStatus();
    openContactModal();
  });
});

contactModalClose?.addEventListener('click', closeContactModal);

contactModal?.addEventListener('click', e => {
  if (e.target === contactModal) closeContactModal();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && contactModal?.classList.contains('active')) {
    closeContactModal();
  }
});

let statusTimeout = null;

contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#queryName')?.value.trim() || '';
  const email = $('#queryEmail')?.value.trim() || '';
  const company = $('#queryCompany')?.value.trim() || '';
  const phone = $('#queryPhone')?.value.trim() || '';
  const subject = $('#querySubject')?.value.trim() || 'General Business Inquiry';
  const message = $('#queryMessage')?.value.trim() || '';

  const emailSubject = encodeURIComponent(`[OSIA Website Inquiry] ${subject}`);
  const emailBody = encodeURIComponent(
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    (company ? `Company: ${company}\n` : '') +
    (phone ? `Phone: ${phone}\n` : '') +
    `\nRequirement / Message:\n${message}\n`
  );

  // Trigger default email client addressed to business@osiaglobalhk.com
  window.location.href = `mailto:business@osiaglobalhk.com?subject=${emailSubject}&body=${emailBody}`;

  if (formStatus) {
    formStatus.className = 'form-status success';
    formStatus.textContent = 'Opening your email client to dispatch this query directly to business@osiaglobalhk.com...';
  }

  // Reset form inputs after submitting
  contactForm.reset();

  // Auto-dismiss the status notification after 4 seconds
  if (statusTimeout) clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    resetContactFormStatus();
  }, 4000);
});

// Automatic Background Slider (Hero & Contact sections, 2s interval)
function initAutoSlider(slideSelector) {
  const slides = $$(slideSelector);
  if (!slides || slides.length < 2) return;
  let currentIndex = 0;
  setInterval(() => {
    slides[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add('active');
  }, 2000);
}
initAutoSlider('.hero-slide');
