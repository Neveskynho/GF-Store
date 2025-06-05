// ===== PARTE 1: CONFIGURAÇÕES E FUNÇÕES UTILITÁRIAS =====

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

// Função melhorada para obter URL de visualização da imagem do Google Drive
function getGoogleDriveImageUrl(file) {
    if (!file || !file.id) {
        console.warn('Arquivo sem ID válido:', file);
        return null;
    }
    
    // Usar URL de thumbnail que é mais estável
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h400`;
    
    console.log(`📸 URL da imagem gerada para ${file.name}:`, thumbnailUrl);
    
    return thumbnailUrl;
}

// Função para verificar se a imagem carrega e aplicar fallback
async function createImageWithFallback(driveImageUrl, productName, fallbackUrl) {
    return new Promise((resolve) => {
        // Se não há URL do Drive, usar fallback imediatamente
        if (!driveImageUrl) {
            console.warn(`Sem URL do Drive para ${productName}, usando fallback`);
            resolve(fallbackUrl);
            return;
        }
        
        const img = new Image();
        
        // Timeout mais curto para evitar carregamento infinito
        const timeout = setTimeout(() => {
            console.warn(`⏰ Timeout na imagem do Drive para ${productName}, usando fallback`);
            resolve(fallbackUrl);
        }, 3000); // 3 segundos apenas
        
        img.onload = function() {
            clearTimeout(timeout);
            console.log(`✅ Imagem do Drive carregada com sucesso: ${productName}`);
            resolve(driveImageUrl);
        };
        
        img.onerror = function() {
            clearTimeout(timeout);
            console.warn(`❌ Erro ao carregar imagem do Drive para ${productName}, usando fallback`);
            resolve(fallbackUrl);
        };
        
        // Tentar carregar a imagem
        img.src = driveImageUrl;
    });
}

// Função para lidar com erro de carregamento de imagem
function handleImageError(img) {
    console.warn(`❌ Erro ao carregar imagem: ${img.src}`);
    
    // Usar diretamente o fallback sem mais tentativas
    const fallbackUrl = img.dataset.fallbackUrl;
    if (fallbackUrl && img.src !== fallbackUrl) {
        console.log('🔄 Usando imagem de fallback...');
        img.src = fallbackUrl;
        img.style.opacity = '1'; // Garantir que aparece
    } else {
        // Última tentativa com uma imagem genérica
        img.src = 'https://via.placeholder.com/400x400/e0e0e0/666666?text=Produto';
        img.style.opacity = '1';
    }
}

// Função para lidar com sucesso no carregamento de imagem
function handleImageLoad(img) {
    console.log(`✅ Imagem carregada com sucesso: ${img.alt}`);
    img.classList.add('loaded');
    img.style.opacity = '1'; // Garantir visibilidade
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

// ===== PARTE 2: FUNÇÕES DE API E CRIAÇÃO DE CARDS =====

// Função para testar conectividade com Google Drive
async function testGoogleDriveConnection() {
    try {
        console.log('🔍 Testando conexão com Google Drive...');
        
        const testUrl = `${GOOGLE_DRIVE_CONFIG.API_BASE_URL}/files?q='${GOOGLE_DRIVE_CONFIG.PRODUTOS_FOLDER_ID}'+in+parents&key=${GOOGLE_DRIVE_CONFIG.API_KEY}&fields=files(id,name)&pageSize=1`;
        
        const response = await fetch(testUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            console.log('✅ Conexão com Google Drive OK');
            console.log('📁 Primeira arquivo encontrado:', data.files[0].name);
            
            // Testar URL de imagem do primeiro arquivo
            const testFile = data.files[0];
            const imageUrl = getGoogleDriveImageUrl(testFile);
            console.log('🖼️ URL de teste da imagem:', imageUrl);
            
            return true;
        } else {
            console.warn('⚠️ Pasta do Google Drive está vazia');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar Google Drive:', error);
        return false;
    }
}

// Função melhorada para buscar todos os produtos com debugging
async function fetchAllProductsWithDebug() {
    try {
        console.log('📂 Buscando produtos do Google Drive...');
        console.log('🔧 Configuração:', {
            folderId: GOOGLE_DRIVE_CONFIG.PRODUTOS_FOLDER_ID,
            apiKey: GOOGLE_DRIVE_CONFIG.API_KEY ? '***' + GOOGLE_DRIVE_CONFIG.API_KEY.slice(-4) : 'NÃO DEFINIDA'
        });
        
        const url = `${GOOGLE_DRIVE_CONFIG.API_BASE_URL}/files?q='${GOOGLE_DRIVE_CONFIG.PRODUTOS_FOLDER_ID}'+in+parents&key=${GOOGLE_DRIVE_CONFIG.API_KEY}&fields=files(id,name,webViewLink,webContentLink,thumbnailLink,mimeType,size)`;
        
        console.log('🌐 URL da requisição:', url.replace(GOOGLE_DRIVE_CONFIG.API_KEY, '***'));
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro HTTP:', response.status, response.statusText);
            console.error('📄 Resposta:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📊 Resposta completa da API:', data);
        
        // Filtrar apenas arquivos de imagem
        const imageFiles = (data.files || []).filter(file => {
            const isImage = file.name && file.name.match(/\.(jpg|jpeg|png|webp)$/i);
            if (!isImage) {
                console.log(`⏭️ Ignorando arquivo não-imagem: ${file.name}`);
            }
            return isImage;
        });
        
        console.log(`📁 Total de arquivos encontrados: ${data.files?.length || 0}`);
        console.log(`🖼️ Arquivos de imagem válidos: ${imageFiles.length}`);
        
        // Log detalhado de cada arquivo de imagem
        imageFiles.forEach((file, index) => {
            console.log(`📸 Arquivo ${index + 1}:`, {
                name: file.name,
                id: file.id,
                size: file.size,
                mimeType: file.mimeType
            });
        });
        
        return imageFiles;
    } catch (error) {
        console.error('❌ Erro ao buscar produtos do Google Drive:', error);
        return [];
    }
}

// Função original mantida para compatibilidade
async function fetchAllProducts() {
    return await fetchAllProductsWithDebug();
}

// Função para debug de uma imagem específica
async function debugImageLoad(file) {
    console.log(`🔍 Debug da imagem: ${file.name}`);
    
    const driveUrl = getGoogleDriveImageUrl(file);
    console.log(`📎 URL gerada: ${driveUrl}`);
    
    // Testar carregamento
    return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = function() {
            console.log(`✅ Imagem carregou com sucesso: ${file.name}`);
            console.log(`📐 Dimensões: ${this.naturalWidth}x${this.naturalHeight}`);
            resolve(true);
        };
        
        img.onerror = function() {
            console.error(`❌ Erro ao carregar imagem: ${file.name}`);
            console.log(`🔧 Tentando URLs alternativas...`);
            
            // Testar URL alternativa
            const alternativeUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h300`;
            const img2 = new Image();
            
            img2.onload = function() {
                console.log(`✅ URL alternativa funcionou: ${file.name}`);
                resolve(true);
            };
            
            img2.onerror = function() {
                console.error(`❌ URL alternativa também falhou: ${file.name}`);
                resolve(false);
            };
            
            img2.src = alternativeUrl;
        };
        
        img.src = driveUrl;
    });
}

