// Função para obter nome da categoria em português
function getCategoryName(category) {
    const categoryNames = {
        'shorts': 'Shorts',
        'camisas': 'Camisas',
        'calcas': 'Calças',
        'dry-fits': 'Dry Fits',
        'meias': 'Meias',
        'acessorios': 'Acessórios',
        'outros': 'Outros'
    };
    return categoryNames[category] || category;
}
async function checkGoogleDriveConfig() {
    try {
        // Verificar se o backend está funcionando
        const response = await fetch(`${GOOGLE_DRIVE_CONFIG.BACKEND_API_URL.replace('/produtos', '/status')}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log(`✅ Backend conectado! Pasta: "${data.folder}"`);
                return true;
            }
        }
        
        console.warn('⚠️ Backend não está respondendo corretamente');
        return false;
    } catch (error) {
        console.error('❌ Erro ao conectar com backend:', error);
        console.log('💡 Certifique-se que o servidor Node.js está rodando');
        return false;
    }
}

// Função principal de inicialização
async function initializeApp() {
    console.log('🚀 Inicializando GF Store...');
    
    try {
        // Inicializar Google Auth se estiver no ambiente Node.js
        if (typeof require !== 'undefined') {
            initializeGoogleDriveAuth();
        }
        
        // Verificar configuração do backend
        const backendOk = await checkGoogleDriveConfig();
        if (!backendOk) {
            console.warn('⚠️ Backend não configurado. Usando modo de fallback.');
        }
        
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
        
        console.log('✅ GF Store inicializada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante a inicialização:', error);
    }
}

async function createProductCardFromDrive(file, productInfo, category = '') {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = category;
    card.dataset.promotion = productInfo.isPromotion;
    
    // Obter URL da imagem do Google Drive
    const driveImageUrl = getGoogleDriveImageUrl(file);
    
    // Determinar imagem de fallback baseada na categoria
    let fallbackImageUrl;
    switch(category) {
        case 'shorts':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop';
            break;
        case 'camisas':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop';
            break;
        case 'calcas':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop';
            break;
        case 'dry-fits':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop';
            break;
        case 'meias':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop';
            break;
        case 'acessorios':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop';
            break;
        default:
            fallbackImageUrl = 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop';
    }
    
    // Verificar qual URL de imagem usar
    const finalImageUrl = await createImageWithFallback(driveImageUrl, productInfo.name, fallbackImageUrl);
    
    // Adicionar badge de promoção se aplicável
    const promotionBadge = productInfo.isPromotion ? '<div class="promotion-badge">PROMOÇÃO</div>' : '';
    
    // Calcular desconto se for promoção
    let discountPercentage = '';
    if (productInfo.isPromotion && productInfo.originalPrice) {
        const originalValue = parseFloat(productInfo.originalPrice.replace('R$ ', '').replace(',', '.'));
        const currentValue = parseFloat(productInfo.price.replace('R$ ', '').replace(',', '.'));
        const discount = Math.round(((originalValue - currentValue) / originalValue) * 100);
        discountPercentage = `<div class="discount-badge" style="position: absolute; top: 10px; right: 10px; background: #27ae60; color: white; padding: 5px 8px; font-size: 0.7rem; border-radius: 50%; font-weight: bold; min-width: 35px; text-align: center; z-index: 10;">-${discount}%</div>`;
    }
    
    card.innerHTML = `
        ${promotionBadge}
        ${discountPercentage}
        <div class="product-image">
            <img src="${finalImageUrl}" alt="${productInfo.name}" loading="lazy" 
                 onerror="this.src='${fallbackImageUrl}'" 
                 onload="this.classList.add('loaded')"
                 crossorigin="anonymous">
            <div class="product-actions">
                <div class="action-btn" title="Favoritar" onclick="toggleFavorite(this, '${productInfo.name}')">
                    <i class="far fa-heart"></i>
                </div>
                <div class="action-btn" title="Visualização rápida" onclick="quickView('${file.name}', '${productInfo.name}', '${productInfo.price}', '${productInfo.originalPrice || ''}', '${finalImageUrl}')">
                    <i class="far fa-eye"></i>
                </div>
                <div class="action-btn" title="Compartilhar" onclick="shareProduct('${productInfo.name}')">
                    <i class="fas fa-share-alt"></i>
                </div>
            </div>
            <div class="product-overlay">
                <button class="quick-order-btn" onclick="encomendar('${productInfo.name}')" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: #25d366; color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; opacity: 0; transition: opacity 0.3s ease; z-index: 10;">
                    <i class="fab fa-whatsapp"></i>
                    Encomendar Rápido
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3>${productInfo.name}</h3>
            ${category ? `<span class="product-category" data-category="${category}">${getCategoryName(category)}</span>` : ''}
            <div class="product-rating">
                <div class="stars">
                    ${'★'.repeat(5)}
                </div>
                <span class="rating-count">(${Math.floor(Math.random() * 50) + 10})</span>
            </div>
            <div class="price-container">
                ${productInfo.originalPrice ? `<span class="price-original">${productInfo.originalPrice}</span>` : ''}
                <span class="${productInfo.originalPrice ? 'price-discount' : 'price'}">${productInfo.price}</span>
            </div>
            <div class="product-options">
                <div class="quantity-selector" style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; width: fit-content; overflow: hidden; margin: 1rem 0;">
                    <button onclick="decreaseQuantity(this)" style="background-color: var(--accent-color); border: none; padding: 0.6rem 0.8rem; cursor: pointer; font-size: 1.1rem; font-weight: 600; transition: var(--transition); color: var(--primary-color); min-width: 35px; display: flex; align-items: center; justify-content: center;">-</button>
                    <input type="number" value="1" min="1" max="10" style="border: none; width: 60px; padding: 0.6rem 0.5rem; text-align: center; font-size: 1rem; font-weight: 500; background-color: white; outline: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd;">
                    <button onclick="increaseQuantity(this)" style="background-color: var(--accent-color); border: none; padding: 0.6rem 0.8rem; cursor: pointer; font-size: 1.1rem; font-weight: 600; transition: var(--transition); color: var(--primary-color); min-width: 35px; display: flex; align-items: center; justify-content: center;">+</button>
                </div>
            </div>
            <button class="add-to-cart" onclick="encomendar('${productInfo.name}')" data-product="${productInfo.name}">
                <i class="fab fa-whatsapp"></i>
                Encomendar agora
            </button>
        </div>
    `;
    
    return card;
}

// Função para carregar produtos até R$ 6,00 (mantida para compatibilidade)
function loadBudgetProducts() {
    // Filtrar produtos com preço até 6 reais
    console.log('Carregando produtos até R$ 6,00...');
    
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    showLoadingState(productsContainer);
    
    setTimeout(async () => {
        try {
            // Buscar todos os produtos se ainda não foram carregados
            if (allProductsCache.length === 0) {
                const files = await fetchAllProducts();
                allProductsCache = files.filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i));
            }
            
            // Filtrar produtos até R$ 6,00
            const budgetProducts = allProductsCache.filter(file => {
                const productInfo = parseProductFileName(file.name);
                const price = parseFloat(productInfo.price.replace('R$ ', '').replace(',', '.'));
                return price <= 6.00;
            });
            
            productsContainer.innerHTML = '';
            
            if (budgetProducts.length === 0) {
                productsContainer.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #666;">
                        <h3>Nenhum produto encontrado</h3>
                        <p>Não há produtos até R$ 6,00 disponíveis no momento.</p>
                    </div>
                `;
                return;
            }
            
            budgetProducts.forEach(file => {
                const category = categorizeProductFromFileName(file.name);
                const productInfo = parseProductFileName(file.name);
                const card = createProductCardFromDrive(file, productInfo, category);
                productsContainer.appendChild(card);
            });
            
            animateProductCards();
        } catch (error) {
            console.error('Erro ao carregar produtos até R$ 6,00:', error);
            productsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <h3>Erro ao carregar produtos</h3>
                    <p>Tente novamente mais tarde.</p>
                </div>
            `;
        }
    }, 600);
}

// Função para carregar produtos até R$ 6,00 por categoria (mantida para compatibilidade)
function loadBudgetProductsByCategory(category) {
    console.log(`Carregando produtos até R$ 6,00 da categoria ${category}...`);
    
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    showLoadingState(productsContainer);
    
    setTimeout(async () => {
        try {
            // Buscar todos os produtos se ainda não foram carregados
            if (allProductsCache.length === 0) {
                const files = await fetchAllProducts();
                allProductsCache = files.filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i));
            }
            
            // Filtrar produtos da categoria até R$ 6,00
            const budgetCategoryProducts = allProductsCache.filter(file => {
                const detectedCategory = categorizeProductFromFileName(file.name);
                const productInfo = parseProductFileName(file.name);
                const price = parseFloat(productInfo.price.replace('R$ ', '').replace(',', '.'));
                return detectedCategory === category && price <= 6.00;
            });
            
            productsContainer.innerHTML = '';
            
            if (budgetCategoryProducts.length === 0) {
                productsContainer.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #666;">
                        <h3>Nenhum produto encontrado</h3>
                        <p>Não há produtos de "${getCategoryName(category)}" até R$ 6,00 disponíveis.</p>
                    </div>
                `;
                return;
            }
            
            budgetCategoryProducts.forEach(file => {
                const productInfo = parseProductFileName(file.name);
                const card = createProductCardFromDrive(file, productInfo, category);
                productsContainer.appendChild(card);
            });
            
            animateProductCards();
        } catch (error) {
            console.error('Erro ao carregar produtos até R$ 6,00 por categoria:', error);
            productsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <h3>Erro ao carregar produtos</h3>
                    <p>Tente novamente mais tarde.</p>
                </div>
            `;
        }
    }, 400);
}

// Função para carregar produtos dinamicamente (versão para home)
async function loadProducts() {
    try {
        // Buscar todos os produtos se ainda não foram carregados
        if (allProductsCache.length === 0) {
            const files = await fetchAllProducts();
            allProductsCache = files.filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i));
        }
        
        const productsContainer = document.getElementById('products-container');
        const promotionsContainer = document.getElementById('promotions-container');
        
        if (productsContainer) {
            // Carregar alguns produtos normais (não promoções) para a seção "Novidades"
            const regularProducts = allProductsCache.filter(file => {
                const productInfo = parseProductFileName(file.name);
                return !productInfo.isPromotion;
            }).slice(0, 8); // Pegar apenas os primeiros 8 produtos
            
            regularProducts.forEach(file => {
                const category = categorizeProductFromFileName(file.name);
                const productInfo = parseProductFileName(file.name);
                const card = createProductCardFromDrive(file, productInfo, category);
                productsContainer.appendChild(card);
            });
        }
        
        if (promotionsContainer) {
            // Carregar produtos em promoção para a seção "Promoções"
            const promotionProducts = allProductsCache.filter(file => {
                const productInfo = parseProductFileName(file.name);
                return productInfo.isPromotion;
            }).slice(0, 6); // Pegar apenas os primeiros 6 produtos em promoção
            
            promotionProducts.forEach(file => {
                const category = categorizeProductFromFileName(file.name);
                const productInfo = parseProductFileName(file.name);
                const card = createProductCardFromDrive(file, productInfo, category);
                promotionsContainer.appendChild(card);
            });
        }
        
        // Animar cards após carregamento
        setTimeout(animateProductCards, 100);
        
    } catch (error) {
        console.error('Erro ao carregar produtos para home:', error);
        
        // Fallback: usar produtos estáticos se houver erro
        const produtos = [
            { name: 'Shorts Moletom Cinza', price: 'R$ 49,90', category: 'shorts' },
            { name: 'Camisa Social Branca', price: 'R$ 89,90', category: 'camisas' },
            { name: 'Calça Jeans Skinny', price: 'R$ 119,90', category: 'calcas' },
            { name: 'Dry Fit Básica Preta', price: 'R$ 34,90', category: 'dry-fits' }
        ];
        
        const productsContainer = document.getElementById('products-container');
        if (productsContainer) {
            produtos.forEach(produto => {
                const card = createFallbackProductCard(produto);
                productsContainer.appendChild(card);
            });
        }
    }
}

// Função auxiliar para criar card de produto fallback
function createFallbackProductCard(produto) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = produto.category;
    
    // Determinar imagem baseada na categoria
    let imageUrl;
    switch(produto.category) {
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
            imageUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop';
            break;
        default:
            imageUrl = 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop';
    }
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${imageUrl}" alt="${produto.name}" loading="lazy">
            <div class="product-actions">
                <div class="action-btn" title="Favoritar" onclick="toggleFavorite(this, '${produto.name}')">
                    <i class="far fa-heart"></i>
                </div>
                <div class="action-btn" title="Compartilhar" onclick="shareProduct('${produto.name}')">
                    <i class="fas fa-share-alt"></i>
                </div>
            </div>
        </div>
        <div class="product-info">
            <h3>${produto.name}</h3>
            <span class="product-category" data-category="${produto.category}">${getCategoryName(produto.category)}</span>
            <div class="product-rating">
                <div class="stars">${'★'.repeat(5)}</div>
                <span class="rating-count">(${Math.floor(Math.random() * 50) + 10})</span>
            </div>
            <div class="price-container">
                <span class="price">${produto.price}</span>
            </div>
            <button class="add-to-cart" onclick="encomendar('${produto.name}')" data-product="${produto.name}">
                <i class="fab fa-whatsapp"></i>
                Encomendar agora
            </button>
        </div>
    `;
    
    return card;
}// Slideshow functionality for hero section
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

