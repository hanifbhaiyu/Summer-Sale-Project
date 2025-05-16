// Cart product database and state
const cartItems = [];
const shippingOptions = [
  { id: 'free', name: 'Free Shipping', cost: 0 },
  { id: 'standard', name: 'Standard Shipping', cost: 5 },
  { id: 'express', name: 'Express Shipping', cost: 15 }
];
const coupons = [
  { code: 'SELL200', minAmount: 200, discountPercent: 20 },
  { code: 'SUMMER50', minAmount: 100, discountPercent: 10 }
];

// Cart state
let cartState = {
  items: [],
  shippingMethod: shippingOptions[0],
  couponCode: '',
  discount: 0
};

// Cart API
const cartAPI = {
  addItem: function(item) {
    const existingItem = cartState.items.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cartState.items.push({...item, quantity: 1});
    }
    
    this.updateCart();
  },
  
  removeItem: function(itemId) {
    cartState.items = cartState.items.filter(item => item.id !== itemId);
    this.updateCart();
  },
  
  updateQuantity: function(itemId, quantity) {
    const item = cartState.items.find(item => item.id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.updateCart();
    }
  },
  
  setShippingMethod: function(methodId) {
    const method = shippingOptions.find(option => option.id === methodId);
    if (method) {
      cartState.shippingMethod = method;
      this.updateCart();
    }
  },
  
  applyCoupon: function(code) {
    const coupon = coupons.find(c => c.code === code.toUpperCase());
    const subtotal = this.calculateSubtotal();
    
    if (coupon && subtotal >= coupon.minAmount) {
      cartState.couponCode = code.toUpperCase();
      cartState.discount = (subtotal * coupon.discountPercent / 100).toFixed(2);
      this.updateCart();
      return { success: true, message: `${coupon.discountPercent}% discount applied!` };
    } else if (coupon && subtotal < coupon.minAmount) {
      return { success: false, message: `You need to spend $${coupon.minAmount} to use this coupon.` };
    } else {
      return { success: false, message: 'Invalid coupon code' };
    }
  },
  
  calculateSubtotal: function() {
    return cartState.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  calculateTotal: function() {
    const subtotal = this.calculateSubtotal();
    const shipping = cartState.shippingMethod.cost;
    const discount = parseFloat(cartState.discount) || 0;
    
    return (subtotal + shipping - discount).toFixed(2);
  },
  
  updateCart: function() {
    this.renderCartItems();
    this.updateCartTotals();
  },
  
  renderCartItems: function() {
    const titleContainer = document.getElementById("title-container");
    titleContainer.innerHTML = '';
    
    cartState.items.forEach((item, index) => {
      const itemRow = document.createElement("div");
      itemRow.className = "flex justify-between items-center mb-2";
      itemRow.innerHTML = `
        <p>${index + 1}. ${item.title}</p>
        <div class="flex items-center">
          <button class="quantity-btn minus px-2 bg-gray-200 rounded-l" data-id="${item.id}">-</button>
          <span class="px-2">${item.quantity}</span>
          <button class="quantity-btn plus px-2 bg-gray-200 rounded-r" data-id="${item.id}">+</button>
          <span class="ml-4">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `;
      titleContainer.appendChild(itemRow);
    });
    
    // Add event listeners for quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.target.dataset.id;
        const item = cartState.items.find(item => item.id === itemId);
        if (e.target.classList.contains('plus')) {
          this.updateQuantity(itemId, item.quantity + 1);
        } else if (e.target.classList.contains('minus')) {
          if (item.quantity > 1) {
            this.updateQuantity(itemId, item.quantity - 1);
          } else {
            this.removeItem(itemId);
          }
        }
      });
    });
  },
  
  updateCartTotals: function() {
    const subtotal = this.calculateSubtotal();
    const shipping = cartState.shippingMethod.cost;
    const discount = parseFloat(cartState.discount) || 0;
    const total = this.calculateTotal();
    
    document.getElementById('totalPrice').innerText = subtotal.toFixed(2);
    document.getElementById('shippingPrice').innerText = shipping.toFixed(2);
    document.getElementById('discountPrice').innerText = discount.toFixed(2);
    document.getElementById('total').innerText = total;
  }
};

// Initialize shopping cart UI
function initShippingOptions() {
  const shippingSelect = document.getElementById('shipping-options');
  
  shippingOptions.forEach(option => {
    const optionEl = document.createElement('option');
    optionEl.value = option.id;
    optionEl.textContent = `${option.name} ($${option.cost.toFixed(2)})`;
    shippingSelect.appendChild(optionEl);
  });
  
  shippingSelect.addEventListener('change', (e) => {
    cartAPI.setShippingMethod(e.target.value);
  });
}

// Add click event to all product cards
const cards = document.querySelectorAll(".card");

