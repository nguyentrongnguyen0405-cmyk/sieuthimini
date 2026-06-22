window.MiniMart = window.MiniMart || {};

MiniMart.API = (function() {
  const BASE_URL = '/api/public';

  async function getProducts() {
    const res = await fetch(`${BASE_URL}/products`);
    return await res.json();
  }

  async function getCategories() {
    const res = await fetch(`${BASE_URL}/categories`);
    return await res.json();
  }

  async function placeOrder(payload) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  return { getProducts, getCategories, placeOrder };
})();