// Configuração do Google Drive (Frontend apenas)
const GOOGLE_DRIVE_CONFIG = {
    // ID da pasta "GF Store/Produtos" no Google Drive
    PRODUTOS_FOLDER_ID: '1BWvBU037bgDLEEluzrHI32DQnMSMWtSq',
    
    // API Key do Google Drive (crie uma no Google Cloud Console)
    API_KEY: 'AIzaSyADp8urxhRNRIud_GZuqNugf2KQZj2GGNc',
    
    // URLs base da API
    API_BASE_URL: 'https://www.googleapis.com/drive/v3'
};

// Cache para produtos carregados
let productCache = {};
let categoryCache = {};
let allProductsCache = [];

// Função para buscar todos os produtos da pasta "GF Store/Produtos"
async function fetchAllProducts() {
    try {
        const url = `${GOOGLE_DRIVE_CONFIG.API_BASE_URL}/files?q='${GOOGLE_DRIVE_CONFIG.PRODUTOS_FOLDER_ID}'+in+parents&key=${GOOGLE_DRIVE_CONFIG.API_KEY}&fields=files(id,name,webViewLink,webContentLink,thumbnailLink,mimeType)`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Filtrar apenas arquivos de imagem
        const imageFiles = (data.files || []).filter(file => 
            file.name && file.name.match(/\.(jpg|jpeg|png|webp)$/i)
        );
        
        console.log(`📁 Encontrados ${imageFiles.length} produtos`);
        return imageFiles;
    } catch (error) {
        console.error('Erro ao buscar produtos do Google Drive:', error);
        return [];
    }
}