// Função corrigida para criar card de produto do Google Drive
function createProductCardFromDriveSync(file, productInfo, category = '') {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = category;
    card.dataset.promotion = productInfo.isPromotion;
    card.dataset.productId = file.id; // Adicionar ID único para evitar duplicação
    
    console.log(`🔄 Criando card para: ${productInfo.name} (ID: ${file.id})`);
    
    // Obter URL da imagem do Google Drive
    const driveImageUrl = getGoogleDriveImageUrl(file);
    
    // Determinar imagem de fallback baseada na categoria
    let fallbackImageUrl;
    switch(category) {
        case 'shorts':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop';
            break;
        case 'camisas':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=400&fit=crop';
            break;
        case 'calcas':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop';
            break;
        case 'dry-fits':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop';
            break;
        case 'meias':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop';
            break;
        case 'acessorios':
            fallbackImageUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop';
            break;
        default:
            fallbackImageUrl = 'https://via.placeholder.com/400x400/e0e0e0/666666?text=Produto';
    }
    
    // Usar a imagem do Drive se disponível, senão fallback
    const finalImageUrl = driveImageUrl || fallbackImageUrl;
    
    console.log(`🖼️ URL da imagem para ${productInfo.name}:`, finalImageUrl);
    
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
            <img src="${finalImageUrl}" 
                 alt="${productInfo.name}" 
                 loading="eager"
                 data-drive-url="${driveImageUrl || ''}"
                 data-fallback-url="${fallbackImageUrl}"
                 onerror="handleImageError(this)" 
                 onload="handleImageLoad(this)"
                 style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px 8px 0 0; opacity: 1;">
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
}

