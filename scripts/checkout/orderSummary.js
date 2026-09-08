import { cart, removeItem, updateQuantity, updateDeliveryOption, calculateCartQuantity } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';
import { formatCurrency } from '../utils/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { renderPaymentSummary } from './paymentSummary.js';

export function renderOrderSummary() {
  const orderSummaryContainer = document.querySelector('.js-order-summary');
  if (!orderSummaryContainer) return;

  const totalItemQuantity = calculateCartQuantity();
  const checkoutHeaderEl = document.querySelector('.js-checkout-items');
  if (checkoutHeaderEl) {
    checkoutHeaderEl.innerHTML = `${totalItemQuantity}`;
  }

  if (cart.length === 0) {
    orderSummaryContainer.innerHTML = `
      <div style="padding: 20px; font-size: 18px;">
        Your cart is empty.
        <div style="margin-top: 15px;">
          <a href="amazon.html" class="button-primary" style="display:inline-block; padding: 8px 16px; text-decoration: none; border-radius: 8px;">
            View products
          </a>
        </div>
      </div>
    `;
    renderPaymentSummary();
    return;
  }

  let checkouthtml = '';

  cart.forEach((checkoutItem) => {
    const productId = checkoutItem.productId;
    const matchingProduct = getProduct(productId);

    if (!matchingProduct) {
      console.warn(`Product not found for id: ${productId}`);
      return;
    }

    const deliveryOptionId = checkoutItem.deliveryOptionId || '1';
    const deliveryOption = getDeliveryOption(deliveryOptionId);

    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');

    checkouthtml += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">
          Delivery date: ${dateString}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              $${formatCurrency(matchingProduct.priceCents)}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${checkoutItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
                Update
              </span>
              <input class="quantity-input js-quantity-input js-quantity-input-${matchingProduct.id}" data-product-id="${matchingProduct.id}" type="number" min="1" max="99" value="${checkoutItem.quantity}" style="display: none; width: 45px; margin-left: 5px; padding: 2px 4px;">
              <span class="save-quantity-link link-primary js-save-link js-save-link-${matchingProduct.id}" data-product-id="${matchingProduct.id}" style="display: none; margin-left: 5px;">
                Save
              </span>
              <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deliveryOptionsHtml(matchingProduct, checkoutItem)}
          </div>
        </div>
      </div>
    `;
  });

  function deliveryOptionsHtml(matchingProduct, checkoutItem) {
    let html = '';
    deliveryOptions.forEach((deliveryOption) => {
      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
      const dateString = deliveryDate.format('dddd, MMMM D');
      const priceString = deliveryOption.priceCents === 0 ? 'FREE' : `$${formatCurrency(deliveryOption.priceCents)} -`;
      const isChecked = deliveryOption.id === checkoutItem.deliveryOptionId;

      html += `
        <div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}" data-delivery-option-id="${deliveryOption.id}">
          <input type="radio"
            ${isChecked ? 'checked' : ''}
            class="delivery-option-input"
            name="delivery-option-${matchingProduct.id}">
          <div>
            <div class="delivery-option-date">
              ${dateString}
            </div>
            <div class="delivery-option-price">
              ${priceString} Shipping
            </div>
          </div>
        </div>
      `;
    });
    return html;
  }

  orderSummaryContainer.innerHTML = checkouthtml;

  // Delete event listener
  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removeItem(productId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  // Delivery option selection event listener
  document.querySelectorAll('.js-delivery-option').forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  // Quantity update functionality
  function enterEditMode(productId) {
    const label = document.querySelector(`.js-quantity-label-${productId}`);
    const updateLink = document.querySelector(`.js-update-link[data-product-id="${productId}"]`);
    const input = document.querySelector(`.js-quantity-input-${productId}`);
    const saveLink = document.querySelector(`.js-save-link-${productId}`);

    if (label && updateLink && input && saveLink) {
      label.parentElement.style.display = 'none';
      updateLink.style.display = 'none';
      input.style.display = 'inline-block';
      saveLink.style.display = 'inline-block';
      input.focus();
      input.select();
    }
  }

  function saveQuantity(productId) {
    const input = document.querySelector(`.js-quantity-input-${productId}`);
    if (!input) return;

    const newQuantity = Number(input.value);
    if (newQuantity > 0 && newQuantity < 1000) {
      updateQuantity(productId, newQuantity);
      renderOrderSummary();
      renderPaymentSummary();
    } else {
      alert('Quantity must be at least 1 and less than 1000');
    }
  }

  document.querySelectorAll('.js-update-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      enterEditMode(productId);
    });
  });

  document.querySelectorAll('.quantity-label').forEach((label) => {
    label.addEventListener('click', () => {
      const parentContainer = label.closest('.cart-item-container');
      const deleteLink = parentContainer ? parentContainer.querySelector('.js-delete-link') : null;
      if (deleteLink && deleteLink.dataset.productId) {
        enterEditMode(deleteLink.dataset.productId);
      }
    });
  });

  document.querySelectorAll('.js-save-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      saveQuantity(productId);
    });
  });

  document.querySelectorAll('.js-quantity-input').forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const productId = input.dataset.productId;
        saveQuantity(productId);
      }
    });
  });
}
