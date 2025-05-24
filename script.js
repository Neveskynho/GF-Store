// Slideshow functionality for hero section
let slideIndex = 0;

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    
    if (slides.length === 0) return; // Se não há slides, não faz nada
    
    // Hide all slides
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    // Remove active class from dots
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    // Increment slide index
    slideIndex++;
    
    // Reset if at end
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    
    // Display current slide and mark dot as active
    if (slides[slideIndex-1]) {
        slides[slideIndex-1].style.display = "block";
    }
    if (dots[slideIndex-1]) {
        dots[slideIndex-1].className += " active";
    }
    
    // Change slide every 4 seconds
    setTimeout(showSlides, 4000);
}

// Produtos masculinos organizados por categoria
const produtosPorCategoria = {
    'shorts': [
        'Shorts-Moletom-Cinza-49.90.jpg',
        'Shorts-Jeans-Delavado-59.90.jpg',
        'Shorts-Tactel-Preto-39.90.jpg',
        'Shorts-Esportivo-Academia-44.90.jpg',
        'Shorts-Sarja-Bege-54.90.jpg',
        'Shorts-Cargo-Verde-64.90.jpg',
        'Shorts-Praia-Estampado-42.90.jpg',
        'Shorts-Social-Marinho-69.90.jpg',
        'Shorts-Ciclista-Compressao-47.90.jpg',
        'Shorts-Bermuda-Alfaiataria-79.90.jpg',
        'Shorts-Fitness-DryFit-52.90.jpg',
        'Shorts-Casual-Listrado-45.90.jpg'
    ],
    'camisas': [
        'Camisas-Social-Branca-89.90.jpg',
        'Camisas-Polo-Azul-69.90.jpg',
        'Camisas-Flanela-Xadrez-95.90.jpg',
        'Camisas-Linho-Bege-79.90.jpg',
        'Camisas-Jeans-Delave-85.90.jpg',
        'Camisas-Manga-Longa-Preta-74.90.jpg',
        'Camisas-Tricoline-Listrada-67.90.jpg',
        'Camisas-Oxford-Cinza-92.90.jpg',
        'Camisas-Casual-Estampada-58.90.jpg',
        'Camisas-Slim-Fit-Marinho-87.90.jpg',
        'Camisas-Linho-Branca-82.90.jpg',
        'Camisas-Polo-Listrada-64.90.jpg',
        'Camisas-Social-Slim-99.90.jpg',
        'Camisas-Flanela-Verde-78.90.jpg'
    ],
    'calcas': [
        'Calcas-Jeans-Skinny-119.90.jpg',
        'Calcas-Social-Preta-149.90.jpg',
        'Calcas-Chino-Bege-89.90.jpg',
        'Calcas-Cargo-Verde-109.90.jpg',
        'Calcas-Moletom-Cinza-79.90.jpg',
        'Calcas-Alfaiataria-Marinho-169.90.jpg',
        'Calcas-Sarja-Caramelo-94.90.jpg',
        'Calcas-Jeans-Destroyed-124.90.jpg',
        'Calcas-Social-Risca-Giz-159.90.jpg',
        'Calcas-Tactel-Esportiva-67.90.jpg',
        'Calcas-Jogger-Preta-84.90.jpg',
        'Calcas-Linho-Branca-99.90.jpg',
        'Calcas-Jeans-Reta-104.90.jpg',
        'Calcas-Social-Cinza-139.90.jpg',
        'Calcas-Cargo-Preta-114.90.jpg'
    ],
    'dry-fits': [
        'DryFits-Basica-Preta-34.90.jpg',
        'DryFits-Gola-V-Branca-32.90.jpg',
        'DryFits-Manga-Longa-Azul-42.90.jpg',
        'DryFits-Estampada-Academia-39.90.jpg',
        'DryFits-Compressao-Cinza-47.90.jpg',
        'DryFits-UV-Protection-Branca-49.90.jpg',
        'DryFits-Fitness-Verde-37.90.jpg',
        'DryFits-Running-Amarela-44.90.jpg',
        'DryFits-Slim-Fit-Preta-41.90.jpg',
        'DryFits-Oversized-Cinza-38.90.jpg',
        'DryFits-Gola-Careca-Azul-35.90.jpg',
        'DryFits-Treino-Vermelha-43.90.jpg'
    ],
    'meias': [
        'Meias-Social-Preta-Pack3-24.90.jpg',
        'Meias-Esportiva-Branca-Pack5-32.90.jpg',
        'Meias-Cano-Alto-Cinza-Pack3-28.90.jpg',
        'Meias-Invisivel-Bege-Pack6-19.90.jpg',
        'Meias-Compressao-Azul-Pack2-45.90.jpg',
        'Meias-Tenis-Branca-Pack4-26.90.jpg',
        'Meias-Social-Marinho-Pack3-22.90.jpg',
        'Meias-Running-Cinza-Pack3-35.90.jpg',
        'Meias-Casual-Listrada-Pack4-29.90.jpg',
        'Meias-Algodao-Preta-Pack5-18.90.jpg',
        'Meias-Trekking-Verde-Pack2-42.90.jpg',
        'Meias-Social-Risca-Pack3-27.90.jpg'
    ],
    'acessorios': [
        'Acessorios-Cinto-Couro-Preto-45.90.jpg',
        'Acessorios-Carteira-Couro-Marrom-35.90.jpg',
        'Acessorios-Relogio-Digital-Preto-89.90.jpg',
        'Acessorios-Bone-Snapback-Azul-29.90.jpg',
        'Acessorios-Oculos-Sol-Aviador-65.90.jpg',
        'Acessorios-Cinto-Lona-Verde-25.90.jpg',
        'Acessorios-Carteira-Slim-Preta-28.90.jpg',
        'Acessorios-Relogio-Social-Dourado-129.90.jpg',
        'Acessorios-Bone-Trucker-Branco-32.90.jpg',
        'Acessorios-Mochila-Executiva-149.90.jpg',
        'Acessorios-Gravata-Social-Azul-39.90.jpg',
        'Acessorios-Suspensorio-Couro-79.90.jpg'
    ]
};