// ===== PARTE 3: FUNÇÕES PRINCIPAIS E INTERFACE =====

// Função principal corrigida para carregar produtos com debug completo
async function loadCategoryProductsFixed(category) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    console.log(`🚀 Carregando produtos da categoria: ${category}`);
    
    // Mostrar loading
    showLoadingState(productsContainer);
    
    try {
        // Testar conexão primeiro
        const connectionOk = await testGoogleDriveConnection();
        if (!connectionOk) {
            throw new Error('Falha na conexão com Google Drive');
        }
        
        // Buscar todos os produtos com debug
        const files = await fetchAllProductsWithDebug();
        
        if (files.length === 0) {
            productsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <h3>Nenhum arquivo encontrado</h3>
                    <p>Verifique se há imagens na pasta do Google Drive.</p>
                    <p><small>Pasta ID: ${GOOGLE_DRIVE_CONFIG.PRODUTOS_FOLDER_ID}</small></p>
                </div>
            `;
            return;
        }
        
        // CORREÇÃO: Remover duplicatas baseado no ID do arquivo
        const uniqueFiles = [];
        const seenIds = new Set();
        
        files.forEach(file => {
            if (!seenIds.has(file.id)) {
                seenIds.add(file.id);
                uniqueFiles.push(file);
            } else {
                console.log(`⚠️ Arquivo duplicado ignorado: ${file.name} (ID: ${file.id})`);
            }
        });
        
        console.log(`📁 Arquivos únicos: ${uniqueFiles.length} de ${files.length} total`);
        
        // Filtrar produtos da categoria específica
        const categoryProducts = uniqueFiles.filter(file => {
            const detectedCategory = categorizeProductFromFileName(file.name);
            const matchesCategory = category === 'all' || detectedCategory === category;
            
            if (matchesCategory) {
                console.log(`✅ Produto incluído: ${file.name} -> categoria: ${detectedCategory}`);
            }
            
            return matchesCategory;
        });
        
        console.log(`📦 Produtos encontrados para categoria ${category}: ${categoryProducts.length}`);
        
        if (categoryProducts.length === 0) {
            productsContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <h3>Nenhum produto encontrado</h3>
                    <p>Ainda não há produtos na categoria "${getCategoryName(category)}".</p>
                    <p style="font-size: 0.9rem; margin-top: 1rem;">
                        Em breve, novos produtos estarão disponíveis nesta categoria. <br>
                    </p>
                </div>
            `;
            return;
        }
        
        // Limpar container
        productsContainer.innerHTML = '';
        
        // CORREÇÃO: Processar cada arquivo sem async para evitar problemas
        categoryProducts.forEach((file, index) => {
            try {
                console.log(`🔄 Processando produto ${index + 1}/${categoryProducts.length}: ${file.name}`);
                
                const detectedCategory = categorizeProductFromFileName(file.name);
                const productInfo = parseProductFileName(file.name);
                
                // Usar a categoria detectada, não a passada como parâmetro
                const finalCategory = category === 'all' ? detectedCategory : category;
                
                const card = createProductCardFromDriveSync(file, productInfo, finalCategory);
                productsContainer.appendChild(card);
                
                console.log(`✅ Card criado para: ${productInfo.name} (categoria: ${finalCategory})`);
            } catch (error) {
                console.error(`❌ Erro ao processar produto ${file.name}:`, error);
            }
        });
        
        // Adicionar animação de entrada
        setTimeout(() => {
            animateProductCards();
        }, 100);
        
        console.log(`🎉 Carregamento concluído! ${categoryProducts.length} produtos carregados.`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        productsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <h3>Erro ao carregar produtos</h3>
                <p>Detalhes do erro: ${error.message}</p>
                <button onclick="loadCategoryProductsFixed('${category}')" style="margin-top: 1rem; padding: 10px 20px; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Tentar novamente
                </button>
            </div>
        `;
    }
}

function removeDuplicateProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    const cards = productsContainer.querySelectorAll('.product-card');
    const seenIds = new Set();
    let duplicatesRemoved = 0;
    
    cards.forEach(card => {
        const productId = card.dataset.productId;
        if (seenIds.has(productId)) {
            card.remove();
            duplicatesRemoved++;
        } else {
            seenIds.add(productId);
        }
    });
    
    if (duplicatesRemoved > 0) {
        console.log(`🧹 Removidas ${duplicatesRemoved} duplicatas do DOM`);
    }
}

// Função para carregar produtos de uma categoria específica (versão original corrigida)
async function loadCategoryProducts(category) {
    return await loadCategoryProductsFixed(category);
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
        for (const file of allProductsCache) {
            const category = categorizeProductFromFileName(file.name);
            const productInfo = parseProductFileName(file.name);
            const card = await createProductCardFromDrive(file, productInfo, category);
            productsContainer.appendChild(card);
        }
        
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
            
            for (const file of regularProducts) {
                const category = categorizeProductFromFileName(file.name);
                const productInfo = parseProductFileName(file.name);
                const card = await createProductCardFromDrive(file, productInfo, category);
                productsContainer.appendChild(card);
            }
        }
        
        if (promotionsContainer) {
            // Carregar produtos em promoção para a seção "Promoções"
            const promotionProducts = allProductsCache.filter(file => {
                const productInfo = parseProductFileName(file.name);
                return productInfo.isPromotion;
            }).slice(0, 6); // Pegar apenas os primeiros 6 produtos em promoção
            
            for (const file of promotionProducts) {
                const category = categorizeProductFromFileName(file.name);
                const productInfo = parseProductFileName(file.name);
                const card = await createProductCardFromDrive(file, productInfo, category);
                promotionsContainer.appendChild(card);
            }
        }
        
        // Animar cards após carregamento
        setTimeout(animateProductCards, 100);
        
    } catch (error) {
        console.error('Erro ao carregar produtos para home:', error);
        
        // Fallback: usar produtos estáticos se houver erro
        const produtos = [];
        
        const productsContainer = document.getElementById('products-container');
        if (productsContainer) {
            produtos.forEach(produto => {
                const card = createFallbackProductCard(produto);
                productsContainer.appendChild(card);
            });
        }
    }
}

// Função para carregar produtos até R$ 6,00
async function loadBudgetProducts() {
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
            
            for (const file of budgetProducts) {
                const category = categorizeProductFromFileName(file.name);
                const productInfo = parseProductFileName(file.name);
                const card = await createProductCardFromDrive(file, productInfo, category);
                productsContainer.appendChild(card);
            }
            
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

// Função para carregar produtos até R$ 6,00 por categoria
async function loadBudgetProductsByCategory(category) {
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
            
            for (const file of budgetCategoryProducts) {
                const productInfo = parseProductFileName(file.name);
                const card = await createProductCardFromDrive(file, productInfo, category);
                productsContainer.appendChild(card);
            }
            
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

// Função para verificar se a configuração do Google Drive está correta
async function checkGoogleDriveConfig() {
    try {
        // Verificar se o backend está funcionando
        const response = await fetch(`${GOOGLE_DRIVE_CONFIG.BACKEND_API_URL?.replace('/produtos', '/status') || ''}`);
        
        if (response && response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log(`✅ Backend conectado! Pasta: "${data.folder}"`);
                return true;
            }
        }
        
        console.warn('⚠️ Backend não está respondendo corretamente');
        
        // Fallback: testar conexão direta com Google Drive
        return await testGoogleDriveConnection();
    } catch (error) {
        console.error('❌ Erro ao conectar com backend:', error);
        console.log('💡 Tentando conexão direta com Google Drive...');
        
        // Fallback: testar conexão direta com Google Drive
        return await testGoogleDriveConnection();
    }
}

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
    
    // Remove 'R, espaços e converte vírgula para ponto
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

// 8. FUNÇÃO DE TESTE para depuração
async function debugImageIssues() {
    console.log('🔍 === DEBUG DE PROBLEMAS COM IMAGENS ===\n');
    
    try {
        const files = await fetchAllProductsWithDebug();
        
        if (files.length === 0) {
            console.log('❌ Nenhum arquivo encontrado');
            return;
        }
        
        console.log(`📁 Testando primeiros 3 arquivos de ${files.length} total...\n`);
        
        for (let i = 0; i < Math.min(3, files.length); i++) {
            const file = files[i];
            console.log(`\n📸 === Arquivo ${i + 1}: ${file.name} ===`);
            console.log(`ID: ${file.id}`);
            
            // Testar diferentes URLs
            const thumbnailUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h400`;
            const directUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
            
            console.log(`URL Thumbnail: ${thumbnailUrl}`);
            console.log(`URL Direta: ${directUrl}`);
            
            // Testar carregamento
            await testSingleImage(thumbnailUrl, `${file.name} (thumbnail)`);
            await testSingleImage(directUrl, `${file.name} (direct)`);
        }
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
    }
}

