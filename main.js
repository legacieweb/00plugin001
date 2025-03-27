document.addEventListener("DOMContentLoaded", () => {
    console.log("Weed Store Website Loaded");
    // Example: Dynamically load featured products from backend
    fetch('/api/products')
      .then(response => response.json())
      .then(products => {
        const productContainer = document.querySelector("#product-container");
        products.forEach(product => {
          const productCard = `
            <div class="bg-white shadow-md rounded-md overflow-hidden">
              <img src="${product.image_url}" alt="${product.name}" class="w-full h-48 object-cover">
              <div class="p-4">
                <h3 class="text-xl font-bold">${product.name}</h3>
                <p class="text-gray-700">$${product.price}</p>
                <a href="product-detail.html?id=${product.id}" class="text-green-600 hover:underline mt-2 inline-block">View Details</a>
              </div>
            </div>`;
          productContainer.innerHTML += productCard;
        });
      });
  });
  