// Produtos masculinos até R$ 6,00 organizados por categoria
const produtosAte6Reais = {
    'shorts': [
        'Shorts-Cueca-Boxer-Preta-5.90.jpg',
        'Shorts-Sunga-Basica-Azul-4.50.jpg',
        'Shorts-Mini-Elastico-Cinza-5.50.jpg'
    ],
    'camisas': [
        'Camisas-Regata-Basica-Branca-3.90.jpg',
        'Camisas-Regata-Algodao-Preta-4.90.jpg',
        'Camisas-Tank-Top-Cinza-5.50.jpg'
    ],
    'calcas': [
        'Calcas-Cueca-Long-Preta-6.00.jpg',
        'Calcas-Bermuda-Casa-Cinza-5.90.jpg'
    ],
    'dry-fits': [
        'DryFits-Regata-Basica-3.50.jpg',
        'DryFits-Camiseta-Lisa-5.90.jpg',
        'DryFits-Baby-Look-Masculina-4.50.jpg'
    ],
    'meias': [
        'Meias-Sapatilha-Branca-2.90.jpg',
        'Meias-Curta-Preta-3.90.jpg',
        'Meias-Invisivel-Simples-1.90.jpg',
        'Meias-Tenis-Basica-4.50.jpg',
        'Meias-Social-Unitaria-5.90.jpg'
    ],
    'acessorios': [
        'Acessorios-Cinto-Basico-Preto-5.90.jpg',
        'Acessorios-Carteira-Simples-6.00.jpg',
        'Acessorios-Bone-Basic-4.90.jpg',
        'Acessorios-Lenco-Pescoço-3.50.jpg'
    ]
};

const promocoesPorCategoria = {
    'shorts': [
        'Shorts-Premium-Jeans-89.90-49.90.jpg',
        'Shorts-Kit-Verao-Pack3-149.90-89.90.jpg',
        'Shorts-Cargo-Militar-119.90-69.90.jpg',
        'Shorts-Kit-Academia-Pack2-99.90-59.90.jpg'
    ],
    'camisas': [
        'Camisas-Kit-Social-Pack2-179.90-109.90.jpg',
        'Camisas-Polo-Premium-149.90-89.90.jpg',
        'Camisas-Kit-Casual-Pack3-199.90-119.90.jpg',
        'Camisas-Social-Alfaiataria-169.90-99.90.jpg'
    ],
    'calcas': [
        'Calcas-Jeans-Premium-199.90-119.90.jpg',
        'Calcas-Kit-Social-Pack2-299.90-179.90.jpg',
        'Calcas-Alfaiataria-Luxo-249.90-149.90.jpg',
        'Calcas-Kit-Casual-Pack2-219.90-129.90.jpg'
    ],
    'dry-fits': [
        'DryFits-Kit-Academia-Pack5-149.90-89.90.jpg',
        'DryFits-Professional-Pack3-119.90-69.90.jpg',
        'DryFits-Premium-Compressao-89.90-54.90.jpg',
        'DryFits-Kit-Running-Pack4-139.90-84.90.jpg'
    ],
    'meias': [
        'Meias-Kit-Semana-Pack7-69.90-39.90.jpg',
        'Meias-Premium-Pack10-89.90-49.90.jpg',
        'Meias-Kit-Esportivo-Pack6-79.90-44.90.jpg',
        'Meias-Social-Premium-Pack5-59.90-34.90.jpg'
    ],
    'acessorios': [
        'Acessorios-Kit-Executivo-Pack3-199.90-119.90.jpg',
        'Acessorios-Relogio-Premium-249.90-149.90.jpg',
        'Acessorios-Kit-Couro-Luxo-299.90-179.90.jpg',
        'Acessorios-Mochila-Premium-179.90-109.90.jpg'
    ]
};

