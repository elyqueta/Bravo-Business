/* ════════ DATA ════════ */
const products = [
  {
    id:'BB-R001',
    name:'Coletes',
    cat:'roupas',
    price:14500,
    oldPrice:16000,
    img:'images/produtos/roupas/colete2.jpeg',
    badge:'sale'
  },
  {
    id:'BB-R002',
    name:'Colete Cardigan',
    cat:'roupas',
    price:8000,
    oldPrice:9500,
    img:'images/produtos/roupas/Colete_Cardigan.jpeg',
    badge:'Sale'
  },
  {
    id:'BB-R003',
    name:'Equipamento Desportivos',
    cat:'roupas',
    price:7500,
    img:'images/produtos/roupas/equipamento_barca.jpeg'
  },
  {
    id:'BB-R004',
    name:'T-Shirt Lisas (todas as cores)',
    cat:'roupas',
    price:6000,
    img:'images/produtos/roupas/tshirtAll2.jpeg'
  },
  {
    id:'BB-R005',
    name:'Fato Social',
    cat:'roupas',
    price:65000,
    oldPrice:80000,
    img:'images/produtos/roupas/fato2.jpeg',
    badge:'Sale'
  },
  {
    id:'BB-C001',
    name:'Chuteira de Futebol',
    cat:'tenis',
    price:25000,
    img:'images/produtos/calcados/chuteira.jpeg',
    badge:'Novo'
  },
  {
    id:'BB-C002',
    name:'Chuteira de Futsal',
    cat:'tenis',
    price:14000,
    img:'images/produtos/calcados/chuteira_sem_pitao.jpeg'
  },
  // {id:'BB-T004',name:'Trainer Pro Carbon',     cat:'tenis',      price:82000,             img:'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',badge:'Premium'},
  // {id:'BB-T005',name:'Slide Comfort Pool',     cat:'tenis',      price:12000,             img:'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80'},
  // {id:'BB-A001',name:'Relógio Minimalista Gold',cat:'acessorios', price:95000,             img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',badge:'Premium'},
  // {id:'BB-A002',name:'Boné Signature Cap',     cat:'acessorios', price:9500,              img:'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80'},
  // {id:'BB-A003',name:'Mochila Urban Explorer', cat:'acessorios', price:42000,oldPrice:55000,img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',badge:'Sale'},
  // {id:'BB-A004',name:'Cinturão Pele Clássico', cat:'acessorios', price:18000,             img:'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80'},
  {id:'BB-A005',name:'Brevemente teremos acessórios..',   cat:'acessorios', price:0,             img:'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80',badge:'Novo'},
//   {id:'BB-A006',name:'Carteira Slim Wallet',   cat:'acessorios', price:4000,             img:'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80'},
];
const catMeta = {
  roupas:    {label:'Roupas',     icon:'fa-shirt',       anchor:'s-roupas'},
  tenis:     {label:'Calçados',      icon:'fa-shoe-prints', anchor:'s-calcados'},
  acessorios:{label:'Acessórios', icon:'fa-gem',         anchor:'s-acessorios'},
};

/* ════════ STATE ════════ */
let cart=[], wishlist=[], currentCat='all';

/* ════════ UTILS ════════ */
const fmt = n => n.toLocaleString('pt-AO')+' Kz';

/* ════════ HERO SLIDER ════════ */
let si=0;
const slides=document.querySelectorAll('.slide');
const hdots=document.querySelectorAll('.hdot');
function goSlide(n){
  slides[si].classList.remove('on'); hdots[si].classList.remove('on');
  si=n; slides[si].classList.add('on'); hdots[si].classList.add('on');
}
function nxtSlide(){goSlide((si+1)%slides.length)}
let slT=setInterval(nxtSlide,10000);
hdots.forEach((d,i)=>d.addEventListener('click',()=>{clearInterval(slT);goSlide(i);slT=setInterval(nxtSlide,10000)}));

/* ════════ THEME ════════ */
let dark=false;
function toggleTheme(){
  dark=!dark;
  document.documentElement.setAttribute('data-theme',dark?'dark':'light');
  document.getElementById('themeIco').className=dark?'fa-solid fa-sun':'fa-solid fa-moon';
  document.getElementById('mobTog').classList.toggle('on',dark);
}
document.getElementById('themeBtn').addEventListener('click',toggleTheme);