// Função para obter URL de visualização da imagem do Google Drive
function getGoogleDriveImageUrl(file) {
    // Método 1: URL direta de visualização (mais confiável)
    if (file.id) {
        return `https://drive.google.com/uc?id=${file.id}&export=view`;
    }
    
    // Método 2: Thumbnail em alta resolução (backup)
    if (file.thumbnailLink) {
        return file.thumbnailLink.replace('=s220', '=s800');
    }
    
    // Método 3: Fallback para imagem padrão
    return 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop';
}

// Função para verificar se a imagem do Google Drive carrega corretamente
function createImageWithFallback(imageUrl, alt, fallbackUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = function() {
            // Imagem carregou com sucesso
            resolve(imageUrl);
        };
        
        img.onerror = function() {
            // Erro ao carregar, usar fallback
            console.warn(`Erro ao carregar imagem: ${imageUrl}`);
            resolve(fallbackUrl || 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop');
        };
        
        img.src = imageUrl;
    });
}

// Função para processar e categorizar produtos baseado no nome do arquivo
function categorizeProductFromFileName(fileName) {
    const lowerName = fileName.toLowerCase();
    
    // Detectar categoria baseada no início do nome do arquivo
    if (lowerName.startsWith('shorts-')) return 'shorts';
    if (lowerName.startsWith('camisas-')) return 'camisas';
    if (lowerName.startsWith('calcas-')) return 'calcas';
    if (lowerName.startsWith('dryfits-') || lowerName.startsWith('dry-fits-')) return 'dry-fits';
    if (lowerName.startsWith('meias-')) return 'meias';
    if (lowerName.startsWith('acessorios-')) return 'acessorios';
    
    // Se não conseguir detectar pela categoria, tentar por palavras-chave
    if (lowerName.includes('short') || lowerName.includes('bermuda')) return 'shorts';
    if (lowerName.includes('camisa') || lowerName.includes('polo')) return 'camisas';
    if (lowerName.includes('calca') || lowerName.includes('jeans')) return 'calcas';
    if (lowerName.includes('dryfit') || lowerName.includes('dry-fit')) return 'dry-fits';
    if (lowerName.includes('meia') || lowerName.includes('sock')) return 'meias';
    if (lowerName.includes('cinto') || lowerName.includes('carteira') || lowerName.includes('relogio') || lowerName.includes('bone')) return 'acessorios';
    
    // Categoria padrão se não conseguir detectar
    return 'outros';
}