// Cache para produtos carregados
let productCache = {};
let categoryCache = {};

// Função para carregar produtos de uma categoria específica
function loadCategoryProducts(category) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // Verificar cache primeiro
    if (categoryCache[category]) {
        renderProductsFromCache(categoryCache[category], productsContainer);
        // Reconfigurar filtros após renderizar do cache
        setTimeout(() => {
            setupFiltersAndSort();
        }, 100);
        return;
    }
    
    // Mostrar loading
    showLoadingState(productsContainer);
    
    setTimeout(() => {
        // Limpar container
        productsContainer.innerHTML = '';
        
        let allProducts = [];
        
        // Carregar produtos normais da categoria
        if (produtosPorCategoria[category]) {
            produtosPorCategoria[category].forEach(produto => {
                const card = createProductCard(produto, false, category);
                allProducts.push(card);
                productsContainer.appendChild(card);
            });
        }
        
        // Carregar promoções da categoria
        if (promocoesPorCategoria[category]) {
            promocoesPorCategoria[category].forEach(promocao => {
                const card = createProductCard(promocao, true, category);
                allProducts.push(card);
                productsContainer.appendChild(card);
            });
        }
        
        // Salvar no cache
        categoryCache[category] = allProducts;
        
        // Adicionar animação de entrada
        animateProductCards();
        
        // Configurar filtros após carregar produtos
        setTimeout(() => {
            setupFiltersAndSort();
        }, 600);
        
    }, 500); // Simular tempo de carregamento
}

// Função para carregar todos os produtos
function loadAllProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // Mostrar loading
    showLoadingState(productsContainer);
    
    setTimeout(() => {
        // Limpar container
        productsContainer.innerHTML = '';
        
        // Carregar produtos de todas as categorias
        Object.keys(produtosPorCategoria).forEach(category => {
            produtosPorCategoria[category].forEach(produto => {
                const card = createProductCard(produto, false, category);
                productsContainer.appendChild(card);
            });
        });
        
        // Carregar promoções de todas as categorias
        Object.keys(promocoesPorCategoria).forEach(category => {
            promocoesPorCategoria[category].forEach(promocao => {
                const card = createProductCard(promocao, true, category);
                productsContainer.appendChild(card);
            });
        });
        
        // Adicionar animação de entrada
        animateProductCards();
        
        // Configurar filtros após carregar produtos
        setTimeout(() => {
            setupFiltersAndSort();
        }, 850);
        
    }, 750);
}

