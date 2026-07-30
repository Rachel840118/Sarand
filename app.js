(() => {
  'use strict';

  const PRODUCTS = [
    {
      id: 'diamond-smile',
      collection: 'SARAND T',
      name: 'Diamond Smile Pendant',
      price: 2850000,
      description: '18K 골드 위에 다이아몬드의 부드러운 곡선을 더한, 매일의 빛을 위한 펜던트입니다.',
      details: ['18K yellow gold', 'Round brilliant diamonds', 'Adjustable 40–45 cm chain'],
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLszhqoZxjlXvO_qBp3zGJG3NPF-4J8SqDlfXGa2otSphHd52M9G5mkbnk9ZBdzlP0_xxH_FpM3FSF4IO6iXOPSJTQB2idsIp9KAUFxOJPjPOvIKxoZscz7Q2Rf8FxvwZLkAe5K2Nw6LErV5hF9LHjcUDyhbmv4VXU7ixiNXh3-clT6eEUekWiMENzX6WzXMU_6gJGWDoI6ShQEB1URFJVbvJo-Pubc7OQRUM3qZpIc3yMNDahUDo-c8XQ'
    },
    {
      id: 'narrow-diamond-ring',
      collection: 'SARAND T1',
      name: 'Narrow Diamond Ring',
      price: 1900000,
      description: '정제된 밴드 라인과 섬세한 다이아몬드 세팅이 조화를 이루는 레이어링 링입니다.',
      details: ['18K yellow gold', 'Pavé-set diamonds', 'Sizes 5–18 available'],
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLuC9HIHI2Uq39aT_NAJCxd4xNJnN6e19tZ_zl62S1nCJVi930iu1J-0lH0g8YOT1opuc1-Ulm2lJXy1Uu5MQalWStQg_LKstMmNhri_hBPEGoJWTMOY-gTAtK55yxkDhnKW1oe6-fIncJC9ADrE4ZZftLXrBCCf5PwW5DjwbUA0qzuhROMeR7ds2Sn6JKW4rILjl8tLpNMHlB1DENVqf9rAfkamFe5Qx76RHtLPbJ-lhCsfhby9i9ZnIA'
    },
    {
      id: 'vine-pendant',
      collection: 'SARAND Victoria',
      name: 'Vine Pendant',
      price: 5400000,
      description: '유기적인 덩굴의 선을 다이아몬드로 표현한, 기념일을 위한 하이 주얼리 펜던트입니다.',
      details: ['18K rose gold', 'Diamond pavé setting', 'Made to order: 3–4 weeks'],
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLswy30ZmJye5WdZyBDN2h05uW2PCDNRiL_xLEdVDMXqL9t7jf-1hX-EB6-YcroPfjTMyOJh7Cdh5GHzFsLhT-6V-n9eVE563PY2gq89IZinteVxB6b3Y8PX7sLdW1MoSfaxMhGBO5PN3K6-AR2cUSSDzY6rJf7vwk8u91frDJKPxGCrLq3e2VXUCgzrN0KwYY3odYWF3DrunRzZWWWBFmqhltCbof5Mxn2e5YkzRoFQ-ZSghxBf98TuLg'
    }
  ];

  const productById = Object.fromEntries(PRODUCTS.map((product) => [product.id, product]));
  const CART_KEY = 'sarand-cart-v1';
  const ORDER_KEY = 'sarand-last-order-v1';
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
  const price = (amount) => new Intl.NumberFormat('ko-KR', {
    style: 'currency', currency: 'KRW', maximumFractionDigits: 0
  }).format(amount);
  const readLocal = (key, fallback) => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const writeLocal = (key, value) => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* local mode fallback */ }
  };

  let cart = readLocal(CART_KEY, {});
  let activeView = null;
  let restoreFocusTo = null;
  let toastTimer = null;

  document.body.insertAdjacentHTML('beforeend', `
    <div aria-hidden="true" class="app-overlay" id="app-overlay"></div>

    <aside aria-hidden="true" aria-label="장바구니" aria-modal="true" class="store-panel store-panel--right p-6 sm:p-8 flex flex-col" id="cart-panel" role="dialog" tabindex="-1">
      <div class="flex items-center justify-between border-b border-outline-variant pb-5">
        <div>
          <p class="font-label-sm uppercase tracking-[.18em] brand-primary-text">Your selection</p>
          <h2 class="font-headline-sm text-on-surface mt-1">Shopping Bag</h2>
        </div>
        <button aria-label="장바구니 닫기" class="icon-button" data-close type="button"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div aria-live="polite" class="flex-1 overflow-y-auto py-5" id="cart-items"></div>
      <div class="border-t border-outline-variant pt-5 space-y-5">
        <div class="flex justify-between font-label-md tracking-wide"><span>SUBTOTAL</span><span id="cart-total">₩0</span></div>
        <p class="text-[11px] leading-5 text-on-surface-variant">배송비와 최종 세금은 상담 후 안내됩니다. 현재 주문은 결제 전 요청 단계입니다.</p>
        <button class="w-full brand-primary-bg text-white py-4 font-label-md uppercase tracking-[.16em]" data-action="open-checkout" type="button">Request Order</button>
        <button class="w-full border border-on-surface py-4 font-label-md uppercase tracking-[.16em]" data-close type="button">Continue Shopping</button>
      </div>
    </aside>

    <section aria-hidden="true" aria-modal="true" class="store-modal" id="search-modal" role="dialog" tabindex="-1">
      <div class="store-modal__card p-6 sm:p-10">
        <div class="flex justify-between gap-6 border-b border-outline-variant pb-5">
          <div><p class="font-label-sm uppercase tracking-[.18em] brand-primary-text">Discover SARAND</p><h2 class="font-headline-sm mt-1">Search the collection</h2></div>
          <button aria-label="검색 닫기" class="icon-button" data-close type="button"><span class="material-symbols-outlined">close</span></button>
        </div>
        <label class="block mt-7">
          <span class="sr-only">상품 검색</span>
          <input autocomplete="off" class="w-full bg-transparent border-0 border-b border-on-surface py-3 px-0 text-xl focus:ring-0 focus:border-primary" id="search-input" placeholder="컬렉션 또는 상품명을 입력하세요" type="search"/>
        </label>
        <div class="mt-7 grid gap-3" id="search-results"></div>
      </div>
    </section>

    <section aria-hidden="true" aria-modal="true" class="store-modal" id="product-modal" role="dialog" tabindex="-1">
      <div class="store-modal__card" id="product-modal-content"></div>
    </section>

    <section aria-hidden="true" aria-modal="true" class="store-modal" id="info-modal" role="dialog" tabindex="-1">
      <div class="store-modal__card p-6 sm:p-10" id="info-modal-content"></div>
    </section>

    <section aria-hidden="true" aria-modal="true" class="store-modal" id="checkout-modal" role="dialog" tabindex="-1">
      <div class="store-modal__card p-6 sm:p-10">
        <div class="flex justify-between gap-6 border-b border-outline-variant pb-5">
          <div><p class="font-label-sm uppercase tracking-[.18em] brand-primary-text">Order request</p><h2 class="font-headline-sm mt-1">배송 정보</h2></div>
          <button aria-label="주문 요청 닫기" class="icon-button" data-close type="button"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="mt-6 p-4 bg-surface-container text-sm leading-6" id="checkout-summary"></div>
        <form class="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-5" id="checkout-form" novalidate>
          <label class="block"><span class="font-label-sm uppercase tracking-wider">Name</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="name" required type="text"/></label>
          <label class="block"><span class="font-label-sm uppercase tracking-wider">Phone</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="phone" required type="tel"/></label>
          <label class="block sm:col-span-2"><span class="font-label-sm uppercase tracking-wider">Email</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="email" required type="email"/></label>
          <label class="block"><span class="font-label-sm uppercase tracking-wider">Postal code</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="postalCode" required type="text"/></label>
          <label class="block"><span class="font-label-sm uppercase tracking-wider">City</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="city" required type="text"/></label>
          <label class="block sm:col-span-2"><span class="font-label-sm uppercase tracking-wider">Address</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="address" required type="text"/></label>
          <p class="sm:col-span-2 text-[11px] leading-5 text-on-surface-variant">제출하면 이 브라우저에 주문 요청이 기록됩니다. 실제 결제·재고 확정 기능은 운영용 주문 시스템을 연결한 뒤 활성화할 수 있습니다.</p>
          <button class="sm:col-span-2 brand-primary-bg text-white py-4 font-label-md uppercase tracking-[.16em]" type="submit">Submit Request</button>
        </form>
      </div>
    </section>

    <div aria-atomic="true" aria-live="polite" class="toast" id="toast" role="status"></div>
  `);

  const refs = {
    overlay: document.getElementById('app-overlay'),
    cartPanel: document.getElementById('cart-panel'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    cartCount: document.querySelector('[data-cart-count]'),
    searchModal: document.getElementById('search-modal'),
    searchInput: document.getElementById('search-input'),
    searchResults: document.getElementById('search-results'),
    productModal: document.getElementById('product-modal'),
    productContent: document.getElementById('product-modal-content'),
    infoModal: document.getElementById('info-modal'),
    infoContent: document.getElementById('info-modal-content'),
    checkoutModal: document.getElementById('checkout-modal'),
    checkoutSummary: document.getElementById('checkout-summary'),
    toast: document.getElementById('toast'),
    nav: document.getElementById('main-nav'),
    mobileMenu: document.getElementById('mobile-menu'),
    menuButton: document.querySelector('[data-action="toggle-menu"]')
  };

  const totalItems = () => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartLines = () => Object.entries(cart)
    .map(([id, quantity]) => ({ product: productById[id], quantity }))
    .filter(({ product, quantity }) => product && quantity > 0);
  const cartTotal = () => cartLines().reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  const persistCart = () => writeLocal(CART_KEY, cart);
  const notify = (message) => {
    window.clearTimeout(toastTimer);
    refs.toast.textContent = message;
    refs.toast.classList.add('is-open');
    toastTimer = window.setTimeout(() => refs.toast.classList.remove('is-open'), 3200);
  };

  const renderCart = () => {
    const lines = cartLines();
    const count = totalItems();
    refs.cartCount.hidden = count === 0;
    refs.cartCount.textContent = count;
    refs.cartTotal.textContent = price(cartTotal());

    if (!lines.length) {
      refs.cartItems.innerHTML = '<div class="h-full grid place-items-center text-center py-16"><div><span class="material-symbols-outlined text-4xl text-on-surface-variant">shopping_bag</span><p class="mt-4 font-headline-sm">Your bag is empty.</p><p class="mt-2 text-sm text-on-surface-variant">특별한 순간을 위한 피스를 골라보세요.</p></div></div>';
      return;
    }

    refs.cartItems.innerHTML = lines.map(({ product, quantity }) => `
      <article class="cart-item flex gap-4 py-5 first:pt-0">
        <img alt="${escapeHtml(product.name)}" class="h-24 w-20 object-contain bg-surface-container" src="${product.image}"/>
        <div class="min-w-0 flex-1">
          <div class="flex justify-between gap-3"><div><p class="font-label-sm uppercase tracking-wider text-on-surface-variant">${escapeHtml(product.collection)}</p><h3 class="mt-1 text-sm">${escapeHtml(product.name)}</h3></div><button aria-label="${escapeHtml(product.name)} 삭제" class="text-on-surface-variant hover:brand-primary-text" data-cart-remove="${product.id}" type="button"><span class="material-symbols-outlined text-lg">close</span></button></div>
          <div class="mt-3 flex items-center justify-between gap-3"><div class="cart-qty"><button aria-label="수량 감소" data-cart-change="-1" data-product-id="${product.id}" type="button">−</button><span>${quantity}</span><button aria-label="수량 증가" data-cart-change="1" data-product-id="${product.id}" type="button">+</button></div><span class="font-label-sm">${price(product.price * quantity)}</span></div>
        </div>
      </article>
    `).join('');
  };

  const setViewOpen = (view, trigger) => {
    if (activeView === view) return;
    if (activeView) closeActive(false);
    activeView = view;
    restoreFocusTo = trigger instanceof HTMLElement ? trigger : document.activeElement;
    refs.overlay.classList.add('is-open');
    document.body.classList.add('is-locked');
    view.classList.add('is-open');
    view.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => {
      const focusTarget = view.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      focusTarget?.focus();
    }, 30);
  };

  const closeActive = (restoreFocus = true) => {
    if (!activeView) return;
    activeView.classList.remove('is-open');
    activeView.setAttribute('aria-hidden', 'true');
    activeView = null;
    refs.overlay.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    if (restoreFocus && restoreFocusTo instanceof HTMLElement) restoreFocusTo.focus();
    restoreFocusTo = null;
  };

  const openSearch = (trigger) => {
    renderSearch('');
    setViewOpen(refs.searchModal, trigger);
    window.setTimeout(() => refs.searchInput.focus(), 40);
  };

  const renderSearch = (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    const results = PRODUCTS.filter((product) => [product.name, product.collection, product.description]
      .join(' ').toLowerCase().includes(normalizedQuery));
    refs.searchResults.innerHTML = results.length ? results.map((product) => `
      <button class="w-full text-left flex items-center gap-4 border-b border-outline-variant pb-3 hover:brand-primary-text" data-product-result="${product.id}" type="button">
        <img alt="" class="h-14 w-14 object-contain bg-surface-container" src="${product.image}"/>
        <span class="flex-1"><span class="block text-[10px] uppercase tracking-wider text-on-surface-variant">${escapeHtml(product.collection)}</span><span class="block mt-1 text-sm">${escapeHtml(product.name)}</span></span><span class="font-label-sm">${price(product.price)}</span>
      </button>
    `).join('') : '<p class="py-10 text-center text-sm text-on-surface-variant">일치하는 상품이 없습니다.</p>';
  };

  const productTemplate = (product) => `
    <div class="grid grid-cols-1 sm:grid-cols-2">
      <div class="bg-surface-container min-h-[300px] flex items-center justify-center p-10"><img alt="${escapeHtml(product.name)}" class="max-h-[390px] w-full object-contain" src="${product.image}"/></div>
      <div class="p-6 sm:p-9 flex flex-col">
        <div class="flex justify-between gap-4"><div><p class="font-label-sm uppercase tracking-[.16em] brand-primary-text">${escapeHtml(product.collection)}</p><h2 class="font-headline-sm mt-2">${escapeHtml(product.name)}</h2></div><button aria-label="상품 상세 닫기" class="icon-button -mt-2 -mr-2" data-close type="button"><span class="material-symbols-outlined">close</span></button></div>
        <p class="mt-5 font-label-md">${price(product.price)}</p>
        <p class="mt-6 text-sm leading-7 text-on-surface-variant">${escapeHtml(product.description)}</p>
        <ul class="mt-5 space-y-2 text-[11px] uppercase tracking-wider text-on-surface-variant">${product.details.map((detail) => `<li>— ${escapeHtml(detail)}</li>`).join('')}</ul>
        <div class="mt-auto pt-8 grid gap-3"><button class="brand-primary-bg text-white py-4 font-label-md uppercase tracking-[.16em]" data-add-product="${product.id}" type="button">Add to Bag</button><button class="border border-on-surface py-4 font-label-md uppercase tracking-[.16em]" data-action="open-consultation" type="button">Ask an Expert</button></div>
      </div>
    </div>
  `;

  const openProduct = (productId, trigger) => {
    const product = productById[productId];
    if (!product) return;
    refs.productContent.innerHTML = productTemplate(product);
    setViewOpen(refs.productModal, trigger);
  };

  const openInfo = (title, eyebrow, body, trigger) => {
    refs.infoContent.innerHTML = `
      <div class="flex justify-between gap-6 border-b border-outline-variant pb-5"><div><p class="font-label-sm uppercase tracking-[.18em] brand-primary-text">${escapeHtml(eyebrow)}</p><h2 class="font-headline-sm mt-1">${escapeHtml(title)}</h2></div><button aria-label="창 닫기" class="icon-button" data-close type="button"><span class="material-symbols-outlined">close</span></button></div>
      <div class="mt-7 text-sm leading-7 text-on-surface-variant">${body}</div>
    `;
    setViewOpen(refs.infoModal, trigger);
  };

  const openConsultation = (trigger) => {
    openInfo('Book a private consultation', 'SARAND Atelier', `
      <p>원하시는 피스와 날짜를 남겨 주세요. 이 데모에서는 정보가 현재 브라우저에만 저장됩니다.</p>
      <form class="mt-7 grid gap-5" id="consultation-form" novalidate>
        <label><span class="font-label-sm uppercase tracking-wider">Name</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="name" required type="text"/></label>
        <label><span class="font-label-sm uppercase tracking-wider">Email</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="email" required type="email"/></label>
        <label><span class="font-label-sm uppercase tracking-wider">Interest</span><select class="mt-2 w-full border-outline-variant bg-transparent" name="interest"><option>Engagement / Bridal</option><option>High Jewelry</option><option>Gift</option><option>Made to Order</option></select></label>
        <label><span class="font-label-sm uppercase tracking-wider">Message</span><textarea class="mt-2 w-full border-outline-variant bg-transparent" name="message" rows="3"></textarea></label>
        <button class="brand-primary-bg text-white py-4 font-label-md uppercase tracking-[.16em]" type="submit">Request Appointment</button>
      </form>
    `, trigger);
  };

  const openCheckout = (trigger) => {
    if (!cartLines().length) {
      notify('장바구니에 상품을 먼저 담아 주세요.');
      return;
    }
    refs.checkoutSummary.innerHTML = `<div class="flex justify-between gap-5"><span>${totalItems()} items</span><strong>${price(cartTotal())}</strong></div><p class="mt-2 text-[11px] text-on-surface-variant">${cartLines().map(({ product, quantity }) => `${escapeHtml(product.name)} × ${quantity}`).join(' · ')}</p>`;
    setViewOpen(refs.checkoutModal, trigger);
  };

  const openAccount = (trigger) => {
    const profile = readLocal('sarand-profile-v1', {});
    openInfo('Your SARAND profile', 'Private client', `
      <p>관심 컬렉션과 주문 요청을 이 기기에서 편하게 확인할 수 있습니다.</p>
      <form class="mt-7 grid gap-5" id="profile-form" novalidate>
        <label><span class="font-label-sm uppercase tracking-wider">Name</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="name" value="${escapeHtml(profile.name || '')}" required type="text"/></label>
        <label><span class="font-label-sm uppercase tracking-wider">Email</span><input class="mt-2 w-full border-outline-variant bg-transparent" name="email" value="${escapeHtml(profile.email || '')}" required type="email"/></label>
        <button class="brand-primary-bg text-white py-4 font-label-md uppercase tracking-[.16em]" type="submit">Save Profile</button>
      </form>
    `, trigger);
  };

  const setCartQuantity = (productId, quantity) => {
    if (!productById[productId]) return;
    if (quantity <= 0) delete cart[productId];
    else cart[productId] = quantity;
    persistCart();
    renderCart();
  };

  const addToCart = (productId) => {
    if (!productById[productId]) return;
    setCartQuantity(productId, (cart[productId] || 0) + 1);
    notify('장바구니에 담았습니다.');
  };

  const toggleMobileMenu = () => {
    const isOpen = refs.mobileMenu.classList.toggle('is-open');
    refs.menuButton.setAttribute('aria-expanded', String(isOpen));
    refs.menuButton.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    refs.menuButton.querySelector('span').textContent = isOpen ? 'close' : 'menu';
  };

  const showCollection = (collection, trigger) => {
    const copy = collection === 'Knot'
      ? '매듭에서 영감을 얻은 부드러운 연결의 선. 사랑과 약속을 기념하는 SARAND의 시그니처입니다.'
      : '도시적인 체인 링크와 단단한 금속의 구조를 바탕으로 한, 대담하고 모던한 실루엣입니다.';
    const productId = collection === 'Knot' ? 'diamond-smile' : 'narrow-diamond-ring';
    openInfo(`SARAND ${collection}`, 'Iconic collection', `<p>${copy}</p><button class="mt-7 brand-primary-bg text-white px-8 py-4 font-label-md uppercase tracking-[.16em]" data-product-result="${productId}" type="button">View a Piece</button>`, trigger);
  };

  const submitNewsletter = (form) => {
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const email = form.querySelector('#newsletter-email').value.trim().toLowerCase();
    writeLocal('sarand-newsletter-v1', { email, subscribedAt: new Date().toISOString() });
    form.reset();
    notify('SARAND 뉴스레터 구독이 완료되었습니다.');
  };

  const submitConsultation = (form) => {
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    writeLocal('sarand-consultation-v1', { ...data, requestedAt: new Date().toISOString() });
    closeActive();
    notify('상담 요청을 저장했습니다. 곧 연결할 수 있습니다.');
  };

  const submitProfile = (form) => {
    if (!form.checkValidity()) { form.reportValidity(); return; }
    writeLocal('sarand-profile-v1', Object.fromEntries(new FormData(form).entries()));
    closeActive();
    notify('프로필을 저장했습니다.');
  };

  const submitCheckout = (form) => {
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const orderId = `SRD-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(Date.now()).slice(-5)}`;
    const customer = Object.fromEntries(new FormData(form).entries());
    writeLocal(ORDER_KEY, { id: orderId, customer, items: cartLines(), total: cartTotal(), requestedAt: new Date().toISOString() });
    cart = {};
    persistCart();
    renderCart();
    closeActive();
    form.reset();
    notify(`주문 요청 ${orderId}을 저장했습니다.`);
  };

  const openTracking = (trigger) => {
    openInfo('Track your order', 'Order status', `
      <p>이 브라우저에서 만든 주문 요청 번호를 입력해 상태를 확인해 보세요.</p>
      <form class="mt-7 flex gap-3" id="tracking-form" novalidate><input aria-label="주문 번호" class="min-w-0 flex-1 border-outline-variant bg-transparent" name="orderId" placeholder="SRD-YYYYMMDD-00000" required type="text"/><button class="border border-on-surface px-5 font-label-sm uppercase tracking-wider" type="submit">Check</button></form><p aria-live="polite" class="mt-5 text-sm" id="tracking-result"></p>
    `, trigger);
  };

  document.addEventListener('click', (event) => {
    if (event.target === refs.overlay || event.target.closest('[data-close]')) {
      closeActive();
      return;
    }

    const quantityButton = event.target.closest('[data-cart-change]');
    if (quantityButton) {
      const productId = quantityButton.dataset.productId;
      setCartQuantity(productId, (cart[productId] || 0) + Number(quantityButton.dataset.cartChange));
      return;
    }
    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) {
      setCartQuantity(removeButton.dataset.cartRemove, 0);
      return;
    }
    const addButton = event.target.closest('[data-add-product]');
    if (addButton) {
      addToCart(addButton.dataset.addProduct);
      return;
    }
    const productResult = event.target.closest('[data-product-result]');
    if (productResult) {
      openProduct(productResult.dataset.productResult, productResult);
      return;
    }

    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
      const { action } = actionElement.dataset;
      if (action === 'open-search') openSearch(actionElement);
      if (action === 'open-account') openAccount(actionElement);
      if (action === 'open-cart') { renderCart(); setViewOpen(refs.cartPanel, actionElement); }
      if (action === 'toggle-menu') toggleMobileMenu();
      if (action === 'scroll-shop') document.getElementById('shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (action === 'quick-shop') openProduct(actionElement.dataset.productId, actionElement);
      if (action === 'show-collection') showCollection(actionElement.dataset.collection, actionElement);
      if (action === 'open-consultation') openConsultation(actionElement);
      if (action === 'open-story') openInfo('A form of enduring love', 'World of SARAND', '<p>SARAND는 연결의 순간을 주얼리로 번역합니다. 오래 보아도 균형 잡힌 비례, 손끝에서 느껴지는 편안함, 매일 함께할 수 있는 견고함을 추구합니다.</p><p class="mt-5">모든 피스는 책임 있는 소재 선택과 오래 쓸 수 있는 구조를 기준으로 디자인됩니다.</p>', actionElement);
      if (action === 'open-contact') openInfo('Contact SARAND', 'Client care', '<p>상품·배송·관리 방법에 대한 문의를 남겨 주세요. 운영용 사이트에서는 이 화면을 고객센터 또는 이메일 서비스와 연결하면 됩니다.</p><button class="mt-7 brand-primary-bg text-white px-8 py-4 font-label-md uppercase tracking-[.16em]" data-action="open-consultation" type="button">Send an Inquiry</button>', actionElement);
      if (action === 'open-tracking') openTracking(actionElement);
      if (action === 'open-care') openInfo('Jewelry care', 'After care', '<p>부드러운 천으로 가볍게 닦아 보관하고, 향수·염소계 세제·격한 운동 전에는 착용을 피해 주세요. 정기적인 전문 점검으로 세팅의 안전성을 오래 유지할 수 있습니다.</p>', actionElement);
      if (action === 'open-policy') openInfo('Privacy & legal', 'SARAND', '<p>이 데모는 입력 정보를 서버로 전송하지 않으며, 브라우저 저장소에서만 동작합니다. 실제 운영 전에는 개인정보 처리방침, 이용약관, 쿠키 고지 및 결제·환불 정책을 사업 정보에 맞게 검토해 연결해 주세요.</p>', actionElement);
      if (action === 'open-checkout') openCheckout(actionElement);
      if (action === 'coming-soon') notify('정식 채널을 준비 중입니다.');
      return;
    }

    const productCard = event.target.closest('[data-product-card]');
    if (productCard && !event.target.closest('button')) openProduct(productCard.dataset.productCard, productCard);
  });

  document.addEventListener('submit', (event) => {
    const { target } = event;
    if (!(target instanceof HTMLFormElement)) return;
    event.preventDefault();
    if (target.id === 'newsletter-form') submitNewsletter(target);
    if (target.id === 'consultation-form') submitConsultation(target);
    if (target.id === 'profile-form') submitProfile(target);
    if (target.id === 'checkout-form') submitCheckout(target);
    if (target.id === 'tracking-form') {
      const result = document.getElementById('tracking-result');
      const order = readLocal(ORDER_KEY, null);
      const requestedId = new FormData(target).get('orderId').trim().toUpperCase();
      if (!target.checkValidity()) { target.reportValidity(); return; }
      result.textContent = order && order.id === requestedId ? `요청이 확인되었습니다. 현재 상태: 상담 대기 (${new Date(order.requestedAt).toLocaleDateString('ko-KR')})` : '이 브라우저에서 찾을 수 없는 주문 번호입니다.';
    }
  });

  refs.searchInput.addEventListener('input', (event) => renderSearch(event.target.value));
  refs.mobileMenu.addEventListener('click', (event) => {
    if (event.target.closest('a') && refs.mobileMenu.classList.contains('is-open')) toggleMobileMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeActive();
      return;
    }
    if (event.key !== 'Tab' || !activeView) return;
    const focusable = [...activeView.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.closest('[aria-hidden="true"]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  window.addEventListener('scroll', () => {
    const heroImage = document.getElementById('hero-parallax');
    const compact = window.scrollY > 50;
    refs.nav.classList.toggle('py-4', compact);
    refs.nav.classList.toggle('py-6', !compact);
    const scrollPercent = window.scrollY / window.innerHeight;
    if (heroImage && scrollPercent <= 1) heroImage.style.transform = `translateY(${scrollPercent * 100}px)`;
  }, { passive: true });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('active'); });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  renderCart();
})();