for (let index = 0; index < cards.length; index++) {
  const card = cards[index];
  card.addEventListener("click", function() {
    const title = card.querySelector("h3").innerText;
    const price = parseFloat(
      card.querySelector("span").innerText.split(" ")[1]
    );
    const id = `product-${index}`; // Generate a unique ID based on index

    // Add item to cart
    cartAPI.addItem({
      id: id,
      title: title,
      price: price,
      quantity: 1
    });
  });
}

// Initialize shipping options after DOM is loaded
// Slider functionality
const sliderAPI = {
  currentSlideIndex: 0,
  autoPlayInterval: null,
  slideContainers: [],
  slidesPerView: 3,
  
  init: function() {
    // Initialize the sliders
    this.slideContainers = document.querySelectorAll('.product-slider');
    
    if (this.slideContainers.length === 0) return;
    
    // Set up all sliders
    this.slideContainers.forEach((container) => {
      const slides = container.querySelectorAll('.slide-item');
      const nextBtn = container.parentElement.querySelector('.slider-next');
      const prevBtn = container.parentElement.querySelector('.slider-prev');
      
      // Adjust slide display based on screen size
      this.updateSlidesPerView();
      
      // Initial display
      this.updateSlideVisibility(container);
      
      // Add event listeners for navigation buttons
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.nextSlide(container));
      }
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.prevSlide(container));
      }
    });
    
    // Start autoplay for all sliders
    this.startAutoPlay();
    
    // Update slides per view on window resize
    window.addEventListener('resize', () => {
      this.updateSlidesPerView();
      this.slideContainers.forEach(container => {
        this.updateSlideVisibility(container);
      });
    });
  },
  
  updateSlidesPerView: function() {
    if (window.innerWidth < 768) {
      this.slidesPerView = 1; // Mobile view
    } else if (window.innerWidth < 1024) {
      this.slidesPerView = 2; // Tablet view
    } else {
      this.slidesPerView = 3; // Desktop view
    }
  },
  
  nextSlide: function(container) {
    const slides = container.querySelectorAll('.slide-item');
    const currentIndex = parseInt(container.dataset.currentIndex || 0);
    let newIndex = currentIndex + 1;
    
    if (newIndex > slides.length - this.slidesPerView) {
      newIndex = 0; // Loop back to the beginning
    }
    
    container.dataset.currentIndex = newIndex;
    this.updateSlideVisibility(container);
  },
  
  prevSlide: function(container) {
    const slides = container.querySelectorAll('.slide-item');
    const currentIndex = parseInt(container.dataset.currentIndex || 0);
    let newIndex = currentIndex - 1;
    
    if (newIndex < 0) {
      newIndex = slides.length - this.slidesPerView; // Loop to the end
    }
    
    container.dataset.currentIndex = newIndex;
    this.updateSlideVisibility(container);
  },
  
  updateSlideVisibility: function(container) {
    const slides = container.querySelectorAll('.slide-item');
    const currentIndex = parseInt(container.dataset.currentIndex || 0);
    
    // Hide all slides first
    slides.forEach(slide => {
      slide.style.display = 'none';
    });
    
    // Show only the current visible slides
    for (let i = currentIndex; i < currentIndex + this.slidesPerView && i < slides.length; i++) {
      if (slides[i]) {
        slides[i].style.display = 'block';
      }
    }
  },
  
  startAutoPlay: function() {
    // Clear any existing interval
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
    
    // Set up autoplay for all sliders
    this.autoPlayInterval = setInterval(() => {
      this.slideContainers.forEach(container => {
        this.nextSlide(container);
      });
    }, 5000); // Change slide every 5 seconds
  },
  
  stopAutoPlay: function() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  initShippingOptions();
  sliderAPI.init();
});

// Coupon code application
const applyBtn = document.getElementById("apply-btn");
applyBtn.addEventListener("click", function() {
  const couponElement = document.getElementById("input-field").value;
  if (!couponElement.trim()) {
    alert('Please enter a coupon code');
    return;
  }
  
  const result = cartAPI.applyCoupon(couponElement);
  document.getElementById("input-field").value = "";
  
  if (result.success) {
    // Show success message
    const successEl = document.createElement('div');
    successEl.className = 'bg-green-100 text-green-700 p-2 mb-2 rounded';
    successEl.textContent = result.message;
    document.getElementById('coupon-container').appendChild(successEl);
    
    // Remove message after 3 seconds
    setTimeout(() => {
      successEl.remove();
    }, 3000);
  } else {
    // Show error message
    alert(result.message);
  }
});

// Make Purchase Button
document.querySelector('.btn-wide').addEventListener('click', function() {
  if (cartState.items.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  // Show the modal
  my_modal_2.showModal();
});