/* ════════ MOBILE MENU ════════ */
const hbg=document.getElementById('hbgBtn');
const mobMenu=document.getElementById('mobMenu');
const mobOv=document.getElementById('mobOv');
function closeMob(){
  hbg.classList.remove('on'); mobMenu.classList.remove('on'); mobOv.classList.remove('on');
  document.body.style.overflow='';
}
function openMob(){
  hbg.classList.add('on'); mobMenu.classList.add('on'); mobOv.classList.add('on');
  document.body.style.overflow='hidden';
}
hbg.addEventListener('click',()=>mobMenu.classList.contains('on')?closeMob():openMob());
mobOv.addEventListener('click',closeMob);
document.getElementById('mobClose').addEventListener('click',closeMob);

/* NAVBAR SCROLL */
window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',scrollY>40));

/* ════════ RENDER ════════ */
function cardHtml(p){
  const inW=wishlist.includes(p.id);
  const bc=p.badge==='Sale'?'sale':p.badge==='Premium'?'premium':'';
  return `
  <div class="pcard rv" id="card-${p.id}">
    <div class="pimg" onclick="openModal('${p.id}')" style="cursor:pointer">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      ${p.badge?`<span class="pbadge ${bc}">${p.badge}</span>`:''}
      <div class="pcard-acts">
        <button class="pact" onclick="openModal('${p.id}')" title="Ver detalhes">
          <i class="fa-solid fa-magnifying-glass-plus"></i>
        </button>
        <button class="pact${inW?' wishlisted':''}" id="wbtn-${p.id}" onclick="toggleWish('${p.id}')" title="Favoritos">
          <i class="fa-${inW?'solid':'regular'} fa-heart"></i>
        </button>
      </div>
    </div>
    <div class="pinfo">
      <p class="pcode">${p.id}</p>
      <p class="pname">${p.name}</p>
      <p class="pcat">${catMeta[p.cat]?.label}</p>
      <div class="pfooter">
        <div class="pprice">
          ${p.oldPrice?`<span class="old">${fmt(p.oldPrice)}</span>`:''}
          ${fmt(p.price)}
        </div>
        <button class="btn-add" onclick="addCart('${p.id}')">
          <i class="fa-solid fa-bag-shopping" style="font-size:11px"></i> Adicionar
        </button>
      </div>
    </div>
  </div>`;
}

function renderSections(cat){
  const wrap=document.getElementById('pSections');
  const cats=cat==='all'?['roupas','tenis','acessorios']:[cat];
  wrap.innerHTML=cats.map(c=>{
    const m=catMeta[c];
    const list=products.filter(p=>p.cat===c);
    return `
    <div class="cat-sec" id="${m.anchor}">
      <div class="cat-sec-hd">
        <div class="cat-hd-left">
          <div class="cat-ico"><i class="fa-solid ${m.icon}"></i></div>
          <h2 class="cat-title">${m.label}</h2>
        </div>
        <a href="#${m.anchor}" class="see-all">Ver todos <i class="fa-solid fa-arrow-right" style="font-size:10px"></i></a>
      </div>
      <div class="pgrid">${list.map(cardHtml).join('')}</div>
    </div>`;
  }).join('');
  observeRv();
}
renderSections('all');

/* CAT FILTER */
document.getElementById('catNav').addEventListener('click',e=>{
  const btn=e.target.closest('.cat-pill');
  if(!btn)return;
  document.querySelectorAll('.cat-pill').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  currentCat=btn.dataset.cat;
  renderSections(currentCat);
  setTimeout(()=>document.getElementById('products').scrollIntoView({behavior:'smooth',block:'start'}),60);
});