function testSingleImage(url, name) {
    return new Promise((resolve) => {
        const img = new Image();
        const startTime = Date.now();
        
        const timeout = setTimeout(() => {
            console.log(`⏰ TIMEOUT (3s): ${name}`);
            resolve(false);
        }, 3000);
        
        img.onload = function() {
            clearTimeout(timeout);
            const loadTime = Date.now() - startTime;
            console.log(`✅ SUCESSO (${loadTime}ms): ${name} - ${this.naturalWidth}x${this.naturalHeight}`);
            resolve(true);
        };
        
        img.onerror = function() {
            clearTimeout(timeout);
            const loadTime = Date.now() - startTime;
            console.log(`❌ ERRO (${loadTime}ms): ${name}`);
            resolve(false);
        };
        
        img.src = url;
    });
}

// === FUNÇÕES PARA TESTAR NO CONSOLE ===

// Função para testar carregamento de imagens do Google Drive
async function testImageLoading() {
    console.log('🧪 Testando carregamento de imagens...');
    
    try {
        const files = await fetchAllProductsWithDebug();
        if (files.length === 0) {
            console.log('❌ Nenhum arquivo encontrado para teste');
            return;
        }
        
        console.log(`🔍 Testando ${Math.min(3, files.length)} imagens...`);
        
        for (let i = 0; i < Math.min(3, files.length); i++) {
            const file = files[i];
            console.log(`\n📸 Testando: ${file.name}`);
            
            const success = await debugImageLoad(file);
            console.log(`Resultado: ${success ? '✅ Sucesso' : '❌ Falhou'}`);
        }
        
        console.log('\n🎯 Teste de imagens concluído!');
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

// Função para debug completo
async function debugCompleto() {
    console.log('🔧 === DEBUG COMPLETO DO SISTEMA ===\n');
    
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão com Google Drive...');
    const connectionOk = await testGoogleDriveConnection();
    console.log(`Resultado: ${connectionOk ? '✅' : '❌'}\n`);
    
    // 2. Testar busca de arquivos
    console.log('2️⃣ Testando busca de arquivos...');
    const files = await fetchAllProductsWithDebug();
    console.log(`Arquivos encontrados: ${files.length}\n`);
    
    // 3. Testar carregamento de imagens
    console.log('3️⃣ Testando carregamento de imagens...');
    await testImageLoading();
    
    console.log('\n🎉 Debug completo finalizado!');
}

// Exportar funções principais para uso global
window.GFStore = {
    loadCategoryProducts: loadCategoryProductsFixed,
    loadAllProducts,
    loadProducts,
    testConnection: testGoogleDriveConnection,
    debugImages: testImageLoading,
    debugCompleto,
    checkConfig: checkGoogleDriveConfig
};