// Função para mostrar estado de carregamento
function showLoadingState(container) {
    container.innerHTML = `
        <div class="loading-grid">
            ${Array(8).fill().map(() => `
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-category"></div>
                        <div class="skeleton-price"></div>
                        <div class="skeleton-button"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Função para animar cards de produtos
function animateProductCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Função para renderizar produtos do cache
function renderProductsFromCache(products, container) {
    container.innerHTML = '';
    products.forEach(product => {
        container.appendChild(product.cloneNode(true));
    });
    animateProductCards();
}

// Função para criar um card de produto
function createProductCard(filename, isPromotion, category = '') {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = category;
    card.dataset.promotion = isPromotion;
    
    let productName, price, originalPrice = null;
    let extractedCategory = '';
    
    if (isPromotion) {
        // Formato: Categoria-Nome-PreçoAnterior-PreçoPosterior.jpg
        const parts = filename.replace('.jpg', '').split('-');
        
        if (parts.length >= 4) {
            extractedCategory = parts[0];
            
            let priceIndex = -1;
            for (let i = parts.length - 2; i >= 1; i--) {
                if (parts[i].includes('.') && parts[i+1] && parts[i+1].includes('.')) {
                    priceIndex = i;
                    break;
                }
            }
            
            if (priceIndex > 1) {
                productName = parts.slice(1, priceIndex).join(' ');
                originalPrice = 'R$ ' + parts[priceIndex].replace('.', ',');
                price = 'R$ ' + parts[priceIndex + 1].replace('.', ',');
            } else {
                productName = parts.slice(1).join(' ');
                price = 'R$ 0,00';
            }
        } else {
            productName = filename.replace('.jpg', '').replace(/-/g, ' ');
            price = 'R$ 0,00';
        }
    } else {
        // Formato: Categoria-Nome-Preço.jpg
        const parts = filename.replace('.jpg', '').split('-');
        
        if (parts.length >= 3) {
            extractedCategory = parts[0];
            const lastPart = parts[parts.length - 1];
            
            if (lastPart.includes('.')) {
                productName = parts.slice(1, -1).join(' ');
                price = 'R$ ' + lastPart.replace('.', ',');
            } else {
                productName = parts.slice(1).join(' ');
                price = 'R$ 0,00';
            }
        } else {
            productName = filename.replace('.jpg', '').replace(/-/g, ' ');
            price = 'R$ 0,00';
        }
    }
    
    // Usar categoria extraída se não foi fornecida
    if (!category && extractedCategory) {
        category = extractedCategory.toLowerCase();
        switch(extractedCategory.toLowerCase()) {
            case 'dryfits':
                category = 'dry-fits';
                break;
            default:
                category = extractedCategory.toLowerCase();
        }
    }
    
    // Determinar caminho da imagem - usando imagens do Unsplash como placeholder
    let imageUrl;
    switch(category) {
        case 'shorts':
            imageUrl = 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop';
            break;
        case 'camisas':
            imageUrl = 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop';
            break;
        case 'calcas':
            imageUrl = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop';
            break;
        case 'dry-fits':
        case 'dryfits':
            imageUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop';
            break;
        case 'meias':
            imageUrl = 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop';
            break;
        case 'acessorios':
            imageUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop';
            break;
        default:
            imageUrl = 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop';
    }
    
    // Adicionar badge de promoção se aplicável
    const promotionBadge = isPromotion ? '<div class="promotion-badge">PROMOÇÃO</div>' : '';
    
    // Calcular desconto se for promoção
    let discountPercentage = '';
    if (isPromotion && originalPrice) {
        const originalValue = parseFloat(originalPrice.replace('R$ ', '').replace(',', '.'));
        const currentValue = parseFloat(price.replace('R$ ', '').replace(',', '.'));
        const discount = Math.round(((originalValue - currentValue) / originalValue) * 100);
        discountPercentage = `<div class="discount-badge" style="position: absolute; top: 10px; right: 10px; background: #27ae60; color: white; padding: 5px 8px; font-size: 0.7rem; border-radius: 50%; font-weight: bold; min-width: 35px; text-align: center; z-index: 10;">-${discount}%</div>`;
    }
    
    card.innerHTML = `
        ${promotionBadge}
        ${discountPercentage}
        <div class="product-image">
            <img src="${imageUrl}" alt="${productName}" loading="lazy" 
                 onerror="this.src='https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop'" 
                 onload="this.classList.add('loaded')">
            <div class="product-actions">
                <div class="action-btn" title="Favoritar" onclick="toggleFavorite(this, '${productName}')">
                    <i class="far fa-heart"></i>
                </div>
                <div class="action-btn" title="Visualização rápida" onclick="quickView('${filename}', '${productName}', '${price}', '${originalPrice || ''}')">
                    <i class="far fa-eye"></i>
                </div>
                <div class="action-btn" title="Compartilhar" onclick="shareProduct('${productName}')">
                    <i class="fas fa-share-alt"></i>
                </div>
            </div>
            <div class="product-overlay">
                <button class="quick-order-btn" onclick="encomendar('${productName}')" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: #25d366; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; opacity: 0; transition: opacity 0.3s ease; z-index: 10;">
                    <i class="fab fa-whatsapp"></i>
                    Encomendar Rápido
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3>${productName}</h3>
            ${category ? `<span class="product-category" data-category="${category}">${getCategoryName(category)}</span>` : ''}
            <div class="product-rating">
                <div class="stars">
                    ${'★'.repeat(5)}
                </div>
                <span class="rating-count">(${Math.floor(Math.random() * 50) + 10})</span>
            </div>
            <div class="price-container">
                ${originalPrice ? `<span class="price-original">${originalPrice}</span>` : ''}
                <span class="${originalPrice ? 'price-discount' : 'price'}">${price}</span>
            </div>
            <div class="product-options">
                <div class="quantity-selector" style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; width: fit-content; overflow: hidden; margin: 1rem 0;">
                    <button onclick="decreaseQuantity(this)" style="background-color: var(--accent-color); border: none; padding: 0.6rem 0.8rem; cursor: pointer; font-size: 1.1rem; font-weight: 600; transition: var(--transition); color: var(--primary-color); min-width: 35px; display: flex; align-items: center; justify-content: center;">-</button>
                    <input type="number" value="1" min="1" max="10" style="border: none; width: 60px; padding: 0.6rem 0.5rem; text-align: center; font-size: 1rem; font-weight: 500; background-color: white; outline: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd;">
                    <button onclick="increaseQuantity(this)" style="background-color: var(--accent-color); border: none; padding: 0.6rem 0.8rem; cursor: pointer; font-size: 1.1rem; font-weight: 600; transition: var(--transition); color: var(--primary-color); min-width: 35px; display: flex; align-items: center; justify-content: center;">+</button>
                </div>
            </div>
            <button class="add-to-cart" onclick="encomendar('${productName}')" data-product="${productName}">
                <i class="fab fa-whatsapp"></i>
                Encomendar agora
            </button>
        </div>
    `;
    
    return card;
}

// Função para obter nome da categoria em português
function getCategoryName(category) {
    const categoryNames = {
        'shorts': 'Shorts',
        'camisas': 'Camisas',
        'calcas': 'Calças',
        'dry-fits': 'Dry Fits',
        'meias': 'Meias',
        'acessorios': 'Acessórios'
    };
    return categoryNames[category] || category;
}

// Função para carregar produtos até R$ 6,00
function loadBudgetProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    showLoadingState(productsContainer);
    
    setTimeout(() => {
        productsContainer.innerHTML = '';
        
        Object.keys(produtosAte6Reais).forEach(category => {
            produtosAte6Reais[category].forEach(produto => {
                const card = createProductCard(produto, false, category);
                productsContainer.appendChild(card);
            });
        });
        
        animateProductCards();
    }, 600);
}