/* ════════ CART ════════ */
function addCart(id){
  const p=products.find(x=>x.id===id);
  const ex=cart.find(x=>x.id===id);
  if(ex) ex.qty++; else cart.push({...p,qty:1});
  updateCartUI(); toast(`${p.name} adicionado ao carrinho`);
}
function rmCart(id){cart=cart.filter(x=>x.id!==id);updateCartUI();renderCart()}
function chQty(id,d){
  const item=cart.find(x=>x.id===id);if(!item)return;
  item.qty+=d; if(item.qty<=0){rmCart(id);return;}
  updateCartUI();renderCart();
}
function updateCartUI(){
  const count=cart.reduce((s,x)=>s+x.qty,0);
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const b=document.getElementById('cartBadge');
  b.textContent=count; b.classList.toggle('on',count>0);
  document.getElementById('cartTotal').textContent=fmt(total);
  document.getElementById('cartFt').style.display=cart.length?'block':'none';
}
function renderCart(){
  const emp=document.getElementById('cartEmpty');
  const itms=document.getElementById('cartItems');
  if(!cart.length){emp.style.display='flex';itms.innerHTML='';return}
  emp.style.display='none';
  itms.innerHTML=cart.map(i=>`
    <div class="ditem">
      <div class="ditem-img"><img src="${i.img}" alt="${i.name}"></div>
      <div class="ditem-info">
        <p class="ditem-code">${i.id}</p>
        <p class="ditem-name">${i.name}</p>
        <div class="ditem-ctrl">
          <div class="qty">
            <button class="qbtn" onclick="chQty('${i.id}',-1)"><i class="fa-solid fa-minus" style="font-size:9px"></i></button>
            <span class="qnum">${i.qty}</span>
            <button class="qbtn" onclick="chQty('${i.id}',1)"><i class="fa-solid fa-plus" style="font-size:9px"></i></button>
          </div>
          <button class="btn-rm" onclick="rmCart('${i.id}')"><i class="fa-solid fa-trash-can" style="font-size:9px"></i> Remover</button>
        </div>
      </div>
      <div class="ditem-price">${fmt(i.price*i.qty)}</div>
    </div>`).join('');
}
function openCart(){renderCart();document.getElementById('cartOv').classList.add('on');document.getElementById('cartDrw').classList.add('on');document.body.style.overflow='hidden'}
function closeCart(){document.getElementById('cartOv').classList.remove('on');document.getElementById('cartDrw').classList.remove('on');document.body.style.overflow=''}
document.getElementById('cartBtn').addEventListener('click',openCart);
document.getElementById('cartClose').addEventListener('click',closeCart);
document.getElementById('cartOv').addEventListener('click',closeCart);
document.getElementById('waBtn').addEventListener('click',()=>{
  if(!cart.length)return;
  const lines=cart.map(i=>`• ${i.name} (${i.id}) x${i.qty} = ${fmt(i.price*i.qty)}`).join('\n');
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  const msg=`*Olá, Bravo Business!*\n\nGostaria de encomendar:\n\n${lines}\n\n*Total: ${fmt(total)}*\n\nAguardo confirmação. Obrigado! 😊`;
  window.open(`https://wa.me/244957103656?text=${encodeURIComponent(msg)}`,'_blank');
});

