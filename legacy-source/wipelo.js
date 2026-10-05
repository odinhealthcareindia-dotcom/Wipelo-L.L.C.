/* WIPELO — shared behavior: ticker, nav, cart drawer, reveal, faq, toast */
(function(){
  "use strict";

  /* ---------- announcement ticker ---------- */
  var msgs = document.querySelectorAll('.ticker-msg');
  if (msgs.length > 1) {
    var ti = 0;
    setInterval(function(){
      var prev = msgs[ti];
      prev.classList.remove('on');
      prev.classList.add('out');
      setTimeout(function(){ prev.classList.remove('out'); }, 520);
      ti = (ti + 1) % msgs.length;
      msgs[ti].classList.add('on');
    }, 4200);
  }

  /* ---------- nav scroll state ---------- */
  var nav = document.querySelector('.nav');
  var onScroll = function(){
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector('.burger');
  if (burger && nav) {
    var mnav = document.createElement('div');
    mnav.className = 'mnav';
    document.querySelectorAll('.nav-links a').forEach(function(a){
      mnav.appendChild(a.cloneNode(true));
    });
    nav.appendChild(mnav);
    burger.addEventListener('click', function(){ mnav.classList.toggle('open'); });
    mnav.addEventListener('click', function(e){ if (e.target.closest('a')) mnav.classList.remove('open'); });
  }

  /* ---------- reveal on scroll ----------
     scroll-driven rather than IntersectionObserver: identical behavior in
     every context. Elements in view at load appear instantly (no blank flash
     on anchor links / refresh); below-fold content animates in as it enters. */
  function viewH(){ return window.innerHeight || document.documentElement.clientHeight; }
  function revealCheck(instant){
    var vh = viewH();
    document.querySelectorAll('.rv:not(.in)').forEach(function(el){
      if (!vh) { el.classList.add('rv-now', 'in'); return; } /* sizeless context: show all */
      var r = el.getBoundingClientRect();
      if (r.top < vh - 30 && r.bottom > 0) {
        if (instant) el.classList.add('rv-now');
        el.classList.add('in');
      }
    });
  }
  /* stat count-up — runs once when a [data-count] numeral enters view */
  var noMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el){
    el.classList.add('counted');
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    if (noMotion) { el.textContent = target + suffix; return; }
    var t0 = null, DUR = 1100;
    function step(ts){
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / DUR);
      p = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
      el.textContent = Math.round(target * p) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function countCheck(){
    var vh = viewH();
    document.querySelectorAll('[data-count]:not(.counted)').forEach(function(el){
      if (!vh) { countUp(el); return; }
      var r = el.getBoundingClientRect();
      if (r.top < vh - 20 && r.bottom > 0) countUp(el);
    });
  }
  revealCheck(true); countCheck();
  var rvTick = false;
  window.addEventListener('scroll', function(){
    if (rvTick) return;
    rvTick = true;
    requestAnimationFrame(function(){ revealCheck(false); countCheck(); rvTick = false; });
  }, {passive:true});
  window.addEventListener('resize', function(){ revealCheck(false); countCheck(); });

  /* ---------- toast ---------- */
  var toastEl = document.querySelector('.toast');
  var toastT;
  window.wToast = function(msg){
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 2600);
  };

  /* ---------- cart ---------- */
  var FREE_SHIP = 35;
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('wipelo-cart-v3') || '[]'); } catch(e){ cart = []; }

  function save(){ localStorage.setItem('wipelo-cart-v3', JSON.stringify(cart)); }
  function subtotal(){ return cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0); }
  function count(){ return cart.reduce(function(s,i){ return s + i.qty; }, 0); }

  var drawer = document.querySelector('.drawer');
  var scrim = document.querySelector('.scrim');

  function openCart(){ if(drawer){ drawer.classList.add('on'); scrim.classList.add('on'); document.body.style.overflow='hidden'; } }
  function closeCart(){ if(drawer){ drawer.classList.remove('on'); scrim.classList.remove('on'); document.body.style.overflow=''; } }
  window.wOpenCart = openCart;

  function render(){
    document.querySelectorAll('.cart-count').forEach(function(el){ el.textContent = count(); });
    if (!drawer) return;

    var itemsEl = drawer.querySelector('.dr-items');
    if (cart.length === 0) {
      itemsEl.innerHTML = '<div class="dr-empty">Your cart is empty.<br>Your body has moments — we engineered for them.</div>';
    } else {
      itemsEl.innerHTML = cart.map(function(i, idx){
        return '<div class="dr-item">' +
          '<div class="di-pack" style="background:' + (i.ground || 'var(--teal)') + ';color:' + (i.groundText || '#fff') + '">' + i.short + '</div>' +
          '<div><div class="di-name">' + i.name + '</div>' +
          '<div class="di-meta">' + i.meta + '</div>' +
          '<div class="dr-qty">' +
            '<button data-dec="' + idx + '" aria-label="Decrease quantity">−</button>' +
            '<span>' + i.qty + '</span>' +
            '<button data-inc="' + idx + '" aria-label="Increase quantity">+</button>' +
          '</div></div>' +
          '<div class="di-price">$' + (i.price * i.qty).toFixed(2).replace(/\.00$/,'') + '</div>' +
        '</div>';
      }).join('');
    }

    var st = subtotal();
    var msgEl = drawer.querySelector('.ship-msg');
    var barEl = drawer.querySelector('.ship-bar i');
    if (msgEl && barEl) {
      if (st >= FREE_SHIP) {
        msgEl.innerHTML = '<b>Free shipping unlocked.</b> Sealed, packed, on its way in 12–24 hours.';
        barEl.style.width = '100%';
      } else if (st > 0) {
        msgEl.innerHTML = 'You&rsquo;re <b>$' + (FREE_SHIP - st).toFixed(2).replace(/\.00$/,'') + '</b> from free shipping.';
        barEl.style.width = Math.min(100, st / FREE_SHIP * 100) + '%';
      } else {
        msgEl.innerHTML = 'Free shipping on orders over <b>$' + FREE_SHIP + '</b>.';
        barEl.style.width = '0%';
      }
    }
    var totEl = drawer.querySelector('.dr-total b');
    if (totEl) totEl.textContent = '$' + st.toFixed(2).replace(/\.00$/,'');
    save();
  }

  window.wAdd = function(item){
    var found = cart.find(function(i){ return i.id === item.id; });
    if (found) found.qty += 1; else { item.qty = 1; cart.push(item); }
    render(); openCart();
  };

  document.addEventListener('click', function(e){
    var t = e.target;
    if (t.closest('.cart-btn')) { e.preventDefault(); render(); openCart(); }
    if (t.closest('.dr-close') || t === scrim) closeCart();
    var inc = t.closest('[data-inc]'); var dec = t.closest('[data-dec]');
    if (inc) { cart[+inc.dataset.inc].qty += 1; render(); }
    if (dec) {
      var i = +dec.dataset.dec;
      cart[i].qty -= 1;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      render();
    }
    var add = t.closest('[data-addon]');
    if (add) {
      var d = add.dataset;
      window.wAdd({id:d.addon, name:d.name, short:d.short, meta:d.meta, price:+d.price, ground:d.ground, groundText:d.groundtext});
    }
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeCart(); });

  render();

  /* ---------- newsletter fake submit ---------- */
  document.querySelectorAll('.nl-form').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      window.wToast('Welcome in. Messages, not newsletters.');
      f.reset();
    });
  });
})();

