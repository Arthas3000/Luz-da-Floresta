// ==========================================
// CONFIGURAÇÕES GLOBAIS
// ==========================================
const LINK_LOJA = "https://wa.me/5511999999999?text=Olá, quero saber sobre a pedra ";

let bancoDeDados = {};
let meuAltar = JSON.parse(localStorage.getItem('altarLuzFloresta')) || { colecao: [], desejo:[] };

const signosZodiaco =['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
const chakrasLista =['Básico', 'Sacral', 'Plexo Solar', 'Cardíaco', 'Laríngeo', 'Frontal', 'Coronário'];

// Imagem genérica para caso falte a foto de alguma pedra na pasta
const IMG_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%238B7355' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='12 2 2 7 12 12 22 7 12 2'/%3E%3Cpolyline points='2 17 12 22 22 17'/%3E%3Cpolyline points='2 12 12 17 22 12'/%3E%3C/svg%3E";

// ==========================================
// INICIALIZAÇÃO DO APP
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await carregarDados();
    
    // Chamada comentada para forçar apenas o tema claro
    // configurarTema(); 
    
    configurarNavegacao();
    configurarFiltros();
    configurarAltar();
    renderizarCatalogo();
    configurarSorteioDia();
    
    document.getElementById('close-modal').addEventListener('click', fecharCard);
});

async function carregarDados() {
    try {
        const response = await fetch('data.json');
        bancoDeDados = await response.json();
    } catch (error) { 
        console.error("Erro ao carregar o banco de dados", error); 
    }
}

// ==========================================
// INTERFACE E COMPORTAMENTO
// ==========================================

/* 
// Função de tema comentada para manter o app apenas no modo claro.
// Descomente no futuro se quiser reativar a funcionalidade.
function configurarTema() {
    const btn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) html.classList.add('dark');
    btn.addEventListener('click', () => html.classList.toggle('dark'));
}
*/

function configurarNavegacao() {
    const botoes = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.tab-content');

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            views.forEach(v => v.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');

            botoes.forEach(b => {
                b.classList.remove('active-tab');
                b.classList.add('opacity-50');
                b.style.color = 'inherit';
            });
            btn.classList.add('active-tab');
            btn.classList.remove('opacity-50');
            btn.style.color = 'var(--accent-green)';

            if(target === 'view-altar') atualizarAbaAltar();
        });
    });
    document.querySelector('.active-tab').style.color = 'var(--accent-green)';
}

// ==========================================
// HAPTICS (VIBRAÇÃO TÁTIL)
// ==========================================
function vibrarSuspense() {
    if ("vibrate" in navigator) navigator.vibrate([100, 500, 100, 800, 100, 400, 100, 500, 150, 200, 150, 250, 200, 100, 200, 100, 500]);
}

function vibrarImpacto() {
    if ("vibrate" in navigator) navigator.vibrate([100, 30, 50]);
}

// ==========================================
// LÓGICA DO MEU ALTAR (Local Storage)
// ==========================================
function salvarAltar() {
    localStorage.setItem('altarLuzFloresta', JSON.stringify(meuAltar));
}

function toggleAltarItem(idCristal, tipo) {
    const outroTipo = tipo === 'colecao' ? 'desejo' : 'colecao';
    
    meuAltar[outroTipo] = meuAltar[outroTipo].filter(id => id !== idCristal);
    
    if (meuAltar[tipo].includes(idCristal)) {
        meuAltar[tipo] = meuAltar[tipo].filter(id => id !== idCristal);
    } else {
        meuAltar[tipo].push(idCristal);
        if ("vibrate" in navigator) navigator.vibrate(30); 
    }
    
    salvarAltar();
    abrirCard(idCristal); 
    if(!document.getElementById('view-altar').classList.contains('hidden')){
        atualizarAbaAltar();
    }
}