/* ════════ WISHLIST ════════ */
function toggleWish(id){
  const p=products.find(x=>x.id===id);
  const idx=wishlist.indexOf(id);
  if(idx===-1){wishlist.push(id);toast(`${p.name} adicionado aos favoritos`)}
  else wishlist.splice(idx,1);
  const btn=document.getElementById(`wbtn-${id}`);
  if(btn){
    const inW=wishlist.includes(id);
    btn.classList.toggle('wishlisted',inW);
    btn.innerHTML=`<i class="fa-${inW?'solid':'regular'} fa-heart"></i>`;
  }
  updateWishUI();
}
function updateWishUI(){
  const b=document.getElementById('wishBadge');
  b.textContent=wishlist.length; b.classList.toggle('on',wishlist.length>0);
  document.getElementById('wishFt').style.display=wishlist.length?'block':'none';
}
function renderWish(){
  const emp=document.getElementById('wishEmpty');
  const itms=document.getElementById('wishItems');
  if(!wishlist.length){emp.style.display='flex';itms.innerHTML='';return}
  emp.style.display='none';
  itms.innerHTML=wishlist.map(id=>{
    const p=products.find(x=>x.id===id);
    return `
    <div class="ditem">
      <div class="ditem-img"><img src="${p.img}" alt="${p.name}"></div>
      <div class="ditem-info">
        <p class="ditem-code">${p.id}</p>
        <p class="ditem-name">${p.name}</p>
        <div class="ditem-ctrl">
          <button class="btn-to-cart" onclick="addCart('${p.id}')"><i class="fa-solid fa-bag-shopping"></i> Adicionar ao carrinho</button>
          <button class="btn-rm" onclick="toggleWish('${p.id}');renderWish()"><i class="fa-solid fa-trash-can" style="font-size:9px"></i> Remover</button>
        </div>
      </div>
      <div class="ditem-price">${fmt(p.price)}</div>
    </div>`;
  }).join('');
}
function openWish(){renderWish();document.getElementById('wishOv').classList.add('on');document.getElementById('wishDrw').classList.add('on');document.body.style.overflow='hidden'}
function closeWish(){document.getElementById('wishOv').classList.remove('on');document.getElementById('wishDrw').classList.remove('on');document.body.style.overflow=''}
document.getElementById('wishBtn').addEventListener('click',openWish);
document.getElementById('wishClose').addEventListener('click',closeWish);
document.getElementById('wishOv').addEventListener('click',closeWish);
document.getElementById('wishWaBtn').addEventListener('click',()=>{
  if(!wishlist.length)return;
  const lines=wishlist.map(id=>{const p=products.find(x=>x.id===id);return `• ${p.name} (${p.id}) — ${fmt(p.price)}`;}).join('\n');
  const msg=`*Olá, Bravo Business!*\n\nTenho interesse nestes produtos:\n\n${lines}\n\nPodem confirmar disponibilidade? Obrigado!`;
  window.open(`https://wa.me/244957103656?text=${encodeURIComponent(msg)}`,'_blank');
});

/* ════════ TOAST ════════ */
let tT;
function toast(msg){
  document.getElementById('toastTxt').textContent=msg;
  document.getElementById('toast').classList.add('on');
  clearTimeout(tT); tT=setTimeout(()=>document.getElementById('toast').classList.remove('on'),2800);
}

/* ════════ SCROLL REVEAL ════════ */
function observeRv(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target)}});
  },{threshold:.1});
  document.querySelectorAll('.rv:not(.vis)').forEach(el=>obs.observe(el));
}
observeRv();

/* ════════ PRODUCT MODAL ════════ */
// Extra images per product (simulate gallery with colour variants)
const extraImgs = {
  'BB-R001':['images/produtos/roupas/colete2.jpeg','images/produtos/roupas/colete.jpeg'],
  'BB-R002':['images/produtos/roupas/Colete_Cardigan.jpeg','images/produtos/roupas/Colete_Cardigan2.jpeg','images/produtos/roupas/Colete_Cardigan3.jpeg'],
  'BB-R003':['images/produtos/roupas/equipamento_barca.jpeg','images/produtos/roupas/equipamento_petro.jpeg'],
  'BB-R004':['images/produtos/roupas/tshirtAll2.jpeg','images/produtos/roupas/tshirtAll.jpeg', 'images/produtos/roupas/tshirtAll3.jpeg'],
  'BB-R005':['images/produtos/roupas/fato2.jpeg'],
  'BB-C001':['images/produtos/calcados/chuteira.jpeg'],
  'BB-C002':['images/produtos/calcados/chuteira_sem_pitao.jpeg','images/produtos/calcados/chuteira_sem_pitao2.jpeg'],
  'BB-A002':['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80','https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80'],
  'BB-A003':['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80','https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&q=80'],
  'BB-A004':['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80','https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80'],
  'BB-A005':['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80','https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=800&q=80'],
  'BB-A006':['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'],
};

