const LINK_LOJA = "https://wa.me/5511999999999?text=Olá, quero saber sobre joias com a pedra ";
let bancoDeDados = {};
const signosZodiaco = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];

document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await carregarDados();
    configurarTema();
    configurarNavegacao();
    configurarPesquisa();
    configurarSignos();
    renderizarCatalogo();
    configurarSorteioDia(); // Nova função pro Cristal do Dia
    
    document.getElementById('close-modal').addEventListener('click', fecharCard);
});

// Tema Dark/Light
function configurarTema() {
    const btn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Verifica preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
    }

    btn.addEventListener('click', () => {
        html.classList.toggle('dark');
    });
}

// Carrega o JSON
async function carregarDados() {
    try {
        const response = await fetch('data.json');
        bancoDeDados = await response.json();
    } catch (error) {
        console.error("Erro ao carregar dados", error);
    }
}

// Navegação Enxuta
function configurarNavegacao() {
    const botoes = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.tab-content');

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            views.forEach(v => v.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');

            // Atualiza opacidade dos botões para indicar o ativo
            botoes.forEach(b => {
                b.classList.remove('active-tab');
                b.classList.add('opacity-50');
                b.style.color = 'inherit';
            });
            btn.classList.add('active-tab');
            btn.classList.remove('opacity-50');
            btn.style.color = 'var(--accent-green)';
        });
    });

    // Pinta o primeiro botão (ativo por padrão)
    document.querySelector('.active-tab').style.color = 'var(--accent-green)';
}

// O Modal do Cristal (Design mais limpo)
function abrirCard(idCristal) {
    const pedra = bancoDeDados[idCristal];
    if (!pedra) return;

    const modal = document.getElementById('modal-card');
    const content = document.getElementById('modal-content');

    const tagsSignos = pedra.signos.map(s => 
        `<span class="px-2 py-1 text-[10px] uppercase font-bold rounded-full" style="background-color: var(--bg-color); color: var(--text-main); border: 1px solid var(--border-color);">${s}</span>`
    ).join('');

    content.innerHTML = `
        <div class="h-60 w-full bg-cover bg-center rounded-t-2xl relative" style="background-image: url('${pedra.imagem_url}')"></div>
        <div class="p-6">
            <h2 class="text-3xl font-serif font-bold mb-3" style="color: var(--text-main);">${pedra.nome}</h2>
            <div class="flex flex-wrap gap-2 mb-6">${tagsSignos}</div>
            
            <div class="space-y-5 text-sm" style="color: var(--text-muted);">
                <div>
                    <h3 class="font-bold uppercase tracking-wider text-xs mb-1" style="color: var(--accent-green);">
                        <i data-lucide="sparkles" class="inline w-3 h-3 mr-1"></i> Energia Principal
                    </h3>
                    <p style="color: var(--text-main);">${pedra.energia}</p>
                </div>
                <div class="p-4 rounded-xl" style="background-color: var(--bg-color); border: 1px solid var(--border-color);">
                    <h3 class="font-bold uppercase tracking-wider text-xs mb-1" style="color: var(--text-main);">Dica de Uso</h3>
                    <p>${pedra.sugestao_uso}</p>
                </div>
                <div>
                    <h3 class="font-bold uppercase tracking-wider text-xs mb-1" style="color: var(--text-main);">
                        <i data-lucide="globe" class="inline w-3 h-3 mr-1"></i> Origem
                    </h3>
                    <p>${pedra.origem}</p>
                </div>
            </div>

            <a href="${LINK_LOJA}${pedra.nome}" target="_blank" class="mt-6 w-full block text-center py-3 rounded-xl text-white font-bold transition-opacity hover:opacity-90 shadow-md" style="background-color: var(--accent-green);">
                Procurar na Loja
            </a>
        </div>
    `;

    lucide.createIcons();
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function fecharCard() {
    const modal = document.getElementById('modal-card');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// Renderizadores de Listas
function gerarHTMLLista(arrayIds, containerId, formatoGrid = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if(arrayIds.length === 0) {
        container.innerHTML = `<p class="text-center py-4 col-span-2" style="color: var(--text-muted);">Nenhum cristal encontrado.</p>`;
        return;
    }

    arrayIds.forEach(id => {
        const p = bancoDeDados[id];
        const card = document.createElement('div');
        
        if(formatoGrid) {
            card.className = "crystal-card rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform flex flex-col";
            card.innerHTML = `
                <div class="h-28 bg-cover bg-center border-b" style="background-image: url('${p.imagem_url}'); border-color: var(--border-color);"></div>
                <p class="p-3 text-center font-bold text-sm" style="color: var(--text-main);">${p.nome}</p>
            `;
        } else {
            card.className = "crystal-card flex items-center gap-4 p-2 rounded-xl cursor-pointer";
            card.innerHTML = `
                <div class="h-16 w-16 rounded-lg bg-cover bg-center flex-shrink-0" style="background-image: url('${p.imagem_url}')"></div>
                <div class="flex-1 pr-2">
                    <h4 class="font-bold" style="color: var(--text-main);">${p.nome}</h4>
                    <p class="text-xs truncate w-full" style="color: var(--text-muted);">${p.energia}</p>
                </div>
            `;
        }
        card.onclick = () => abrirCard(id);
        container.appendChild(card);
    });
}

function renderizarCatalogo() {
    gerarHTMLLista(Object.keys(bancoDeDados), 'catalogo-results', true);
}

function configurarPesquisa() {
    const input = document.getElementById('search-input');
    input.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = Object.keys(bancoDeDados).filter(id => 
            bancoDeDados[id].nome.toLowerCase().includes(termo) || 
            bancoDeDados[id].energia.toLowerCase().includes(termo)
        );
        gerarHTMLLista(filtrados, 'search-results', false);
    });
}

