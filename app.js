// ==========================================
// 🔴 MODO ADMIN: COLE O LINK DA IA AQUI 🔴
// ==========================================
const URL_DO_MODELO = ""; // Ex: "https://teachablemachine.withgoogle.com/models/SuaChave/"

// Link do seu WhatsApp/Loja para os clientes comprarem
const LINK_LOJA = "https://wa.me/5511999999999?text=Olá, quero saber sobre joias com a pedra ";

// Variáveis Globais
let bancoDeDados = {};
const signosZodiaco = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await carregarDados();
    configurarNavegacao();
    configurarPesquisa();
    configurarSignos();
    renderizarCatalogo();
    configurarCamera();
    
    // Fechar modal
    document.getElementById('close-modal').addEventListener('click', fecharCard);
});

// 1. CARREGAR JSON
async function carregarDados() {
    try {
        const response = await fetch('data.json');
        bancoDeDados = await response.json();
    } catch (error) {
        console.error("Erro ao carregar data.json", error);
    }
}

// 2. NAVEGAÇÃO DE ABAS (SPA)
function configurarNavegacao() {
    const botoes = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.tab-content');

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            views.forEach(v => v.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');

            botoes.forEach(b => {
                b.classList.remove('text-emerald-500');
                b.classList.add('text-gray-500');
            });
            btn.classList.remove('text-gray-500');
            btn.classList.add('text-emerald-500');
        });
    });
}

// 3. RENDERIZAR CARTA DE TAROT (CARD DO CRISTAL)
function abrirCard(idCristal) {
    const pedra = bancoDeDados[idCristal];
    if (!pedra) return;

    const modal = document.getElementById('modal-card');
    const content = document.getElementById('modal-content');

    const tagsSignos = pedra.signos.map(s => 
        `<span class="px-2 py-1 bg-purple-900/40 text-purple-300 text-[10px] uppercase font-bold rounded border border-purple-700">${s}</span>`
    ).join('');

    content.innerHTML = `
        <div class="h-64 w-full bg-cover bg-center rounded-t-2xl relative" style="background-image: url('${pedra.imagem_url}')">
            <div class="absolute inset-0 bg-gradient-to-t from-[#1e2621] via-transparent to-transparent"></div>
        </div>
        <div class="p-6 -mt-8 relative z-10">
            <h2 class="text-3xl font-serif font-bold text-emerald-400 text-glow mb-2">${pedra.nome}</h2>
            <div class="flex flex-wrap gap-2 mb-6">${tagsSignos}</div>
            
            <div class="space-y-4 text-sm text-gray-300">
                <div>
                    <h3 class="text-emerald-500 font-bold uppercase tracking-wider text-xs mb-1"><i data-lucide="sparkles" class="inline w-3 h-3 mr-1"></i> Magia & Energia</h3>
                    <p>${pedra.energia}</p>
                </div>
                <div class="bg-[#121815] p-3 rounded-lg border border-gray-800">
                    <h3 class="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Dica de Uso</h3>
                    <p class="text-emerald-100">${pedra.sugestao_uso}</p>
                </div>
                <div>
                    <h3 class="text-teal-600 font-bold uppercase tracking-wider text-xs mb-1"><i data-lucide="globe" class="inline w-3 h-3 mr-1"></i> Origem & Geologia</h3>
                    <p>${pedra.origem}</p>
                    <p class="mt-1 text-gray-500 text-xs">${pedra.geologia}</p>
                </div>
            </div>

            <!-- Botão de Venda -->
            <a href="${LINK_LOJA}${pedra.nome}" target="_blank" class="mt-6 w-full block text-center py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors">
                Encontrar Joias Místicas
            </a>
        </div>
    `;

    lucide.createIcons();
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 50);
}