/* ============================================================
   THE LIVING SPEC — entrance veil, word-mask headlines,
   spec print-on, parallax, magnetic CTAs, nav choreography,
   the tearable sachet. Vanilla; reduced-motion & sizeless safe.
   ============================================================ */
(function(){
  "use strict";
  var vh0 = window.innerHeight || document.documentElement.clientHeight;
  var noMotion = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || !vh0;

  /* ---------- entrance veil (once per session) ---------- */
  if (!noMotion && !sessionStorage.getItem('wipelo-veil')) {
    sessionStorage.setItem('wipelo-veil', '1');
    var veil = document.createElement('div');
    veil.className = 'veil';
    veil.innerHTML = '<div class="v-mark">Wipelo</div><div class="v-cat">Functional Wet Wipes™</div><div class="v-bar"><i></i></div>';
    document.body.appendChild(veil);
    requestAnimationFrame(function(){ veil.classList.add('go'); });
    setTimeout(function(){ veil.classList.add('done'); }, 950);
    setTimeout(function(){ veil.remove(); }, 1700);
  }

  /* ---------- word-mask headline reveals ---------- */
  function splitWords(el){
    el.setAttribute('data-split', '');
    var delay = 0;
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(child){
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function(part){
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'w';
            var wi = document.createElement('span'); wi.className = 'wi';
            wi.textContent = part;
            wi.style.transitionDelay = Math.min(delay, 620) + 'ms';
            delay += 55;
            w.appendChild(wi); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR' && !child.classList.contains('w')) {
          walk(child);
        }
      });
    })(el);
  }
  if (!noMotion) {
    document.querySelectorAll('h1.h-display, h2.h-section, .beat h2').forEach(splitWords);
  }

  /* ---------- spec print-on stages ---------- */
  document.querySelectorAll('.spec-box, .hero-spec, .g-slide .spec').forEach(function(box){
    box.classList.add('specstage');
    box.querySelectorAll('.spec-row').forEach(function(r, i){
      r.style.transitionDelay = (i * 110) + 'ms';
    });
  });

  /* ---------- shared in-view driver (split heads + spec stages) ---------- */
  function vh(){ return window.innerHeight || document.documentElement.clientHeight; }
  function drive(){
    var h = vh();
    document.querySelectorAll('[data-split]:not(.in), .specstage:not(.in)').forEach(function(el){
      if (!h) { el.classList.add('in'); return; }
      var r = el.getBoundingClientRect();
      if (r.top < h - 30 && r.bottom > 0) el.classList.add('in');
    });
  }
  /* first drive is choreographed: two frames min so transitions fire;
     if the veil is up, hero headlines print as it lifts */
  var veilUp = !!document.querySelector('.veil');
  setTimeout(drive, veilUp ? 1000 : 80);
  window.addEventListener('scroll', drive, {passive:true});
  window.addEventListener('resize', drive);

  /* ---------- hero parallax (rides --plxy, composes with rotations) ---------- */
  var plx = [];
  [['.hero-comp .pack-lg', -0.045], ['.hero-comp .tin', -0.02], ['.hero-comp .sachet', -0.075], ['.hero-comp .hero-badge', -0.1]]
    .forEach(function(p){
      var el = document.querySelector(p[0]);
      if (el) plx.push([el, p[1]]);
    });
  if (!noMotion && plx.length) {
    var plxTick = false;
    window.addEventListener('scroll', function(){
      if (plxTick) return; plxTick = true;
      requestAnimationFrame(function(){
        var y = window.scrollY;
        if (y < vh() * 1.2) plx.forEach(function(p){
          p[0].style.setProperty('--plxy', (y * p[1]).toFixed(1) + 'px');
        });
        plxTick = false;
      });
    }, {passive:true});
  }

  /* ---------- magnetic CTAs ---------- */
  if (!noMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.btn').forEach(function(b){
      b.addEventListener('pointermove', function(e){
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.14;
        var dy = (e.clientY - r.top - r.height / 2) * 0.22;
        b.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + (dy - 2).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function(){ b.style.transform = ''; });
    });
  }

  /* ---------- nav: progress hairline + tuck on scroll-down ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var prog = document.createElement('span');
    prog.className = 'prog';
    nav.appendChild(prog);
    var lastY = window.scrollY;
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      var max = document.body.scrollHeight - vh();
      nav.style.setProperty('--prog', max > 0 ? Math.min(1, y / max) : 0);
      if (!noMotion) {
        if (y > 500 && y - lastY > 4) nav.classList.add('tucked');
        else if (lastY - y > 4 || y < 500) nav.classList.remove('tucked');
      }
      lastY = y;
    }, {passive:true});
  }

  /* ---------- the tearable sachet ---------- */
  document.querySelectorAll('.sachet').forEach(function(s){
    s.classList.add('enhanced');
    ['s-cloth', 's-crimp'].forEach(function(c){
      var el = document.createElement('span'); el.className = c; s.appendChild(el);
    });
    var st = document.createElement('span');
    st.className = 's-status';
    st.textContent = 'Seal broken · 49 remain';
    s.appendChild(st);
    s.setAttribute('role', 'button');
    s.setAttribute('aria-label', 'Tear the seal');
    s.setAttribute('tabindex', '0');
  });
  function tear(s){ s.classList.toggle('torn'); }
  document.addEventListener('click', function(e){
    var s = e.target.closest('.sachet'); if (s) tear(s);
  });
  document.addEventListener('keydown', function(e){
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('sachet')) {
      e.preventDefault(); tear(e.target);
    }
  });
})();