// Função para carregar produtos até R$ 6,00 por categoria
function loadBudgetProductsByCategory(category) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    showLoadingState(productsContainer);
    
    setTimeout(() => {
        productsContainer.innerHTML = '';
        
        if (produtosAte6Reais[category]) {
            produtosAte6Reais[category].forEach(produto => {
                const card = createProductCard(produto, false, category);
                productsContainer.appendChild(card);
            });
        }
        
        animateProductCards();
    }, 400);
}

// Função para carregar produtos dinamicamente (versão para home)
function loadProducts() {
    // Para a página inicial, carregar alguns produtos de cada categoria
    const produtos = [
        'Shorts-Moletom-Cinza-49.90.jpg',
        'Camisas-Social-Branca-89.90.jpg',
        'Calcas-Jeans-Skinny-119.90.jpg',
        'DryFits-Basica-Preta-34.90.jpg'
    ];
    
    const promocoes = [
        'Shorts-Premium-Jeans-89.90-49.90.jpg',
        'Camisas-Kit-Social-Pack2-179.90-109.90.jpg',
        'Calcas-Jeans-Premium-199.90-119.90.jpg'
    ];
    
    // Carregar produtos normais
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        produtos.forEach(produto => {
            const card = createProductCard(produto, false);
            productsContainer.appendChild(card);
        });
    }
    
    // Carregar promoções
    const promotionsContainer = document.getElementById('promotions-container');
    if (promotionsContainer) {
        promocoes.forEach(promocao => {
            const card = createProductCard(promocao, true);
            promotionsContainer.appendChild(card);
        });
    }
    
    // Animar cards após carregamento
    setTimeout(animateProductCards, 100);
}

// Funções de interação com produtos
function toggleFavorite(button, productName) {
    const icon = button.querySelector('i');
    const isFavorited = icon.classList.contains('fas');
    
    if (isFavorited) {
        icon.classList.remove('fas');
        icon.classList.add('far');
        button.title = 'Favoritar';
        removeFavorite(productName);
    } else {
        icon.classList.remove('far');
        icon.classList.add('fas');
        button.title = 'Remover dos favoritos';
        addFavorite(productName);
    }
}

function addFavorite(productName) {
    let favorites = JSON.parse(localStorage.getItem('gf-store-favorites') || '[]');
    if (!favorites.includes(productName)) {
        favorites.push(productName);
        localStorage.setItem('gf-store-favorites', JSON.stringify(favorites));
    }
}

function removeFavorite(productName) {
    let favorites = JSON.parse(localStorage.getItem('gf-store-favorites') || '[]');
    favorites = favorites.filter(fav => fav !== productName);
    localStorage.setItem('gf-store-favorites', JSON.stringify(favorites));
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('gf-store-favorites') || '[]');
    favorites.forEach(productName => {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const cardTitle = card.querySelector('h3').textContent;
            if (cardTitle === productName) {
                const favoriteBtn = card.querySelector('.action-btn[title*="Favoritar"]');
                if (favoriteBtn) {
                    const icon = favoriteBtn.querySelector('i');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    favoriteBtn.title = 'Remover dos favoritos';
                }
            }
        });
    });
}

