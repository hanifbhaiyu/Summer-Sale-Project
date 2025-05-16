// Simple slider implementation
document.addEventListener('DOMContentLoaded', function() {
  // Create sliders for each product category
  createCategorySliders();
});

function createCategorySliders() {
  // Find each product category section
  const categories = document.querySelectorAll('h2.text-4xl.font-bold');
  
  categories.forEach(category => {
    // Get the parent div containing the products
    const categoryContainer = category.parentElement;
    const productGrid = categoryContainer.querySelector('div[class*="grid"]');
    
    if (!productGrid) return;
    
    // Get products from the grid
    const products = Array.from(productGrid.querySelectorAll('.card'));
    if (products.length === 0) return;
    
    // Create slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'category-slider relative';
    sliderContainer.style.margin = '2rem 0';
    sliderContainer.style.position = 'relative';
    sliderContainer.style.overflow = 'hidden';
    
    // Create slider track
    const sliderTrack = document.createElement('div');
    sliderTrack.className = 'slider-track';
    sliderTrack.style.display = 'flex';
    sliderTrack.style.transition = 'transform 0.3s ease';
    
    // Add products to slider
    products.forEach(product => {
      const sliderItem = product.cloneNode(true);
      sliderItem.classList.add('slider-item');
      sliderItem.style.flexShrink = '0';
      sliderItem.style.padding = '0 0.5rem';
      sliderItem.style.cursor = 'pointer';
      
      // Set click handler to add to cart
      sliderItem.addEventListener('click', function() {
        const titleElement = sliderItem.querySelector('h3');
        const priceElement = sliderItem.querySelector('span');
        
        if (titleElement && priceElement) {
          const title = titleElement.innerText;
          const priceText = priceElement.innerText;
          const price = parseFloat(priceText.split(' ')[1]);
          
          // Add item to cart using the existing cart API
          if (window.cartAPI) {
            window.cartAPI.addItem({
              id: `product-${Date.now()}`,
              title: title,
              price: price,
              quantity: 1
            });
          } else {
            // If cartAPI is not available, use original method
            const titleContainer = document.getElementById('title-container');
            if (titleContainer) {
              const titleCount = titleContainer.children.length + 1;
              const p = document.createElement('p');
              p.innerText = titleCount + ". " + title;
              titleContainer.appendChild(p);
              
              // Update price
              const totalPriceElement = document.getElementById('totalPrice');
              if (totalPriceElement) {
                const currentTotal = parseFloat(totalPriceElement.innerText || '0');
                totalPriceElement.innerText = (currentTotal + price).toFixed(2);
              }
            }
          }
        }
      });
      
      sliderTrack.appendChild(sliderItem);
    });
    
    // Create navigation buttons
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&lt;';
    prevButton.className = 'slider-prev';
    prevButton.style.position = 'absolute';
    prevButton.style.left = '10px';
    prevButton.style.top = '50%';
    prevButton.style.transform = 'translateY(-50%)';
    prevButton.style.zIndex = '10';
    prevButton.style.backgroundColor = '#F11A7B';
    prevButton.style.color = 'white';
    prevButton.style.borderRadius = '50%';
    prevButton.style.width = '40px';
    prevButton.style.height = '40px';
    prevButton.style.fontSize = '18px';
    prevButton.style.border = 'none';
    prevButton.style.cursor = 'pointer';
    
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&gt;';
    nextButton.className = 'slider-next';
    nextButton.style.position = 'absolute';
    nextButton.style.right = '10px';
    nextButton.style.top = '50%';
    nextButton.style.transform = 'translateY(-50%)';
    nextButton.style.zIndex = '10';
    nextButton.style.backgroundColor = '#F11A7B';
    nextButton.style.color = 'white';
    nextButton.style.borderRadius = '50%';
    nextButton.style.width = '40px';
    nextButton.style.height = '40px';
    nextButton.style.fontSize = '18px';
    nextButton.style.border = 'none';
    nextButton.style.cursor = 'pointer';
    
    // Add everything to the container
    sliderContainer.appendChild(sliderTrack);
    sliderContainer.appendChild(prevButton);
    sliderContainer.appendChild(nextButton);
    
    // Replace the grid with our slider
    productGrid.parentNode.insertBefore(sliderContainer, productGrid);
    productGrid.style.display = 'none';
    
    // Initialize the slider
    initializeSlider(sliderTrack, prevButton, nextButton);
    
    // Set initial item widths
    updateSliderItemWidths(sliderTrack);
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
    document.querySelectorAll('.slider-track').forEach(track => {
      updateSliderItemWidths(track);
    });
  });
}

function updateSliderItemWidths(track) {
  const items = track.querySelectorAll('.slider-item');
  const isMobile = window.innerWidth < 768;
  
  items.forEach(item => {
    // On mobile show 1 item, on desktop show 2
    item.style.width = isMobile ? '100%' : '50%';
  });
}

function initializeSlider(track, prevBtn, nextBtn) {
  let currentPosition = 0;
  let autoplayInterval = null;
  
  function updateSliderPosition() {
    track.style.transform = `translateX(-${currentPosition}%)`;
  }
  
  function slideNext() {
    const items = track.querySelectorAll('.slider-item');
    const itemWidth = window.innerWidth < 768 ? 100 : 50; // 100% on mobile, 50% on desktop
    const maxPosition = (items.length - (window.innerWidth < 768 ? 1 : 2)) * itemWidth;
    
    if (currentPosition < maxPosition) {
      currentPosition += itemWidth;
    } else {
      currentPosition = 0; // Loop back to start
    }
    
    updateSliderPosition();
  }
  
  function slidePrev() {
    const items = track.querySelectorAll('.slider-item');
    const itemWidth = window.innerWidth < 768 ? 100 : 50; // 100% on mobile, 50% on desktop
    const maxPosition = (items.length - (window.innerWidth < 768 ? 1 : 2)) * itemWidth;
    
    if (currentPosition > 0) {
      currentPosition -= itemWidth;
    } else {
      currentPosition = maxPosition; // Loop to end
    }
    
    updateSliderPosition();
  }
  
  // Set up button click events
  nextBtn.addEventListener('click', slideNext);
  prevBtn.addEventListener('click', slidePrev);
  
  // Set up autoplay with much longer interval
  function startAutoplay() {
    autoplayInterval = setInterval(slideNext, 8000); // 8 seconds between slides
  }
  
  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }
  
  // Start/stop autoplay on hover
  track.parentElement.addEventListener('mouseenter', stopAutoplay);
  track.parentElement.addEventListener('mouseleave', startAutoplay);
  
  // Start autoplay initially
  startAutoplay();
}
