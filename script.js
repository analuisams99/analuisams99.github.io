const cartSection = document.querySelector('ol');
const priceSave = document.querySelector('.total-price');

const localSave = () => {
  localStorage.setItem('chave', cartSection.innerHTML);
  localStorage.setItem('priceKey', priceSave.innerText);
};

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

const updateTotalPrice = (total) => {
  priceSave.innerText = total;
};

const addPrice = (price) => {
  let totalPriceSpan = priceSave.innerText;
  totalPriceSpan = Math.round((Number(totalPriceSpan) * 100) + (price * 100)) / 100;
  updateTotalPrice(totalPriceSpan);
};

const removePrice = (price) => {
  let totalPriceSpan = priceSave.innerText;
  totalPriceSpan = Math.round((Number(totalPriceSpan) * 100) - (price * 100)) / 100;
  updateTotalPrice(totalPriceSpan);
};

function cartItemClickListener(event) {
  const cartItem = event.target;
  cartItem.parentElement.removeChild(cartItem);
  const priceItemString = cartItem.innerText.split('$')[1];
  const priceItemNumber = parseFloat(priceItemString);
  removePrice(priceItemNumber);
  localSave();
}

function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

const createProductList = async () => {
  const responseRaw = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador');
  const responseJson = await responseRaw.json();
  responseJson.results.forEach((element) => {
    const { id, title, thumbnail } = element;
    const item = createProductItemElement({ sku: id, name: title, image: thumbnail });
    const itemsList = document.querySelector('.items');
    itemsList.appendChild(item);
  });
};

const addProductToShoppingCart = async () => {
  const buttons = document.querySelectorAll('.item__add');
  buttons.forEach((element) => {
    element.addEventListener('click', async (event) => {
      const itemId = getSkuFromProductItem(event.target.parentElement);
      const responseRaw = await fetch(`https://api.mercadolibre.com/items/${itemId}`);
      const responseJson = await responseRaw.json();
      const liProduct = createCartItemElement(responseJson);
      const cartItems = document.querySelector('.cart__items');
      cartItems.appendChild(liProduct);
      addPrice(responseJson.price);
      localSave();
    });
  });
};

const emptyCart = () => {
  const buttonEmpty = document.querySelector('.empty-cart');
  buttonEmpty.addEventListener('click', () => {
    cartSection.innerHTML = '';
    let emptyPrice = priceSave.innerHTML;
    emptyPrice = 0;
    updateTotalPrice(emptyPrice);
    localSave();
  });
};

const getLocal = () => {
  cartSection.innerHTML = localStorage.getItem('chave');
  const cartItem2 = document.querySelectorAll('.cart__item');
  cartItem2.forEach((element) => {
    element.addEventListener('click', cartItemClickListener);
  });
  priceSave.innerHTML = localStorage.getItem('priceKey');
};

window.onload = async () => {
  await createProductList();
  await addProductToShoppingCart();
  getLocal();
  emptyCart();
};