let abaAltarAtual = 'colecao';
function configurarAltar() {
    const btnColecao = document.getElementById('btn-colecao');
    const btnDesejos = document.getElementById('btn-desejos');

    btnColecao.onclick = () => {
        abaAltarAtual = 'colecao';
        btnColecao.classList.remove('opacity-60', 'bg-transparent');
        btnColecao.classList.add('bg-white', 'dark:bg-gray-900', 'shadow-sm');
        btnDesejos.classList.add('opacity-60', 'bg-transparent');
        btnDesejos.classList.remove('bg-white', 'dark:bg-gray-900', 'shadow-sm');
        atualizarAbaAltar();
    };

    btnDesejos.onclick = () => {
        abaAltarAtual = 'desejo';
        btnDesejos.classList.remove('opacity-60', 'bg-transparent');
        btnDesejos.classList.add('bg-white', 'dark:bg-gray-900', 'shadow-sm');
        btnColecao.classList.add('opacity-60', 'bg-transparent');
        btnColecao.classList.remove('bg-white', 'dark:bg-gray-900', 'shadow-sm');
        atualizarAbaAltar();
    };
}

function atualizarAbaAltar() {
    gerarHTMLLista(meuAltar[abaAltarAtual], 'altar-results', true, "Seu altar de cristais está vazio por enquanto.");
}

// ==========================================
// RENDERIZAÇÃO DO CARD E LISTAS (Sincrono Local)
// ==========================================
function abrirCard(idCristal) {
    const pedra = bancoDeDados[idCristal];
    if (!pedra) return;

    const modal = document.getElementById('modal-card');
    const cardContainer = document.getElementById('card-container');
    const content = document.getElementById('modal-content');

    const taNaColecao = meuAltar.colecao.includes(idCristal);
    const taNoDesejo = meuAltar.desejo.includes(idCristal);

    const btnColecaoClass = taNaColecao ? "bg-emerald-600 text-white border-transparent" : "bg-transparent border-gray-400 text-gray-500 dark:text-gray-400";
    const btnDesejoClass = taNoDesejo ? "bg-purple-600 text-white border-transparent" : "bg-transparent border-gray-400 text-gray-500 dark:text-gray-400";

    const imgSrc = pedra.imagem_url || IMG_PLACEHOLDER;

    content.innerHTML = `
        <div class="h-60 w-full bg-cover bg-center rounded-t-2xl relative bg-gray-100 dark:bg-gray-800" style="background-image: url('${imgSrc}')">
        </div>
        <div class="p-5 pb-6">
            <h2 class="text-3xl font-serif font-bold mb-1" style="color: var(--text-main);">${pedra.nome}</h2>
            <p class="text-xs font-bold uppercase tracking-widest mb-4" style="color: var(--accent-green);">Chakra: ${pedra.chakra || "Geral"}</p>
            
            <!-- Botões do Altar -->
            <div class="flex gap-2 mb-6">
                <button onclick="toggleAltarItem('${idCristal}', 'colecao')" class="flex-1 py-2.5 text-xs font-bold rounded-xl border transition-colors flex items-center justify-center gap-1 ${btnColecaoClass}">
                    <i data-lucide="check-circle" class="w-4 h-4"></i> ${taNaColecao ? "Na Coleção" : "Já Tenho"}
                </button>
                <button onclick="toggleAltarItem('${idCristal}', 'desejo')" class="flex-1 py-2.5 text-xs font-bold rounded-xl border transition-colors flex items-center justify-center gap-1 ${btnDesejoClass}">
                    <i data-lucide="heart" class="w-4 h-4"></i> ${taNoDesejo ? "Desejado" : "Eu Quero"}
                </button>
            </div>
            
            <div class="space-y-4 text-sm" style="color: var(--text-muted);">
                <div>
                    <h3 class="font-bold uppercase tracking-wider text-xs mb-1" style="color: var(--accent-green);">Energia</h3>
                    <p style="color: var(--text-main); leading-relaxed">${pedra.energia}</p>
                </div>
                
                <!-- Sanfona expansível de Cuidados -->
                <details class="group p-4 rounded-xl border transition-all" style="background-color: var(--bg-color); border-color: var(--border-color);">
                    <summary class="font-bold text-xs uppercase tracking-wider flex justify-between items-center outline-none cursor-pointer" style="color: var(--text-main);">
                        Como Cuidar <i data-lucide="chevron-down" class="w-4 h-4 group-open:rotate-180 transition-transform text-emerald-600"></i>
                    </summary>
                    <div class="pt-3 mt-3 border-t space-y-3 text-xs leading-relaxed" style="border-color: var(--border-color);">
                        <p><strong style="color: var(--accent-green);">Limpeza:</strong> ${pedra.cuidados?.limpeza || "Informação não disponível."}</p>
                        <p><strong style="color: var(--accent-green);">Energização:</strong> ${pedra.cuidados?.energizacao || "Informação não disponível."}</p>
                        <p><strong style="color: var(--accent-green);">Combinar com:</strong> ${pedra.cuidados?.combinacao || "Informação não disponível."}</p>
                    </div>
                </details>

                <a href="${LINK_LOJA}${pedra.nome}" target="_blank" class="mt-4 w-full block text-center py-3 rounded-xl text-white font-bold transition-opacity hover:opacity-90 shadow-md" style="background-color: var(--accent-green);">
                    Ver Joias na Loja
                </a>
            </div>
        </div>
    `;

    lucide.createIcons();
    modal.classList.remove('hidden');
    
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        cardContainer.classList.remove('opacity-0');
        cardContainer.classList.add('drop-in');
        vibrarImpacto();
    }, 10);
}

