const catalogEl = document.getElementById('catalog');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const categoryTabsEl = document.getElementById('categoryTabs');
const itemCountEl = document.getElementById('itemCount');
const wishlistCountEl = document.getElementById('wishlistCount');
const wishlistListEl = document.getElementById('wishlistList');
const checkoutPanelEl = document.getElementById('checkoutPanel');
const checkoutSummaryEl = document.getElementById('checkoutSummary');
const checkoutBtnEl = document.getElementById('checkoutBtn');
const clearCartBtnEl = document.getElementById('clearCartBtn');
const cancelCheckoutBtnEl = document.getElementById('cancelCheckoutBtn');
const placeOrderBtnEl = document.getElementById('placeOrderBtn');
const ordersListEl = document.getElementById('ordersList');
const clearOrdersBtnEl = document.getElementById('clearOrdersBtn');

let items = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
let soldItems = JSON.parse(localStorage.getItem('soldItems') || '[]');
let longPressTimer = null;
let longPressTriggered = false;

function saveWishlist() {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function saveOrders() {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function clearOrders() {
  orders = [];
  saveOrders();
  render();
}

function saveSoldItems() {
  localStorage.setItem('soldItems', JSON.stringify(soldItems));
}

function formatMoney(value) {
  return `NT$ ${value.toLocaleString('zh-TW')}`;
}

function zeroPad(value, length = 4) {
  return String(value).padStart(length, '0');
}

function getImageUrl(item) {
  const hasCustomImage = item.image && !item.image.includes('placeholder');
  if (hasCustomImage) {
    return item.image;
  }

  const idString = zeroPad(item.id);
  return `./assets/${idString}.jpg`;
}

function getWishlistItems() {
  return wishlist
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean);
}

function calculateTotal(itemsList) {
  const subtotal = itemsList.reduce((sum, item) => {
    const numericValue = Number(String(item.price).replace(/[^\d]/g, ''));
    return sum + numericValue;
  }, 0);

  return {
    subtotal,
    total: subtotal,
  };
}

function toggleWishlist(itemId) {
  if (wishlist.includes(itemId)) {
    wishlist = wishlist.filter((id) => id !== itemId);
  } else {
    wishlist.push(itemId);
  }
  saveWishlist();
  render();
}

function removeFromWishlist(itemId) {
  wishlist = wishlist.filter((id) => id !== itemId);
  saveWishlist();
  render();
}

function toggleSoldItem(itemId) {
  if (soldItems.includes(itemId)) {
    soldItems = soldItems.filter((id) => id !== itemId);
  } else {
    soldItems.push(itemId);
  }
  saveSoldItems();
  render();
}

function handleSoldTagPointerDown(event) {
  const tag = event.target.closest('[data-sold-tag]');
  if (!tag) return;

  longPressTriggered = false;
  longPressTimer = window.setTimeout(() => {
    longPressTriggered = true;
    toggleSoldItem(tag.dataset.soldTag);
  }, 400);
}

function handleSoldTagPointerUp() {
  if (longPressTimer) {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function showCheckout() {
  checkoutPanelEl.classList.remove('hidden');
  renderCheckoutSummary();
}

function hideCheckout() {
  checkoutPanelEl.classList.add('hidden');
}

function clearCart() {
  wishlist = [];
  saveWishlist();
  hideCheckout();
  render();
}

function placeOrder() {
  const selectedItems = getWishlistItems();
  if (selectedItems.length === 0) {
    return;
  }

  const { subtotal, total } = calculateTotal(selectedItems);
  const order = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toLocaleString('zh-TW'),
    items: selectedItems.map((item) => ({
      name: item.name,
      price: item.price,
      category: item.category,
    })),
    subtotal,
    total,
  };

  orders.unshift(order);
  saveOrders();
  wishlist = [];
  saveWishlist();
  hideCheckout();
  render();
}

function getFilteredItems() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  return items.filter((item) => {
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.note.toLowerCase().includes(query);

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });
}

function renderCategoryTabs() {
  if (!categoryTabsEl) return;

  const categories = [...new Set(items.map((item) => item.category))];
  const tabs = ['all', ...categories];

  categoryTabsEl.innerHTML = tabs
    .map((value) => {
      const label = value === 'all' ? '全部' : value;
      const active = categoryFilter.value === value;
      return `<button type="button" class="tab-btn ${active ? 'active' : ''}" data-value="${value}">${label}</button>`;
    })
    .join('');
}

function renderWishlist() {
  const selectedItems = getWishlistItems();
  wishlistCountEl.textContent = selectedItems.length;

  if (selectedItems.length === 0) {
    wishlistListEl.innerHTML = '<div>目前沒有選擇的衣服</div>';
    return;
  }

  wishlistListEl.innerHTML = selectedItems
    .map((item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <div>${item.price}</div>
        </div>
        <button type="button" data-remove-id="${item.id}">移除</button>
      </div>
    `)
    .join('');
}

function renderCheckoutSummary() {
  const selectedItems = getWishlistItems();
  if (selectedItems.length === 0) {
    checkoutSummaryEl.innerHTML = '<div class="empty">請先加入你想買的衣服</div>';
    placeOrderBtnEl.disabled = true;
    return;
  }

  const { subtotal, total } = calculateTotal(selectedItems);
  checkoutSummaryEl.innerHTML = `
    <div class="checkout-row"><span>商品數量</span><strong>${selectedItems.length} 件</strong></div>
    ${selectedItems
      .map(
        (item) => `<div class="checkout-row"><span>${item.name}</span><strong>${item.price}</strong></div>`
      )
      .join('')}
    <div class="checkout-row total"><span>總金額</span><strong>${formatMoney(total)}</strong></div>
  `;
  placeOrderBtnEl.disabled = false;
}

function renderOrders() {
  if (orders.length === 0) {
    ordersListEl.innerHTML = '<div class="empty">尚無訂單紀錄</div>';
    return;
  }

  ordersListEl.innerHTML = orders
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-meta">
            <strong>${order.id}</strong>
            <span>${order.createdAt}</span>
          </div>
          <div>${order.items.map((item) => item.name).join('、')}</div>
          <div class="checkout-row"><span>總金額</span><strong>${formatMoney(order.total)}</strong></div>
        </article>
      `
    )
    .join('');
}

function renderCatalog() {
  const filteredItems = getFilteredItems();
  itemCountEl.textContent = filteredItems.length;

  if (filteredItems.length === 0) {
    catalogEl.innerHTML = '<div class="empty">沒有符合條件的衣服，試試改一下搜尋或分類。</div>';
    return;
  }

  catalogEl.innerHTML = filteredItems
    .map((item) => {
      const liked = wishlist.includes(item.id);
      const sold = soldItems.includes(item.id);
      return `
        <article class="card">
          <img src="${getImageUrl(item)}" alt="${item.name}" onerror="this.src='./assets/placeholder.svg'; this.onerror=null" />
          <div class="card-body">
            <div class="card-top">
              <span class="badge">${item.category}</span>
              <button type="button" class="sold-tag ${sold ? 'sold' : ''}" data-sold-tag="${item.id}">
                ${sold ? '已售出' : '標記售出'}
              </button>
            </div>
            <div class="card-meta">
              <span class="price">${item.price}</span>
            </div>
            <h3>${item.name}</h3>
            <p class="note">${item.note}</p>
            <div class="card-actions">
              <button class="btn-primary ${liked ? 'active' : ''}" data-id="${item.id}">
                ${liked ? '已加入購物車' : '加入購物車'}
              </button>

            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function render() {
  renderCategoryTabs();
  renderWishlist();
  renderCheckoutSummary();
  renderOrders();
  renderCatalog();
}

async function init() {
  const response = await fetch('./data.json');
  items = await response.json();

  const categories = [...new Set(items.map((item) => item.category))];
  categoryFilter.innerHTML = '<option value="all">全部</option>' + categories.map((category) => `<option value="${category}">${category}</option>`).join('');

  searchInput.addEventListener('input', render);
  categoryFilter.addEventListener('change', render);

  categoryTabsEl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    categoryFilter.value = button.dataset.value;
    render();
  });

  catalogEl.addEventListener('pointerdown', handleSoldTagPointerDown);
  catalogEl.addEventListener('pointerup', handleSoldTagPointerUp);
  catalogEl.addEventListener('pointerleave', handleSoldTagPointerUp);
  catalogEl.addEventListener('pointercancel', handleSoldTagPointerUp);

  catalogEl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-id]');
    if (button) {
      toggleWishlist(button.dataset.id);
      return;
    }

    const soldTag = event.target.closest('[data-sold-tag]');
    if (!soldTag) return;
    if (longPressTriggered) {
      longPressTriggered = false;
      return;
    }
    toggleSoldItem(soldTag.dataset.soldTag);
  });

  wishlistListEl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-remove-id]');
    if (!button) return;
    removeFromWishlist(button.dataset.removeId);
  });

  checkoutBtnEl.addEventListener('click', showCheckout);
  clearCartBtnEl.addEventListener('click', clearCart);
  cancelCheckoutBtnEl.addEventListener('click', hideCheckout);
  placeOrderBtnEl.addEventListener('click', placeOrder);
  clearOrdersBtnEl.addEventListener('click', () => {
    if (confirm('確定要刪除所有訂單紀錄嗎？此動作無法復原。')) {
      clearOrders();
    }
  });

  render();
}

init().catch((error) => {
  catalogEl.innerHTML = '<div class="empty">載入資料時發生錯誤，請確認 data.json 存在。</div>';
  console.error(error);
});
