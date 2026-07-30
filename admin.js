(() => {
  const STORAGE = {
    products: 'sarand-admin-products-v1',
    orders: 'sarand-admin-orders-v1',
    settings: 'sarand-admin-settings-v1'
  };
  const STOREFRONT_ORDER_KEY = 'sarand-last-order-v1';

  const defaultProducts = [
    { id: 'p-diamond-smile', name: 'Diamond Smile Pendant', collection: 'SARAND T', price: 2850000, stock: 2, material: '18K Yellow Gold · Diamond' },
    { id: 'p-narrow-ring', name: 'Narrow Diamond Ring', collection: 'SARAND T1', price: 1900000, stock: 1, material: '18K Yellow Gold · Pavé Diamond' },
    { id: 'p-vine-pendant', name: 'Vine Pendant', collection: 'SARAND Victoria', price: 5400000, stock: 4, material: '18K Rose Gold · Diamond' },
    { id: 'p-knot-necklace', name: 'Knot of Promise', collection: 'SARAND Knot', price: 2150000, stock: 5, material: '18K Yellow Gold · Diamond' },
    { id: 'p-nocturne-drop', name: 'Nocturne Drop', collection: 'SARAND T1', price: 1960000, stock: 0, material: '18K White Gold · Black Diamond' }
  ];

  const defaultOrders = [
    { id: 'SRD-20260730-40312', client: '김**', product: 'Narrow Diamond Ring', collection: 'SARAND T1', amount: 1900000, date: '2026. 07. 30', status: 'ready' },
    { id: 'SRD-20260729-29081', client: '최**', product: 'Diamond Smile Pendant', collection: 'SARAND T', amount: 2850000, date: '2026. 07. 29', status: 'making' },
    { id: 'SRD-20260728-17420', client: '윤**', product: 'Vine Pendant', collection: 'SARAND Victoria', amount: 5400000, date: '2026. 07. 28', status: 'paid' },
    { id: 'SRD-20260727-02308', client: '박**', product: 'Knot of Promise', collection: 'SARAND Knot', amount: 2150000, date: '2026. 07. 27', status: 'completed' },
    { id: 'SRD-20260725-99107', client: '이**', product: 'Bespoke consultation', collection: 'Private atelier', amount: 400000, date: '2026. 07. 25', status: 'completed' }
  ];

  const clientConversations = [
    { initials: 'K', name: '김** 고객', detail: 'SARAND Victoria · 피팅 예약 확인', time: '10분 전' },
    { initials: 'C', name: '최** 고객', detail: 'Diamond Smile Pendant · 제작 일정 안내', time: '1시간 전' },
    { initials: 'Y', name: '윤** 고객', detail: 'Private appointment · 신규 문의', time: '어제' },
    { initials: 'P', name: '박** 고객', detail: 'Silent Orbit · 배송 완료', time: '7월 27일' }
  ];

  const statusLabels = { paid: '결제 완료', making: '제작 중', ready: '발송 준비', completed: '완료' };
  let products = load(STORAGE.products, defaultProducts);
  let orders = load(STORAGE.orders, defaultOrders);

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const money = (value) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
  const esc = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);

  function load(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : structuredClone(fallback);
    } catch (_) {
      return structuredClone(fallback);
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function syncLatestStorefrontOrder() {
    try {
      const stored = JSON.parse(localStorage.getItem(STOREFRONT_ORDER_KEY) || 'null');
      if (!stored?.id || orders.some((order) => order.id === stored.id)) return;
      const firstItem = stored.items?.[0]?.product;
      const name = stored.customer?.name?.trim();
      orders = [{
        id: stored.id,
        client: name ? `${name.slice(0, 1)}**` : '비공개 고객',
        product: stored.items?.map((item) => item.product?.name).filter(Boolean).join(', ') || '주문 요청',
        collection: firstItem?.collection || 'SARAND',
        amount: Number(stored.total) || 0,
        date: new Date(stored.requestedAt || Date.now()).toLocaleDateString('ko-KR').replaceAll('. ', '. ').replace(/\.$/, ''),
        status: 'paid'
      }, ...orders];
      save(STORAGE.orders, orders);
    } catch (_) { /* storefront order is optional */ }
  }

  function setDate() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    const dateEl = $('#todayDate');
    dateEl.textContent = formatter.format(now);
    dateEl.dateTime = now.toISOString().slice(0, 10);
  }

  function renderOverview() {
    const active = orders.filter((order) => order.status !== 'completed');
    const revenue = orders.filter((order) => order.status !== 'completed').reduce((sum, order) => sum + order.amount, 0);
    const inventory = products.reduce((sum, product) => sum + Number(product.stock), 0);
    $('#monthRevenue').textContent = money(revenue);
    $('#activeOrders').textContent = String(active.length).padStart(2, '0');
    $('#inventoryCount').textContent = String(inventory).padStart(2, '0');
    $('#orderNavCount').textContent = String(active.length);

    $('#recentOrders').innerHTML = orders.slice(0, 3).map((order) => `
      <div class="mini-order">
        <div><b>${esc(order.product)}</b><span>${esc(order.id)} · ${esc(order.client)}</span></div>
        <div class="order-right">${money(order.amount)}<span>${statusLabels[order.status]}</span></div>
      </div>`).join('');

    const lowStock = [...products].filter((product) => product.stock <= 2).sort((a, b) => a.stock - b.stock).slice(0, 3);
    $('#lowStockList').innerHTML = lowStock.length ? lowStock.map((product) => `
      <div class="stock-item">
        <div><b>${esc(product.name)}</b><span>${esc(product.material)}</span></div>
        <div class="stock-right ${product.stock <= 1 ? 'stock-alert' : ''}">${product.stock === 0 ? '품절' : `재고 ${product.stock}점`}</div>
      </div>`).join('') : '<p class="empty-state">확인이 필요한 재고가 없습니다.</p>';
  }

  function renderOrders() {
    const filter = $('#orderFilter').value;
    const visible = filter === 'all' ? orders : orders.filter((order) => order.status === filter);
    $('#ordersTable').innerHTML = visible.length ? visible.map((order) => `
      <tr>
        <td>${esc(order.id)}</td>
        <td>${esc(order.client)}</td>
        <td class="product-cell"><b>${esc(order.product)}</b><span>${esc(order.collection)}</span></td>
        <td>${money(order.amount)}</td>
        <td>${esc(order.date)}</td>
        <td><select class="order-status is-${esc(order.status)}" aria-label="${esc(order.id)} 주문 상태" data-order-id="${esc(order.id)}">
          ${Object.entries(statusLabels).map(([key, label]) => `<option value="${key}" ${order.status === key ? 'selected' : ''}>${label}</option>`).join('')}
        </select></td>
      </tr>`).join('') : '<tr><td colspan="6" class="empty-cell">조건에 맞는 주문이 없습니다.</td></tr>';

    $$('.order-status').forEach((select) => select.addEventListener('change', (event) => {
      const changed = orders.find((order) => order.id === event.target.dataset.orderId);
      if (!changed) return;
      changed.status = event.target.value;
      save(STORAGE.orders, orders);
      renderOrders();
      renderOverview();
      toast(`${changed.id} 주문 상태를 ${statusLabels[changed.status]}(으)로 변경했습니다.`);
    }));
  }

  function renderProducts() {
    $('#productGrid').innerHTML = products.map((product) => `
      <article class="product-card">
        <p class="product-collection">${esc(product.collection)}</p>
        <button class="product-menu" type="button" data-edit-product="${esc(product.id)}" aria-label="${esc(product.name)} 편집">···</button>
        <h3>${esc(product.name)}</h3>
        <p class="material">${esc(product.material)}</p>
        <div class="product-bottom"><span class="product-price">${money(product.price)}</span><span class="product-stock ${product.stock <= 1 ? 'low' : ''}">${product.stock === 0 ? '품절' : `재고 ${product.stock}점`}</span></div>
      </article>`).join('');
    $$('[data-edit-product]').forEach((button) => button.addEventListener('click', () => openProductDialog(button.dataset.editProduct)));
  }

  function renderClients() {
    $('#clientsList').innerHTML = clientConversations.map((client) => `
      <div class="client-row"><span class="client-avatar">${client.initials}</span><div><b>${client.name}</b><span>${client.detail}</span></div><time>${client.time}</time></div>`).join('');
  }

  function showView(target) {
    $$('.view').forEach((view) => {
      const active = view.id === target;
      view.classList.toggle('is-active', active);
      view.hidden = !active;
    });
    $$('.nav-item').forEach((button) => button.classList.toggle('is-active', button.dataset.viewTarget === target));
    const copy = {
      overview: ['Atelier overview', '좋은 오후입니다,<br><em>Jinhwa.</em>'],
      orders: ['Order desk', '주문 <em>관리</em>'],
      products: ['Collection catalogue', '상품 <em>관리</em>'],
      clients: ['Private clientele', '고객 <em>관리</em>'],
      settings: ['Maison settings', '브랜드 <em>설정</em>']
    }[target];
    $('#viewKicker').textContent = copy[0];
    $('#viewTitle').innerHTML = copy[1];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openProductDialog(productId = '') {
    const dialog = $('#productDialog');
    const product = products.find((item) => item.id === productId);
    $('#productDialogTitle').textContent = product ? '상품 편집' : '새 상품 등록';
    $('#productId').value = product?.id || '';
    $('#productName').value = product?.name || '';
    $('#productCollection').value = product?.collection || 'SARAND T';
    $('#productPrice').value = product?.price || '';
    $('#productStock').value = product?.stock ?? '';
    $('#productMaterial').value = product?.material || '';
    dialog.showModal();
    $('#productName').focus();
  }

  function closeProductDialog() { $('#productDialog').close(); }

  function handleProductSave(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = form.get('productId') || `p-${Date.now()}`;
    const product = {
      id,
      name: form.get('productName').trim(),
      collection: form.get('productCollection'),
      price: Number(form.get('productPrice')),
      stock: Number(form.get('productStock')),
      material: form.get('productMaterial').trim()
    };
    const previousIndex = products.findIndex((item) => item.id === id);
    if (previousIndex >= 0) products[previousIndex] = product;
    else products = [product, ...products];
    save(STORAGE.products, products);
    renderProducts();
    renderOverview();
    closeProductDialog();
    toast(previousIndex >= 0 ? '상품 정보를 업데이트했습니다.' : '새 상품을 컬렉션에 등록했습니다.');
  }

  function loadSettings() {
    const settings = load(STORAGE.settings, {});
    $('#brandName').value = settings.brandName || 'SARAND';
    $('#brandEmail').value = settings.brandEmail || 'atelier@sarand.kr';
    $('#appointmentNote').value = settings.appointmentNote || 'Private appointments in Seoul by reservation.';
  }

  function exportInventory() {
    const rows = [['상품명', '컬렉션', '가격', '재고', '소재'], ...products.map((product) => [product.name, product.collection, product.price, product.stock, product.material])];
    const csv = '\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = 'sarand-inventory.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    toast('현재 재고 목록을 CSV 파일로 준비했습니다.');
  }

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    clearTimeout(toastTimer);
    el.textContent = message;
    el.classList.add('is-visible');
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3200);
  }

  $$('.nav-item, [data-view-target]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.viewTarget)));
  $('#orderFilter').addEventListener('change', renderOrders);
  $('#openQuickAdd').addEventListener('click', () => openProductDialog());
  $('#openProductDialog').addEventListener('click', () => openProductDialog());
  $('#closeProductDialog').addEventListener('click', closeProductDialog);
  $('#cancelProductDialog').addEventListener('click', closeProductDialog);
  $('#productDialog').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeProductDialog(); });
  $('#productForm').addEventListener('submit', handleProductSave);
  $('#downloadInventory').addEventListener('click', exportInventory);
  $('#settingsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    save(STORAGE.settings, Object.fromEntries(new FormData(event.currentTarget)));
    toast('아틀리에 정보를 이 브라우저에 저장했습니다.');
  });
  $('#resetLocalData').addEventListener('click', () => {
    if (!window.confirm('등록한 상품, 주문 상태, 설정을 예시 데이터로 되돌릴까요?')) return;
    localStorage.removeItem(STORAGE.products);
    localStorage.removeItem(STORAGE.orders);
    localStorage.removeItem(STORAGE.settings);
    products = structuredClone(defaultProducts);
    orders = structuredClone(defaultOrders);
    loadSettings();
    renderProducts();
    renderOrders();
    renderOverview();
    toast('예시 데이터로 초기화했습니다.');
  });

  setDate();
  syncLatestStorefrontOrder();
  loadSettings();
  renderOverview();
  renderOrders();
  renderProducts();
  renderClients();
})();