function quickView(filename, productName, price, originalPrice) {
    const modal = document.getElementById('quick-view-modal') || createQuickViewModal();
    const imagePath = filename.includes('promocoes') ? 
        'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop' : 
        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop';
    
    modal.querySelector('.modal-image img').src = imagePath;
    modal.querySelector('.modal-title').textContent = productName;
    modal.querySelector('.modal-price').innerHTML = originalPrice ? 
        `<span class="price-original">${originalPrice}</span> <span class="price-discount">${price}</span>` : 
        `<span class="price">${price}</span>`;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function createQuickViewModal() {
    const modal = document.createElement('div');
    modal.id = 'quick-view-modal';
    modal.className = 'modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; border-radius: 10px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative;">
            <span class="modal-close" style="position: absolute; top: 15px; right: 20px; font-size: 28px; font-weight: bold; cursor: pointer; z-index: 10;">&times;</span>
            <div class="modal-body" style="display: flex; padding: 2rem; gap: 2rem;">
                <div class="modal-image" style="flex: 1;">
                    <img src="" alt="" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px;">
                </div>
                <div class="modal-info" style="flex: 1;">
                    <h2 class="modal-title" style="margin-bottom: 1rem; color: var(--primary-color);"></h2>
                    <div class="modal-price" style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;"></div>
                    <div class="modal-description" style="margin-bottom: 2rem; color: #666;">
                        <p>Produto masculino de alta qualidade. Disponível para entrega em todo o Brasil.</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-primary" onclick="encomendar(this.getAttribute('data-product'))" style="background: var(--primary-color); color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; margin-right: 10px; font-weight: 600;">
                            <i class="fab fa-whatsapp"></i> Encomendar agora
                        </button>
                        <button class="btn-secondary" onclick="closeModal()" style="background: #ccc; color: #333; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-weight: 600;">Fechar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners para fechar modal
    modal.querySelector('.modal-close').onclick = closeModal;
    modal.onclick = function(e) {
        if (e.target === modal) closeModal();
    };
    
    return modal;
}

function closeModal() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function shareProduct(productName) {
    if (navigator.share) {
        navigator.share({
            title: `${productName} - GF Store`,
            text: `Confira este produto masculino incrível: ${productName}`,
            url: window.location.href
        });
    } else {
        // Fallback para browsers que não suportam Web Share API
        const url = window.location.href;
        const text = `Confira este produto masculino incrível: ${productName} - ${url}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Link copiado para a área de transferência!');
            });
        }
    }
}

function increaseQuantity(button) {
    const input = button.previousElementSibling;
    const currentValue = parseInt(input.value);
    const maxValue = parseInt(input.max);
    
    if (currentValue < maxValue) {
        input.value = currentValue + 1;
    }
}

function decreaseQuantity(button) {
    const input = button.nextElementSibling;
    const currentValue = parseInt(input.value);
    const minValue = parseInt(input.min);
    
    if (currentValue > minValue) {
        input.value = currentValue - 1;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Sistema de filtros e ordenação
function setupFiltersAndSort() {
    const sortSelect = document.getElementById('sort-select');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (sortSelect) {
        // Remove event listeners existentes para evitar duplicação
        const newSortSelect = sortSelect.cloneNode(true);
        sortSelect.parentNode.replaceChild(newSortSelect, sortSelect);
        
        newSortSelect.addEventListener('change', function(event) {
            const sortType = event.target.value;
            console.log('Tipo de ordenação selecionado:', sortType);
            sortProducts(sortType);
        });
        
        console.log('Sort select configurado');
    } else {
        console.log('Sort select não encontrado');
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterProductsByCategory(category);
            
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function sortProducts(sortType) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    const cards = Array.from(container.querySelectorAll('.product-card'));
    if (cards.length === 0) return;
    
    console.log('Ordenando por:', sortType); // Debug
    
    cards.sort((a, b) => {
        switch (sortType) {
            case 'name':
                const nameA = a.querySelector('h3')?.textContent?.toLowerCase() || '';
                const nameB = b.querySelector('h3')?.textContent?.toLowerCase() || '';
                return nameA.localeCompare(nameB);
                
            case 'price-low':
                const priceA = getPriceValue(a);
                const priceB = getPriceValue(b);
                console.log(`Comparando preços: ${priceA} vs ${priceB}`); // Debug
                return priceA - priceB;
                
            case 'price-high':
                const priceA2 = getPriceValue(a);
                const priceB2 = getPriceValue(b);
                console.log(`Comparando preços (desc): ${priceA2} vs ${priceB2}`); // Debug
                return priceB2 - priceA2;
                
            case 'category':
                const catA = a.dataset.category || '';
                const catB = b.dataset.category || '';
                return catA.localeCompare(catB);
                
            case 'newest':
                // Simular ordenação por data (produtos promocionais primeiro)
                const promoA = a.dataset.promotion === 'true' ? 1 : 0;
                const promoB = b.dataset.promotion === 'true' ? 1 : 0;
                return promoB - promoA;
                
            default:
                return 0;
        }
    });
    
    // Reordenar no DOM
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
    
    // Animar reordenação
    animateProductCards();
    
    console.log('Ordenação concluída'); // Debug
}

function getPriceValue(card) {
    // Primeiro tenta pegar o preço com desconto, depois o preço normal
    const priceElement = card.querySelector('.price-discount') || card.querySelector('.price');
    
    if (!priceElement) {
        console.log('Elemento de preço não encontrado'); // Debug
        return 0;
    }
    
    const priceText = priceElement.textContent || priceElement.innerText || '';
    console.log('Texto do preço encontrado:', priceText); // Debug
    
    // Remove 'R$', espaços e converte vírgula para ponto
    const numericPrice = priceText.replace('R$', '').replace(/\s/g, '').replace(',', '.');
    const price = parseFloat(numericPrice) || 0;
    
    console.log('Preço convertido:', price); // Debug
    return price;
}

function filterProductsByCategory(category) {
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Sistema de busca
function setupSearch() {
    try {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                try {
                    searchProducts(this.value);
                } catch (error) {
                    console.error('Erro na busca:', error);
                }
            });
            console.log('Sistema de busca configurado');
        } else {
            console.log('Campo de busca não encontrado');
        }
    } catch (error) {
        console.error('Erro ao configurar sistema de busca:', error);
    }
}

function searchProducts(query) {
    try {
        const cards = document.querySelectorAll('.product-card');
        const lowercaseQuery = query.toLowerCase();
        
        cards.forEach(card => {
            try {
                const productNameElement = card.querySelector('h3');
                const categoryElement = card.querySelector('.product-category');
                
                const productName = productNameElement ? productNameElement.textContent.toLowerCase() : '';
                const category = categoryElement ? categoryElement.textContent.toLowerCase() : '';
                
                if (productName.includes(lowercaseQuery) || category.includes(lowercaseQuery)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            } catch (error) {
                console.error('Erro ao processar card na busca:', error);
            }
        });
    } catch (error) {
        console.error('Erro na função de busca:', error);
    }
}

// Info section carousel for mobile
let infoIndex = 0;

function showInfoBoxes() {
    if (window.innerWidth <= 768) {
        const infoBoxes = document.querySelectorAll('.info-box');
        const infoDots = document.querySelectorAll('.info-dot');
        
        // Hide all info boxes
        infoBoxes.forEach(box => {
            box.classList.remove('info-active-slide');
        });
        
        // Remove active class from all dots
        infoDots.forEach(dot => {
            dot.classList.remove('info-active');
        });
        
        // Show current info box and activate current dot
        if (infoBoxes[infoIndex]) {
            infoBoxes[infoIndex].classList.add('info-active-slide');
        }
        if (infoDots[infoIndex]) {
            infoDots[infoIndex].classList.add('info-active');
        }
    }
}

// Move to next info box
function nextInfo() {
    const infoBoxes = document.querySelectorAll('.info-box');
    infoIndex++;
    if (infoIndex >= infoBoxes.length) {
        infoIndex = 0;
    }
    showInfoBoxes();
}

// Move to previous info box
function prevInfo() {
    const infoBoxes = document.querySelectorAll('.info-box');
    infoIndex--;
    if (infoIndex < 0) {
        infoIndex = infoBoxes.length - 1;
    }
    showInfoBoxes();
}

// Set up info carousel after DOM is loaded
function setupInfoCarousel() {
    const infoDots = document.querySelectorAll('.info-dot');
    const infoNext = document.querySelector('.info-next');
    const infoPrev = document.querySelector('.info-prev');
    
    // Initialize first box as active
    if (window.innerWidth <= 768) {
        const infoBoxes = document.querySelectorAll('.info-box');
        if (infoBoxes[0]) {
            infoBoxes[0].classList.add('info-active-slide');
        }
        if (infoDots[0]) {
            infoDots[0].classList.add('info-active');
        }
    }
    
    // Add click listeners to dots
    infoDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            infoIndex = index;
            showInfoBoxes();
        });
    });
    
    // Add click listeners to navigation buttons
    if (infoNext) {
        infoNext.addEventListener('click', nextInfo);
    }
    if (infoPrev) {
        infoPrev.addEventListener('click', prevInfo);
    }
    
    // Auto-advance carousel on mobile
    if (window.innerWidth <= 768) {
        setInterval(() => {
            nextInfo();
        }, 5000);
    }
}

// Mobile Menu Setup
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const dropdowns = document.querySelectorAll('#nav-menu .dropdown');
    
    // Verificar se os elementos existem
    if (!menuToggle || !navMenu) {
        console.log('Elementos do menu não encontrados');
        return;
    }
    
    // Limpar event listeners existentes para evitar duplicação
    menuToggle.replaceWith(menuToggle.cloneNode(true));
    const newMenuToggle = document.getElementById('menu-toggle');
    
    // Toggle main menu
    newMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Menu toggle clicado'); // Debug
        
        if (window.innerWidth <= 768) {
            const isActive = newMenuToggle.classList.contains('active');
            
            if (isActive) {
                // Fechar menu
                newMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                
                // Fechar todos os dropdowns
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            } else {
                // Abrir menu
                newMenuToggle.classList.add('active');
                navMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
    
    // Handle dropdown toggles in mobile
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            // Remover event listeners existentes
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
            
            newToggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Fechar outros dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('active');
                        }
                    });
                    
                    // Toggle dropdown atual
                    dropdown.classList.toggle('active');
                }
            });
        }
    });
    
    // Close menu when clicking on a regular link (not dropdown toggles)
    const menuLinks = document.querySelectorAll('#nav-menu a:not(.dropdown-toggle)');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
                newMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !newMenuToggle.contains(e.target)) {
                newMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        }
    });
    
    console.log('Menu mobile configurado'); // Debug
}

// Função para encomendar via WhatsApp
function encomendar(produto) {
    const hora = new Date().getHours();
    let saudacao = "";
    
    if (hora >= 5 && hora < 12) {
        saudacao = "Bom dia";
    } else if (hora >= 12 && hora < 18) {
        saudacao = "Boa tarde";
    } else {
        saudacao = "Boa noite";
    }
    
    // Obter quantidade se disponível
    const productCard = event.target.closest('.product-card');
    let quantidade = 1;
    
    if (productCard) {
        const quantityInput = productCard.querySelector('.quantity-selector input');
        if (quantityInput) {
            quantidade = quantityInput.value;
        }
    }
    
    const mensagem = quantidade > 1 ? 
        `${saudacao}, me interessei por ${quantidade} unidades do produto masculino: ${produto}` :
        `${saudacao}, me interessei pelo produto masculino: ${produto}`;
    
    const numeroWhatsapp = "5511952789725";
    
    // Track do pedido
    trackProductOrder(produto);
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank');
    
    // Mostrar notificação de sucesso
    showNotification('Redirecionando para WhatsApp...', 'success');
}

// Performance e Analytics
function trackProductView(productName, category) {
    // Simular tracking de visualização de produto
    console.log(`Product viewed: ${productName} in ${category}`);
}

function trackProductOrder(productName) {
    // Simular tracking de pedido
    console.log(`Product ordered: ${productName}`);
}

// Função principal de inicialização
function initializeApp() {
    console.log('Inicializando aplicação...');
    
    try {
        // Configurar slideshow apenas se existir
        if (document.querySelector('.slide')) {
            showSlides();
        }
        
        // Configurar carrossel de informações apenas se existir
        if (document.querySelector('.info-box')) {
            setupInfoCarousel();
        }
        
        // Configurar menu mobile - SEMPRE
        setupMobileMenu();
        
        // Configurar filtros e ordenação
        setupFiltersAndSort();
        
        // Configurar busca
        setupSearch();
        
        // Carregar produtos (dependendo da página)
        if (document.getElementById('products-container') || document.getElementById('promotions-container')) {
            loadProducts();
        }
        
        // Carregar favoritos salvos
        setTimeout(() => {
            try {
                loadFavorites();
            } catch (error) {
                console.error('Erro ao carregar favoritos:', error);
            }
        }, 500);
        
        // Event listeners globais
        setupGlobalEventListeners();
        
        // Lazy loading para imagens
        setupLazyLoading();
        
        console.log('GF Store initialized successfully!');
        
    } catch (error) {
        console.error('Erro durante a inicialização:', error);
    }
}

function setupGlobalEventListeners() {
    try {
        // ESC para fechar modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Smooth scroll para âncoras
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            try {
                if (typeof showInfoBoxes === 'function') {
                    showInfoBoxes();
                }
                
                // Reajustar layout se necessário
                if (window.innerWidth > 768) {
                    const navMenu = document.getElementById('nav-menu');
                    const menuToggle = document.getElementById('menu-toggle');
                    if (navMenu) {
                        navMenu.classList.remove('active');
                    }
                    if (menuToggle) {
                        menuToggle.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                }
            } catch (error) {
                console.error('Erro no resize:', error);
            }
        });
        
        // Handle scroll para header fixo
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            try {
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                const header = document.querySelector('header');
                
                if (header) {
                    if (currentScroll > lastScrollTop && currentScroll > 100) {
                        // Scrolling down
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        // Scrolling up
                        header.style.transform = 'translateY(0)';
                    }
                }
                
                lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
            } catch (error) {
                console.error('Erro no scroll:', error);
            }
        });
        
        // Mostrar botão de encomendar rápido no hover
        document.addEventListener('mouseover', function(e) {
            try {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const quickBtn = productCard.querySelector('.quick-order-btn');
                    if (quickBtn) {
                        quickBtn.style.opacity = '1';
                    }
                }
            } catch (error) {
                console.error('Erro no mouseover:', error);
            }
        });
        
        document.addEventListener('mouseout', function(e) {
            try {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const quickBtn = productCard.querySelector('.quick-order-btn');
                    if (quickBtn) {
                        quickBtn.style.opacity = '0';
                    }
                }
            } catch (error) {
                console.error('Erro no mouseout:', error);
            }
        });
        
        console.log('Event listeners globais configurados');
        
    } catch (error) {
        console.error('Erro ao configurar event listeners globais:', error);
    }
}

function setupLazyLoading() {
    try {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    try {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    } catch (error) {
                        console.error('Erro no lazy loading de imagem:', error);
                    }
                });
            });
            
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
            
            console.log('Lazy loading configurado para', lazyImages.length, 'imagens');
        } else {
            console.log('IntersectionObserver não suportado');
        }
    } catch (error) {
        console.error('Erro ao configurar lazy loading:', error);
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
    } catch (error) {
        console.error('Erro no DOMContentLoaded:', error);
    }
});

// Garantir que o menu mobile funcione após carregamento completo
window.addEventListener('load', function() {
    try {
        // Re-configurar menu mobile para garantir funcionamento
        setTimeout(() => {
            setupMobileMenu();
            console.log('Menu mobile reconfigurado após load completo');
        }, 100);
    } catch (error) {
        console.error('Erro no window load:', error);
    }
});