function fecharCard() {
    const modal = document.getElementById('modal-card');
    const cardContainer = document.getElementById('card-container');
    modal.classList.add('opacity-0');
    cardContainer.classList.remove('drop-in');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function gerarHTMLLista(arrayIds, containerId, formatoGrid = false, msgVazio = "Nenhum cristal encontrado.") {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if(arrayIds.length === 0) {
        container.innerHTML = `<p class="text-center py-4 col-span-2 text-sm" style="color: var(--text-muted);">${msgVazio}</p>`;
        return;
    }

    arrayIds.forEach(id => {
        const p = bancoDeDados[id];
        const card = document.createElement('div');
        const imgSrc = p.imagem_url || IMG_PLACEHOLDER;
        
        if(formatoGrid) {
            card.className = "crystal-card rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col";
            card.innerHTML = `
                <div class="h-32 bg-cover bg-center border-b relative bg-gray-100 dark:bg-gray-800" style="background-image: url('${imgSrc}'); border-color: var(--border-color);">
                    ${meuAltar.colecao.includes(id) ? '<i data-lucide="check-circle" class="absolute top-2 right-2 text-emerald-500 bg-white dark:bg-gray-900 rounded-full w-5 h-5 shadow-sm"></i>' : ''}
                    ${meuAltar.desejo.includes(id) ? '<i data-lucide="heart" class="absolute top-2 right-2 text-purple-500 bg-white dark:bg-gray-900 rounded-full w-5 h-5 shadow-sm"></i>' : ''}
                </div>
                <p class="p-3 text-center font-bold text-sm truncate w-full px-2" style="color: var(--text-main);">${p.nome}</p>
            `;
        } else {
            card.className = "crystal-card flex items-center gap-4 p-2 rounded-xl cursor-pointer active:scale-95 transition-transform";
            card.innerHTML = `
                <div class="h-16 w-16 rounded-lg bg-cover bg-center flex-shrink-0 bg-gray-100 dark:bg-gray-800" style="background-image: url('${imgSrc}')"></div>
                <div class="flex-1 pr-2 min-w-0">
                    <h4 class="font-bold text-sm truncate" style="color: var(--text-main);">${p.nome}</h4>
                    <p class="text-xs truncate w-full" style="color: var(--text-muted);">${p.energia}</p>
                </div>
            `;
        }
        card.onclick = () => abrirCard(id);
        container.appendChild(card);
    });
    
    lucide.createIcons();
}

function renderizarCatalogo() {
    gerarHTMLLista(Object.keys(bancoDeDados), 'catalogo-results', true);
}

// ==========================================
// ABA DE EXPLORAÇÃO (Filtros & Buscas)
// ==========================================
function configurarFiltros() {
    const input = document.getElementById('search-input');
    const btnSignos = document.getElementById('tab-signos');
    const btnChakras = document.getElementById('tab-chakras');
    const contSignos = document.getElementById('signos-container');
    const contChakras = document.getElementById('chakras-container');

    input.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        if(termo === '') {
            document.getElementById('explorar-results').innerHTML = '';
            return;
        }
        const filtrados = Object.keys(bancoDeDados).filter(id => 
            bancoDeDados[id].nome.toLowerCase().includes(termo) || 
            bancoDeDados[id].energia.toLowerCase().includes(termo)
        );
        gerarHTMLLista(filtrados, 'explorar-results', false);
    });

    btnSignos.onclick = () => {
        contSignos.classList.remove('hidden');
        contChakras.classList.add('hidden');
        btnSignos.style.borderColor = 'var(--accent-green)'; btnSignos.style.color = 'var(--accent-green)';
        btnChakras.style.borderColor = 'var(--border-color)'; btnChakras.style.color = 'var(--text-muted)';
    };

    btnChakras.onclick = () => {
        contChakras.classList.remove('hidden');
        contSignos.classList.add('hidden');
        btnChakras.style.borderColor = 'var(--accent-green)'; btnChakras.style.color = 'var(--accent-green)';
        btnSignos.style.borderColor = 'var(--border-color)'; btnSignos.style.color = 'var(--text-muted)';
    };

    const gridSignos = document.getElementById('signos-grid');
    signosZodiaco.forEach(signo => {
        const btn = document.createElement('button');
        btn.className = "py-2 rounded-lg text-xs font-bold border transition-colors";
        btn.style.backgroundColor = 'var(--card-bg)'; btn.style.borderColor = 'var(--border-color)'; btn.style.color = 'var(--text-muted)';
        btn.innerText = signo;
        btn.onclick = () => {
            document.querySelectorAll('#signos-grid button').forEach(b => {
                b.style.borderColor = 'var(--border-color)'; b.style.color = 'var(--text-muted)'; b.style.backgroundColor = 'var(--card-bg)';
            });
            btn.style.borderColor = 'var(--accent-green)'; btn.style.color = 'var(--accent-green)'; btn.style.backgroundColor = 'var(--bg-color)';
            
            const filtrados = Object.keys(bancoDeDados).filter(id => bancoDeDados[id].signos.includes(signo));
            gerarHTMLLista(filtrados, 'explorar-results', false);
        };
        gridSignos.appendChild(btn);
    });

    const gridChakras = document.getElementById('chakras-grid');
    chakrasLista.forEach(chakra => {
        const btn = document.createElement('button');
        btn.className = "py-2 rounded-lg text-xs font-bold border transition-colors";
        btn.style.backgroundColor = 'var(--card-bg)'; btn.style.borderColor = 'var(--border-color)'; btn.style.color = 'var(--text-muted)';
        btn.innerText = chakra;
        btn.onclick = () => {
            document.querySelectorAll('#chakras-grid button').forEach(b => {
                b.style.borderColor = 'var(--border-color)'; b.style.color = 'var(--text-muted)'; b.style.backgroundColor = 'var(--card-bg)';
            });
            btn.style.borderColor = 'var(--accent-green)'; btn.style.color = 'var(--accent-green)'; btn.style.backgroundColor = 'var(--bg-color)';

            const filtrados = Object.keys(bancoDeDados).filter(id => bancoDeDados[id].chakra?.includes(chakra));
            gerarHTMLLista(filtrados, 'explorar-results', false);
        };
        gridChakras.appendChild(btn);
    });
}

// ==========================================
// SORTEIO (CRISTAL DO DIA)
// ==========================================
function configurarSorteioDia() {
    const btn = document.getElementById('btn-sortear');
    btn.addEventListener('click', () => {
        vibrarSuspense();
        btn.innerHTML = `<i data-lucide="loader-2" class="animate-spin"></i> Sintonizando Energia...`;
        lucide.createIcons();
        
        setTimeout(() => {
            const chaves = Object.keys(bancoDeDados);
            const chaveSorteada = chaves[Math.floor(Math.random() * chaves.length)];
            abrirCard(chaveSorteada);
            
            setTimeout(() => {
                btn.innerHTML = `<i data-lucide="sparkles"></i> Revelar Novo Cristal`;
                lucide.createIcons();
            }, 500);
        }, 1500);
    });
}

// ==========================================
// REGISTRO DO SERVICE WORKER (PWA offline)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('App instalado com sucesso no Service Worker!');
            })
            .catch(err => {
                console.error('Falha ao instalar o Service Worker:', err);
            });
    });
}