// Função para processar nome do arquivo e extrair informações do produto
function parseProductFileName(fileName) {
    // Remove extensão
    const nameWithoutExt = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    
    // Divide por hífen
    const parts = nameWithoutExt.split('-');
    
    if (parts.length < 3) {
        return {
            name: nameWithoutExt.replace(/-/g, ' '),
            price: 'R$ 0,00',
            originalPrice: null,
            isPromotion: false
        };
    }
    
    // Verifica se é promoção (tem dois preços)
    const lastPart = parts[parts.length - 1];
    const secondLastPart = parts[parts.length - 2];
    
    const hasPrice1 = lastPart.match(/\d+\.\d+/);
    const hasPrice2 = secondLastPart.match(/\d+\.\d+/);
    
    if (hasPrice1 && hasPrice2) {
        // É promoção: Categoria-Nome-PreçoOriginal-PreçoDesconto
        const productName = parts.slice(1, -2).join(' ');
        const originalPrice = 'R$ ' + secondLastPart.replace('.', ',');
        const price = 'R$ ' + lastPart.replace('.', ',');
        
        return {
            name: productName,
            price: price,
            originalPrice: originalPrice,
            isPromotion: true
        };
    } else if (hasPrice1) {
        // Produto normal: Categoria-Nome-Preço
        const productName = parts.slice(1, -1).join(' ');
        const price = 'R$ ' + lastPart.replace('.', ',');
        
        return {
            name: productName,
            price: price,
            originalPrice: null,
            isPromotion: false
        };
    } else {
        // Sem preço identificado
        return {
            name: parts.slice(1).join(' '),
            price: 'R$ 0,00',
            originalPrice: null,
            isPromotion: false
        };
    }
}