const productDescs = {
  roupas:{
    'BB-R001':'Camisa de linho premium com corte regular, botões de madrepérola e acabamento impecável. Respirável e leve, ideal para dias quentes em Luanda. Disponível em branco, azul e areia.',
    'BB-R002':'Hoodie oversized de algodão pesado com interior fleece ultra-macio. Design urbano com bolso canguru e capuz ajustável. A peça essencial do streetwear moderno.',
    'BB-R003':'Pack de 2 t-shirts básicas de algodão penteado 180g. Corte slim sem ser justo, costuras reforçadas e gola ribana duradoura. O básico que não falha.',
    'BB-R004':'Calça cargo com 6 bolsos funcionais, cintura ajustável e tecido ripstop resistente. Perfeita para o dia a dia ou aventuras urbanas.',
    'BB-R005':'Bomber jacket com forro de cetim, punhos e barra em ribana, zíper YKK e bolsos internos. O ícone do streetwear que nunca sai de moda.',
    'BB-R006':'Polo slim fit de algodão piqué premium com bordado discreto no peito. Elegância sem esforço, do casual ao semi-formal.',
  },
  tenis:{
    'BB-C001':'Calçados running de alta performance com entressola de espuma reactiva, upper em mesh respirável e sola de borracha Adiwear. Para correr mais e melhor.',
    'BB-C002':'Clássico low-top em couro sintético com sola de borracha vulcanizada. O branco limpo que combina com tudo e nunca passa de moda.',
    'BB-C003':'High-top em lona reforçada com palmilha acolchoada e tornozelo extra-alto. Estilo retro com conforto moderno para o dia todo.',
    'BB-C004':'Calçados de treino profissional com placa de carbono, amortecimento Boost e upper em Primeknit. Para performance máxima no ginásio.',
    'BB-C005':'Chinelo de recuperação com tira larga ajustável e palmilha de EVA moldada ao pé. Conforto supremo para descanso pós-treino ou casa.',
  },
  acessorios:{
    'BB-A001':'Relógio analógico de quartzo japonês com caixa de aço inoxidável 40mm, mostrador minimalista e bracelete em malha milanesa. Elegância atemporal no pulso.',
    'BB-A002':'Boné dad hat com logo bordado em 3D, fivela ajustável em metal e viseira curva. O acessório que eleva qualquer look.',
    'BB-A003':'Mochila 30L em nylon 600D resistente à água com sistema anti-roubo, porta USB integrada e múltiplos compartimentos organizados.',
    'BB-A004':'Cinturão em couro genuíno curtido vegetalmente, fivela de zinco escovado e largura de 35mm. Durabilidade e classe em cada detalhe.',
    'BB-A005':'Óculos aviador com armação de metal dourado, lentes de policarbonato UV400 e hastes dobráveis. Protecção total com estilo vintage.',
    'BB-A006':'Carteira slim em couro de grão fino com 6 bolsos para cartões, compartimento para notas e bolso externo para acesso rápido.',
  },
};

const productFeatures = {
  'BB-R001':['Material: 100% Linho natural','Disponível: S, M, L, XL, XXL','Lavagem: Máquina 30°C','Origem: Portugal'],
  'BB-R002':['Material: 80% Algodão, 20% Poliéster','Interior: Fleece premium','Disponível: S, M, L, XL','Lavagem: Máquina 40°C'],
  'BB-R003':['Material: 100% Algodão 180g','Pack com 2 unidades','Disponível: S, M, L, XL, XXL','Lavagem: Máquina 40°C'],
  'BB-R004':['Material: Ripstop 65% Poliéster 35% Algodão','6 bolsos funcionais','Disponível: 28 ao 36','Lavagem: Máquina 30°C'],
  'BB-R005':['Material: 100% Poliéster + forro cetim','Zíper YKK','Disponível: S, M, L, XL','Lavagem: Máquina 30°C'],
  'BB-R006':['Material: Algodão piqué 200g','Bordado no peito','Disponível: S, M, L, XL, XXL','Lavagem: Máquina 40°C'],
  'BB-C001':['Entressola: Espuma reactiva','Upper: Mesh respirável','Tamanhos: 38 ao 42','Género: Unissexo'],
  'BB-C002':['Material: Couro sintético','Sola: Borracha vulcanizada','Tamanhos: 36 ao 42','Género: Unissexo'],
  'BB-A001':['Movimento: Quartzo japonês','Caixa: Aço inox 40mm','Resistência: 3ATM','Garantia: 12 meses'],
  'BB-A002':['Material: 100% Algodão','Ajuste: Fivela em metal','Tamanho: Único ajustável','Bordado: 3D premium'],
  'BB-A003':['Capacidade: 30 litros','Material: Nylon 600D','Porta USB integrada','Sistema anti-roubo'],
  'BB-A004':['Material: Couro genuíno','Largura: 35mm','Fivela: Zinco escovado','Comprimento: 110-130cm'],
  'BB-A005':['Armação: Metal dourado','Lentes: Policarbonato UV400','Hastes dobráveis','Estojo incluído'],
  'BB-A006':['Material: Couro grão fino','Capacidade: 6 cartões','Espessura: 8mm','Dimensões: 10 x 7cm'],
};