function configurarSignos() {
    const grid = document.getElementById('signos-grid');
    signosZodiaco.forEach(signo => {
        const btn = document.createElement('button');
        btn.className = "py-2 rounded-lg text-xs font-bold transition-all";
        btn.style.backgroundColor = 'var(--card-bg)';
        btn.style.border = '1px solid var(--border-color)';
        btn.style.color = 'var(--text-muted)';
        btn.innerText = signo;
        
        btn.onclick = () => {
            // Reseta todos
            document.querySelectorAll('#signos-grid button').forEach(b => {
                b.style.borderColor = 'var(--border-color)';
                b.style.color = 'var(--text-muted)';
                b.style.backgroundColor = 'var(--card-bg)';
            });
            // Ativa selecionado
            btn.style.borderColor = 'var(--accent-green)';
            btn.style.color = 'var(--accent-green)';
            btn.style.backgroundColor = 'var(--bg-color)';
            
            const filtrados = Object.keys(bancoDeDados).filter(id => bancoDeDados[id].signos.includes(signo));
            gerarHTMLLista(filtrados, 'signos-results', false);
        };
        grid.appendChild(btn);
    });
}

// Funcionalidade: Sorteio do Cristal do Dia (Substitui a Câmera temporariamente)
function configurarSorteioDia() {
    const btn = document.getElementById('btn-sortear');
    btn.addEventListener('click', () => {
        // Efeito de carregamento
        btn.innerHTML = `<i data-lucide="loader" class="animate-spin"></i> Sintonizando...`;
        lucide.createIcons();
        
        setTimeout(() => {
            const chaves = Object.keys(bancoDeDados);
            const chaveSorteada = chaves[Math.floor(Math.random() * chaves.length)];
            abrirCard(chaveSorteada);
            
            // Restaura botão
            setTimeout(() => {
                btn.innerHTML = `<i data-lucide="sparkles"></i> Revelar Meu Cristal`;
                lucide.createIcons();
            }, 500);
        }, 1200); // 1.2 segundos de "suspense"
    });
}