function fecharCard() {
    const modal = document.getElementById('modal-card');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// 4. LISTAGENS (Catálogo, Busca, Signos)
function gerarHTMLLista(arrayIds, containerId, formatoGrid = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if(arrayIds.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-center py-4 col-span-2">Nenhum cristal revelado.</p>`;
        return;
    }

    arrayIds.forEach(id => {
        const p = bancoDeDados[id];
        const card = document.createElement('div');
        
        if(formatoGrid) {
            // Formato quadradinho para o catálogo
            card.className = "bg-[#1e2621] rounded-xl overflow-hidden border border-gray-800 cursor-pointer hover:border-emerald-500 transition-colors";
            card.innerHTML = `
                <div class="h-24 bg-cover bg-center" style="background-image: url('${p.imagem_url}')"></div>
                <p class="p-2 text-center font-bold text-sm text-gray-200">${p.nome}</p>
            `;
        } else {
            // Formato linha para buscas e signos
            card.className = "flex items-center gap-4 bg-[#1e2621] p-2 rounded-xl border border-gray-800 cursor-pointer hover:border-emerald-500 transition-colors";
            card.innerHTML = `
                <div class="h-16 w-16 rounded-lg bg-cover bg-center flex-shrink-0" style="background-image: url('${p.imagem_url}')"></div>
                <div>
                    <h4 class="font-bold text-emerald-400">${p.nome}</h4>
                    <p class="text-xs text-gray-400 truncate w-48">${p.energia}</p>
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
        btn.className = "py-2 bg-[#1e2621] border border-gray-800 rounded-lg text-xs font-bold text-gray-400 hover:text-purple-400 hover:border-purple-500 transition-colors";
        btn.innerText = signo;
        btn.onclick = () => {
            // Efeito visual de ativo
            document.querySelectorAll('#signos-grid button').forEach(b => b.classList.replace('text-purple-400', 'text-gray-400'));
            document.querySelectorAll('#signos-grid button').forEach(b => b.classList.replace('border-purple-500', 'border-gray-800'));
            btn.classList.replace('text-gray-400', 'text-purple-400');
            btn.classList.replace('border-gray-800', 'border-purple-500');
            
            // Filtrar
            const filtrados = Object.keys(bancoDeDados).filter(id => bancoDeDados[id].signos.includes(signo));
            gerarHTMLLista(filtrados, 'signos-results', false);
        };
        grid.appendChild(btn);
    });
}

// 5. INTELIGÊNCIA ARTIFICIAL (CÂMERA)
function configurarCamera() {
    const btn = document.getElementById('btn-camera');
    const wrapper = document.getElementById('webcam-wrapper');
    const loadingMagic = document.getElementById('loading-magic');
    const feedback = document.getElementById('feedback-text');
    let modelo, webcam, loopAtivo = false;

    btn.addEventListener('click', async () => {
        if(loopAtivo) return;

        if(!URL_DO_MODELO) {
            alert("Aviso: A Inteligência Artificial ainda não foi conectada (Modo Admin). Exibindo Cristal Aleatório para teste visual.");
            animacaoMagia("ametista"); // Simula que achou uma ametista
            return;
        }

        try {
            btn.innerHTML = `<i data-lucide="loader" class="animate-spin"></i> Conectando Aura...`;
            lucide.createIcons();
            
            const modelURL = URL_DO_MODELO + "model.json";
            const metadataURL = URL_DO_MODELO + "metadata.json";
            
            modelo = await tmImage.load(modelURL, metadataURL);
            
            webcam = new tmImage.Webcam(300, 400, false); 
            await webcam.setup({ facingMode: "environment" }); // Usa câmera traseira do celular
            await webcam.play();
            
            wrapper.innerHTML = "";
            wrapper.appendChild(webcam.canvas);
            wrapper.classList.remove('hidden');
            
            loopAtivo = true;
            window.requestAnimationFrame(loop);
            
            btn.innerHTML = `<i data-lucide="eye"></i> Analisando Câmera`;
            lucide.createIcons();

        } catch (error) {
            console.error(error);
            alert("Permita o acesso à câmera para usar o oráculo.");
            btn.innerHTML = `<i data-lucide="camera"></i> Abrir Oráculo`;
            lucide.createIcons();
        }
    });

    async function loop() {
        if (!loopAtivo) return;
        webcam.update();
        await prever();
        window.requestAnimationFrame(loop);
    }

    async function prever() {
        const predicoes = await modelo.predict(webcam.canvas);
        
        let melhorProbabilidade = 0;
        let cristalDetectado = "";

        // Acha a maior probabilidade
        for (let i = 0; i < predicoes.length; i++) {
            if (predicoes[i].probability > melhorProbabilidade) {
                melhorProbabilidade = predicoes[i].probability;
                cristalDetectado = predicoes[i].className;
            }
        }

        // Se tiver mais de 85% de certeza
        if (melhorProbabilidade > 0.85) {
            loopAtivo = false; // Para a câmera
            webcam.stop();
            
            // Transforma o nome vindo da IA (ex: "Quartzo Rosa") em ID do JSON (ex: "quartzo-rosa")
            const idFormatado = cristalDetectado.toLowerCase().replace(/\s+/g, '-');
            
            // Dispara a animação
            animacaoMagia(idFormatado);
        } else {
            feedback.innerText = "Aproxime a pedra ou melhore a luz...";
        }
    }

    function animacaoMagia(idCristal) {
        // Esconde botão e mostra animação
        btn.classList.add('hidden');
        feedback.innerText = "";
        loadingMagic.classList.remove('hidden');
        loadingMagic.classList.add('flex');
        
        // Espera 2 segundos para dar o efeito "Uau"
        setTimeout(() => {
            loadingMagic.classList.add('hidden');
            loadingMagic.classList.remove('flex');
            wrapper.classList.add('hidden'); // Esconde câmera
            
            btn.classList.remove('hidden');
            btn.innerHTML = `<i data-lucide="camera"></i> Novo Escaneamento`;
            lucide.createIcons();

            // Checa se o cristal existe no data.json
            if(bancoDeDados[idCristal]) {
                abrirCard(idCristal);
            } else {
                alert(`Cristal identificado como "${idCristal}", mas ainda não temos informações dele no nosso Livro Sagrado (data.json).`);
            }
        }, 2000); // 2 segundos
    }
}