let currentModalId = null;

function openModal(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  currentModalId = id;

  // Badge
  const badge = document.getElementById('mBadge');
  if(p.badge){
    badge.textContent = p.badge;
    badge.className = 'modal-info-badge' + (p.badge==='Sale'?' sale':p.badge==='Premium'?' premium':'');
    badge.style.display='inline-flex';
  } else { badge.style.display='none'; }

  // Text info
  document.getElementById('mCode').textContent = p.id;
  document.getElementById('mName').textContent = p.name;
  const catEl = document.getElementById('mCat');
  const catIcon = {roupas:'fa-shirt',tenis:'fa-shoe-prints',acessorios:'fa-gem'}[p.cat];
  catEl.innerHTML = `<i class="fa-solid ${catIcon}"></i> ${catMeta[p.cat]?.label}`;

  // Description
  const descMap = productDescs[p.cat] || {};
  document.getElementById('mDesc').textContent = descMap[p.id] || 'Produto de qualidade premium seleccionado pela Bravo Business.';

  // Features
  const feats = productFeatures[p.id] || [];
  document.getElementById('mFeatures').innerHTML = feats.map(f=>`
    <div class="modal-feat-row"><i class="fa-solid fa-circle-check"></i>${f}</div>`).join('');

  // Price
  const old = document.getElementById('mOldPrice');
  if(p.oldPrice){ old.textContent=fmt(p.oldPrice); old.style.display='inline'; }
  else old.style.display='none';
  document.getElementById('mPrice').textContent = fmt(p.price);

  // Images — gallery
  const imgs = extraImgs[p.id] || [p.img];
  const mainEl = document.getElementById('modalMainImgEl');
  mainEl.src = imgs[0]; mainEl.alt = p.name;

  const thumbsEl = document.getElementById('modalThumbs');
  if(imgs.length > 1){
    thumbsEl.style.display='flex';
    thumbsEl.innerHTML = imgs.map((src,i)=>`
      <div class="mthumb${i===0?' on':''}" onclick="switchModalImg('${src}',this)">
        <img src="${src}" alt="${p.name} ${i+1}" loading="lazy">
      </div>`).join('');
  } else {
    thumbsEl.style.display='none';
    thumbsEl.innerHTML='';
  }

  // Cart btn
  document.getElementById('mBtnCart').onclick = ()=>{ addCart(id); toast(`${p.name} adicionado ao carrinho`); };

  // Wish btn
  updateModalWishBtn(id);
  document.getElementById('mBtnWish').onclick = ()=>{ toggleWish(id); updateModalWishBtn(id); };

  // Open
  document.getElementById('modalOv').classList.add('on');
  document.body.style.overflow='hidden';
}

function updateModalWishBtn(id){
  const inW = wishlist.includes(id);
  const btn = document.getElementById('mBtnWish');
  const ico = document.getElementById('mWishIco');
  const txt = document.getElementById('mBtnWishTxt');
  btn.classList.toggle('wishlisted', inW);
  ico.className = `fa-${inW?'solid':'regular'} fa-heart`;
  txt.textContent = inW ? 'Remover dos Favoritos' : 'Guardar nos Favoritos';
}

function switchModalImg(src, thumb){
  document.getElementById('modalMainImgEl').src = src;
  document.querySelectorAll('.mthumb').forEach(t=>t.classList.remove('on'));
  thumb.classList.add('on');
}

function closeModal(){
  document.getElementById('modalOv').classList.remove('on');
  document.body.style.overflow='';
  currentModalId=null;
}

function handleModalOvClick(e){
  if(e.target===document.getElementById('modalOv')) closeModal();
}

// Close on Escape key
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });