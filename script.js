let cart = [];

const products = [
  {
    name: 'Earth Tones',
    price: 299,
    image: 'assets/bracelet1.jpg'
  },
  {
    name: 'Ocean Breeze',
    price: 349,
    image: 'assets/bracelet2.jpg'
  },
  {
    name: 'Rose Quartz',
    price: 399,
    image: 'assets/bracelet3.jpg'
  }
];

window.onload = () => {
  const productList = document.getElementById('productList');
  if (productList) {
    products.forEach(p => {
      productList.innerHTML += `
        <div class="product-card">
          <img src="${p.image}" alt="${p.name}" />
          <h3>${p.name}</h3>
          <p>₱${p.price}</p>
          <button onclick="addToCart('${p.name}')">Add to Cart</button>
        </div>
      `;
    });
  }
};

// Cart functions
function addToCart(productName) {
  cart.push(productName);
  document.getElementById('cart-count').textContent = cart.length;
  updateCartPopup();
}

function updateCartPopup() {
  const cartItems = document.getElementById('cart-items');
  if (cartItems) {
    cartItems.innerHTML = "";
    cart.forEach((item, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${item}`;
      cartItems.appendChild(li);
    });
  }
}

function toggleCart() {
  const cartPopup = document.getElementById('cart');
  if (cartPopup) {
    cartPopup.style.display = cartPopup.style.display === 'block' ? 'none' : 'block';
  }
}

function checkout() {
  alert("Thank you for your purchase!\nItems: " + cart.join(", "));
  cart = [];
  document.getElementById("cart-count").textContent = "0";
  updateCartPopup();
  toggleCart();
}

// Scroll tab highlighting
const sections = document.querySelectorAll('section, header');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (pageYOffset >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});