// Função para verificar se a configuração do Google Drive está correta
async function checkGoogleDriveConfig() {
    if (GOOGLE_DRIVE_CONFIG.PRODUTOS_FOLDER_ID === 'SUA_PASTA_PRODUTOS_ID_AQUI' || 
        GOOGLE_DRIVE_CONFIG.API_KEY === 'SUA_API_KEY_AQUI') {
        console.warn('⚠️ Configuração do Google Drive não foi definida!');
        console.log('📋 Para configurar:');
        console.log('1. Substitua PRODUTOS_FOLDER_ID pelo ID da pasta "GF Store/Produtos"');
        console.log('2. Substitua API_KEY pela sua chave da API do Google Drive');
        console.log('3. Certifique-se que a pasta tem permissão pública de visualização');
        return false;
    }
    
    try {
        // Teste simples para verificar se a API está funcionando
        const testUrl = `${GOOGLE_DRIVE_CONFIG.API_BASE_URL}/files/${GOOGLE_DRIVE_CONFIG.PRODUTOS_FOLDER_ID}?key=${GOOGLE_DRIVE_CONFIG.API_KEY}&fields=name`;
        const response = await fetch(testUrl);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Google Drive conectado com sucesso! Pasta: "${data.name}"`);
            return true;
        } else {
            console.error('❌ Erro na configuração do Google Drive:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao conectar com Google Drive:', error);
        return false;
    }
}

// Função utilitária para obter ID da pasta do Google Drive pela URL
function extractFolderIdFromUrl(url) {
    // Extrai ID de URLs como: https://drive.google.com/drive/folders/ID_DA_PASTA
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    if (match) {
        return match[1];
    }
    console.warn('URL inválida. Use uma URL no formato: https://drive.google.com/drive/folders/ID_DA_PASTA');
    return null;
}

// Função para carregar produtos de uma categoria específica do Google Drive
async function loadCategoryProducts(category) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // Verificar cache primeiro
    if (categoryCache[category]) {
        renderProductsFromCache(categoryCache[category], productsContainer);
        setTimeout(() => {
            setupFiltersAndSort();
        }, 100);
        return;
    }
    
    // Mostrar loading
    showLoadingState(productsContainer);
    
    try {
        // Buscar todos os produtos se ainda não foram carregados
        if (allProductsCache.length === 0) {
            const files = await fetchAllProducts();
            allProductsCache = files;
        }
        
        // Filtrar produtos da categoria específica
        const categoryProducts = allProductsCache.filter(file => {
            const detectedCategory = categorizeProductFromFileName(file.name);
            return detectedCategory === category;
        });
        
        if (categoryProducts.length === 0) {
            productsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <h3>Nenhum produto encontrado</h3>
                    <p>Ainda não há produtos na categoria "${getCategoryName(category)}".</p>
                    <p style="font-size: 0.9rem; margin-top: 1rem;">Certifique-se que as imagens estão na pasta do Google Drive com o padrão: <br><code>${category.charAt(0).toUpperCase() + category.slice(1)}-Nome-Produto-Preço.jpg</code></p>
                </div>
            `;
            return;
        }
        
        // Limpar container
        productsContainer.innerHTML = '';
        let allProducts = [];
        
        // Processar cada arquivo da categoria
        for (const file of categoryProducts) {
            try {
                const productInfo = parseProductFileName(file.name);
                const card = await createProductCardFromDrive(file, productInfo, category);
                allProducts.push(card);
                productsContainer.appendChild(card);
                
                console.log(`✅ Produto carregado: ${productInfo.name}`);
            } catch (error) {
                console.error(`❌ Erro ao processar produto ${file.name}:`, error);
            }
        }
        
        // Salvar no cache
        categoryCache[category] = allProducts;
        
        // Adicionar animação de entrada
        animateProductCards();
        
        // Configurar filtros após carregar produtos
        setTimeout(() => {
            setupFiltersAndSort();
        }, 600);
        
        console.log(`📦 Carregados ${allProducts.length} produtos da categoria ${category}`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        productsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <h3>Erro ao carregar produtos</h3>
                <p>Verifique a configuração do Google Drive:</p>
                <ul style="text-align: left; display: inline-block; margin-top: 1rem;">
                    <li>A pasta está pública?</li>
                    <li>A API Key está correta?</li>
                    <li>O ID da pasta está correto?</li>
                </ul>
                <p style="margin-top: 1rem;"><small>Erro: ${error.message}</small></p>
            </div>
        `;
    }
}

// Função para carregar todos os produtos de todas as categorias
async function loadAllProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // Mostrar loading
    showLoadingState(productsContainer);
    
    try {
        // Buscar todos os produtos se ainda não foram carregados
        if (allProductsCache.length === 0) {
            const files = await fetchAllProducts();
            allProductsCache = files.filter(file => file.name.match(/\.(jpg|jpeg|png|webp)$/i));
        }
        
        // Limpar container
        productsContainer.innerHTML = '';
        
        // Processar todos os produtos
        allProductsCache.forEach(file => {
            const category = categorizeProductFromFileName(file.name);
            const productInfo = parseProductFileName(file.name);
            const card = createProductCardFromDrive(file, productInfo, category);
            productsContainer.appendChild(card);
        });
        
        // Adicionar animação de entrada
        animateProductCards();
        
        // Configurar filtros após carregar produtos
        setTimeout(() => {
            setupFiltersAndSort();
        }, 850);
        
    } catch (error) {
        console.error('Erro ao carregar todos os produtos:', error);
        productsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <h3>Erro ao carregar produtos</h3>
                <p>Tente novamente mais tarde ou verifique a configuração do Google Drive.</p>
            </div>
        `;
    }
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

// Função para criar um card de produto (mantida para compatibilidade com código legado)
function createProductCard(filename, isPromotion, category = '') {
    // Esta função é mantida para compatibilidade, mas não será mais usada
    // com a integração do Google Drive
    console.warn('createProductCard (legado) chamada. Use createProductCardFromDrive para Google Drive.');
    
    const productInfo = parseProductFileName(filename);
    const mockFile = { 
        name: filename, 
        id: 'mock-id',
        thumbnailLink: null
    };
    
    return createProductCardFromDrive(mockFile, productInfo, category);
}

// Função para verificar se a configuração do Google Drive está correta
async function checkGoogleDriveConfig() {
    if (GOOGLE_DRIVE_CONFIG.PRODUTOS_FOLDER_ID === 'SUA_PASTA_PRODUTOS_ID_AQUI' || 
        GOOGLE_DRIVE_CONFIG.API_KEY === 'SUA_API_KEY_AQUI') {
        console.warn('⚠️ Configuração do Google Drive não foi definida!');
        console.log('📋 Para configurar:');
        console.log('1. Substitua PRODUTOS_FOLDER_ID pelo ID da pasta "GF Store/Produtos"');
        console.log('2. Substitua API_KEY pela sua chave da API do Google Drive');
        console.log('3. Certifique-se que a pasta tem permissão pública de visualização');
        return false;
    }
    
    try {
        // Teste simples para verificar se a API está funcionando
        const testUrl = `${GOOGLE_DRIVE_CONFIG.API_BASE_URL}/files/${GOOGLE_DRIVE_CONFIG.PRODUTOS_FOLDER_ID}?key=${GOOGLE_DRIVE_CONFIG.API_KEY}&fields=name`;
        const response = await fetch(testUrl);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Google Drive conectado com sucesso! Pasta: "${data.name}"`);
            return true;
        } else {
            console.error('❌ Erro na configuração do Google Drive:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao conectar com Google Drive:', error);
        return false;
    }
}

// Função utilitária para obter ID da pasta do Google Drive pela URL
function extractFolderIdFromUrl(url) {
    // Extrai ID de URLs como: https://drive.google.com/drive/folders/ID_DA_PASTA
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    if (match) {
        return match[1];
    }
    console.warn('URL inválida. Use uma URL no formato: https://drive.google.com/drive/folders/ID_DA_PASTA');
    return null;

    const categoryNames = {
        'shorts': 'Shorts',
        'camisas': 'Camisas',
        'calcas': 'Calças',
        'dry-fits': 'Dry Fits',
        'meias': 'Meias',
        'acessorios': 'Acessórios',
        'outros': 'Outros'
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

function quickView(filename, productName, price, originalPrice, imageUrl) {
    const modal = document.getElementById('quick-view-modal') || createQuickViewModal();
    
    // Usar a imagem real do Google Drive se disponível, senão usar fallback
    const modalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop';
    
    modal.querySelector('.modal-image img').src = modalImageUrl;
    modal.querySelector('.modal-title').textContent = productName;
    modal.querySelector('.modal-price').innerHTML = originalPrice ? 
        `<span class="price-original">${originalPrice}</span> <span class="price-discount">${price}</span>` : 
        `<span class="price">${price}</span>`;
    
    // Atualizar botão de encomendar com o nome do produto
    const orderBtn = modal.querySelector('.btn-primary');
    if (orderBtn) {
        orderBtn.setAttribute('onclick', `encomendar('${productName}'); closeModal();`);
    }
    
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
async function initializeApp() {
    console.log('🚀 Inicializando GF Store...');
    
    try {
        // Verificar configuração do Google Drive
        const driveConfigOk = await checkGoogleDriveConfig();
        if (!driveConfigOk) {
            console.warn('⚠️ Google Drive não configurado corretamente. Usando modo de fallback.');
        }
        
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
        
        console.log('✅ GF Store inicializada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante a inicialização:', error);
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
