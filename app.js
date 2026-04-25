// ==========================================
// DADOS GLOBAIS E CONFIGURAÇÕES
// ==========================================
let dbCrystals = {};
let dbIncenses = {};
let meuAltar = JSON.parse(localStorage.getItem('altarFloresta')) || { colecao: [], desejo:[] };

const IMG_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C0A062' stroke-width='1'%3E%3Cpath d='M12 2L2 12l10 10 10-10L12 2z'/%3E%3C/svg%3E";

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await carregarDados();
    
    configurarNavegacao();
    configurarBuscaEFiltros();
    configurarAltar();
    configurarOraculoTarot();
    configurarQuiz();
    
    document.getElementById('close-item').addEventListener('click', fecharModalItem);
    
    // FUTURE: Aqui você poderia chamar uma função para calcular a fase da lua.
});

async function carregarDados() {
    try {
        const response = await fetch('data.json');
        const dados = await response.json();
        dbCrystals = dados.cristais || {};
        dbIncenses = dados.incensos || {};
        
        // Renderiza tudo na aba explorar inicialmente
        renderizarCatalogo('todos', '');
    } catch (error) { 
        console.error("Erro ao carregar data.json", error); 
    }
}

// ==========================================
// NAVEGAÇÃO BASE
// ==========================================
function configurarNavegacao() {
    const botoes = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.tab-content');

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            views.forEach(v => v.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden', 'opacity-0');

            botoes.forEach(b => {
                b.classList.remove('active-tab');
                b.classList.add('opacity-50');
            });
            btn.classList.add('active-tab');
            btn.classList.remove('opacity-50');

            if(target === 'view-altar') atualizarAbaAltar();
        });
    });
}

function vibrar(tipo) {
    // FUTURE: Sound Healing - Aqui entraria a chamada para um áudio 432Hz.
    if (!("vibrate" in navigator)) return;
    if (tipo === 'click') navigator.vibrate(30);
    if (tipo === 'sucesso') navigator.vibrate([100, 50, 100]);
    if (tipo === 'magica') navigator.vibrate([50, 100, 50, 150, 50, 200]);
}

// ==========================================
// RENDERIZAÇÃO E MODAL (UNIFICADO)
// ==========================================
function obterItem(id) {
    if (dbCrystals[id]) return { ...dbCrystals[id], id, categoria: 'cristal' };
    if (dbIncenses[id]) return { ...dbIncenses[id], id, categoria: 'incenso' };
    return null;
}

function renderizarCardMiniatura(item) {
    const taNaColecao = meuAltar.colecao.includes(item.id);
    const taNoDesejo = meuAltar.desejo.includes(item.id);
    const badgeColor = item.tipo === 'cristal' ? 'bg-[#2E4F2B]' : 'bg-[#C0A062]';
    
    return `
        <div onclick="abrirModalItem('${item.id}')" class="crystal-card rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col relative">
            <div class="absolute top-2 left-2 z-10 text-[9px] text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${badgeColor}">
                ${item.tipo}
            </div>
            ${taNaColecao ? '<i data-lucide="check-circle" class="absolute top-2 right-2 text-green-500 bg-white rounded-full w-5 h-5 z-10 shadow-sm"></i>' : ''}
            ${taNoDesejo ? '<i data-lucide="heart" class="absolute top-2 right-2 text-[#C0A062] bg-white rounded-full w-5 h-5 z-10 shadow-sm"></i>' : ''}
            
            <div class="h-32 bg-cover bg-center border-b relative bg-[#E6E0D4]" style="background-image: url('${item.imagem_url || IMG_PLACEHOLDER}'); background-blend-mode: multiply;"></div>
            <div class="p-3">
                <p class="font-bold text-sm truncate w-full" style="color: var(--text-main);">${item.nome}</p>
                <p class="text-[10px] truncate w-full mt-0.5" style="color: var(--text-muted);">${item.tags?.slice(0,2).join(', ') || ''}</p>
            </div>
        </div>
    `;
}

function abrirModalItem(id) {
    vibrar('click');
    const item = obterItem(id);
    if (!item) return;

    const modal = document.getElementById('modal-item');
    const container = document.getElementById('item-container');
    const content = document.getElementById('item-content');

    const taNaColecao = meuAltar.colecao.includes(id);
    const taNoDesejo = meuAltar.desejo.includes(id);

    const imgSrc = item.imagem_url || IMG_PLACEHOLDER;
    const isCristal = item.tipo === 'cristal';
    const tagInfo = isCristal ? `Chakra: ${item.chakra}` : `Modo de Uso: ${item.como_usar}`;

    // Montando a seção de Sinergia (Cross-selling)
    let sinergiaHTML = '';
    if (item.sinergia) {
        const par = obterItem(item.sinergia);
        if (par) {
            sinergiaHTML = `
                <div class="mt-6 pt-6 border-t" style="border-color: var(--border-color);">
                    <h3 class="font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2" style="color: var(--gold);">
                        <i data-lucide="sparkles" class="w-4 h-4"></i> Sinergia Perfeita
                    </h3>
                    <div onclick="abrirModalItem('${par.id}')" class="flex items-center gap-3 p-3 rounded-xl border border-[#C0A062] cursor-pointer active:scale-95 transition-transform" style="background-color: rgba(192, 160, 98, 0.05);">
                        <div class="w-12 h-12 rounded-lg bg-cover bg-center bg-[#E6E0D4]" style="background-image: url('${par.imagem_url || IMG_PLACEHOLDER}')"></div>
                        <div class="flex-1">
                            <p class="text-xs uppercase text-[#C0A062] font-bold">Combinar com</p>
                            <p class="text-sm font-bold" style="color: var(--text-main);">${par.nome}</p>
                        </div>
                        <i data-lucide="chevron-right" class="w-5 h-5 text-[#C0A062]"></i>
                    </div>
                </div>
            `;
        }
    }

    // HTML de cuidados expansível (Só para cristais)
    let cuidadosHTML = '';
    if (isCristal && item.cuidados) {
        cuidadosHTML = `
            <details class="group p-4 mt-4 rounded-xl border transition-all" style="background-color: var(--bg-color); border-color: var(--border-color);">
                <summary class="font-bold text-xs uppercase tracking-wider flex justify-between items-center outline-none cursor-pointer" style="color: var(--text-main);">
                    Como Cuidar <i data-lucide="chevron-down" class="w-4 h-4 group-open:rotate-180 transition-transform" style="color: var(--accent-green);"></i>
                </summary>
                <div class="pt-3 mt-3 border-t space-y-3 text-xs leading-relaxed" style="border-color: var(--border-color); color: var(--text-muted);">
                    <p><strong style="color: var(--accent-green);">Limpeza:</strong> ${item.cuidados.limpeza}</p>
                    <p><strong style="color: var(--accent-green);">Energização:</strong> ${item.cuidados.energizacao}</p>
                </div>
            </details>
        `;
    }

    content.innerHTML = `
        <div class="h-64 w-full bg-cover bg-center relative bg-[#E6E0D4]" style="background-image: url('${imgSrc}'); border-radius: 24px 24px 0 0;">
            <div class="absolute bottom-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
        </div>
        <div class="px-6 -mt-6 relative z-10">
            <h2 class="text-3xl font-serif font-bold mb-1" style="color: var(--text-main);">${item.nome}</h2>
            <p class="text-xs font-bold uppercase tracking-widest mb-6" style="color: var(--gold);">${tagInfo}</p>
            
            <div class="flex gap-2 mb-6">
                <button onclick="toggleAltarItem('${id}', 'colecao')" class="flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${taNaColecao ? 'bg-[#2E4F2B] text-white' : 'bg-[#E6E0D4] text-[#3E2723]'}">
                    <i data-lucide="check-circle" class="w-4 h-4"></i> ${taNaColecao ? "Na Coleção" : "Já Tenho"}
                </button>
                <button onclick="toggleAltarItem('${id}', 'desejo')" class="flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${taNoDesejo ? 'bg-[#C0A062] text-white' : 'bg-transparent border border-[#C0A062] text-[#C0A062]'}">
                    <i data-lucide="heart" class="w-4 h-4"></i> ${taNoDesejo ? "Desejado" : "Eu Quero"}
                </button>
            </div>
            
            <div class="space-y-4 text-sm text-[#795548] leading-relaxed">
                <p>${item.energia}</p>
                ${cuidadosHTML}
                ${sinergiaHTML}
            </div>
        </div>
    `;

    lucide.createIcons();
    modal.classList.remove('hidden');
    
    // Animação de slide up
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        container.classList.remove('translate-y-full');
    }, 10);
}

function fecharModalItem() {
    const modal = document.getElementById('modal-item');
    const container = document.getElementById('item-container');
    container.classList.add('translate-y-full');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// ==========================================
// ALTAR
// ==========================================
function salvarAltar() { localStorage.setItem('altarFloresta', JSON.stringify(meuAltar)); }

function toggleAltarItem(id, tipo) {
    vibrar('sucesso');
    const outroTipo = tipo === 'colecao' ? 'desejo' : 'colecao';
    meuAltar[outroTipo] = meuAltar[outroTipo].filter(i => i !== id);
    
    if (meuAltar[tipo].includes(id)) meuAltar[tipo] = meuAltar[tipo].filter(i => i !== id);
    else meuAltar[tipo].push(id);
    
    salvarAltar();
    abrirModalItem(id); 
    if(!document.getElementById('view-altar').classList.contains('hidden')) atualizarAbaAltar();
}

let abaAltarAtual = 'colecao';
function configurarAltar() {
    const btnColecao = document.getElementById('btn-colecao');
    const btnDesejos = document.getElementById('btn-desejos');

    const setAtivo = (ativo, inativo, aba) => {
        abaAltarAtual = aba;
        ativo.classList.remove('opacity-60', 'bg-transparent');
        ativo.classList.add('bg-white', 'shadow-sm');
        inativo.classList.add('opacity-60', 'bg-transparent');
        inativo.classList.remove('bg-white', 'shadow-sm');
        atualizarAbaAltar();
    };

    btnColecao.onclick = () => setAtivo(btnColecao, btnDesejos, 'colecao');
    btnDesejos.onclick = () => setAtivo(btnDesejos, btnColecao, 'desejo');
}

function atualizarAbaAltar() {
    const container = document.getElementById('altar-results');
    const listaIds = meuAltar[abaAltarAtual];
    
    if(listaIds.length === 0) {
        container.innerHTML = `<p class="text-center py-10 col-span-2 text-sm text-[#795548]">Seu espaço está vazio. Explore e adicione energias aqui.</p>`;
        return;
    }
    
    container.innerHTML = listaIds.map(id => {
        const item = obterItem(id);
        return item ? renderizarCardMiniatura(item) : '';
    }).join('');
    lucide.createIcons();
}

// ==========================================
// BUSCA E EXPLORAR (UNIFICADO)
// ==========================================
function configurarBuscaEFiltros() {
    const input = document.getElementById('search-input');
    const btns = document.querySelectorAll('.filter-btn');
    let filtroAtual = 'todos';

    const processarBusca = () => {
        const termo = input.value.toLowerCase();
        renderizarCatalogo(filtroAtual, termo);
    };

    input.addEventListener('input', processarBusca);

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => {
                b.style.backgroundColor = 'transparent';
                b.style.color = 'var(--text-muted)';
                b.style.borderColor = 'var(--border-color)';
            });
            btn.style.backgroundColor = 'var(--accent-green)';
            btn.style.color = 'white';
            btn.style.borderColor = 'var(--accent-green)';
            
            filtroAtual = btn.getAttribute('data-filter');
            processarBusca();
        });
    });
}

function renderizarCatalogo(filtro, termo) {
    const container = document.getElementById('explorar-results');
    let resultados = [];

    const buscarEm = (banco) => {
        return Object.values(banco).filter(item => {
            if(termo === '') return true;
            const nomeMatch = item.nome.toLowerCase().includes(termo);
            const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(termo));
            return nomeMatch || tagMatch;
        });
    };

    if (filtro === 'todos' || filtro === 'cristal') {
        const c = buscarEm(dbCrystals).map(i => ({...i, id: Object.keys(dbCrystals).find(k=>dbCrystals[k].nome===i.nome)}));
        resultados = resultados.concat(c);
    }
    if (filtro === 'todos' || filtro === 'incenso') {
        const i = buscarEm(dbIncenses).map(x => ({...x, id: Object.keys(dbIncenses).find(k=>dbIncenses[k].nome===x.nome)}));
        resultados = resultados.concat(i);
    }

    if(resultados.length === 0) {
        container.innerHTML = `<p class="col-span-2 text-center text-sm py-10" style="color: var(--text-muted);">Nenhuma energia encontrada para essa busca.</p>`;
        return;
    }

    container.innerHTML = resultados.map(item => renderizarCardMiniatura(item)).join('');
    lucide.createIcons();
}

// ==========================================
// ORÁCULO: CARTA DE TAROT
// ==========================================
function configurarOraculoTarot() {
    const card = document.getElementById('tarot-card');
    let isFlipping = false;

    card.addEventListener('click', () => {
        if (isFlipping) return;
        isFlipping = true;
        vibrar('magica');
        
        card.classList.add('flipped');
        
        // Sorteia após a carta virar e abre o modal
        setTimeout(() => {
            const chaves = Object.keys(dbCrystals);
            const idSorteado = chaves[Math.floor(Math.random() * chaves.length)];
            abrirModalItem(idSorteado);
            
            // Retorna a carta pra posição original invisivelmente enquanto o modal ta aberto
            setTimeout(() => {
                card.classList.remove('flipped');
                isFlipping = false;
            }, 500);
        }, 800); 
    });
}

// ==========================================
// QUIZ SITUACIONAL "DESCUBRA SUA ENERGIA"
// ==========================================
const PERGUNTAS_QUIZ = [
    { text: "Como sua mente se comportou ao deitar para dormir nas últimas noites?", options: [{txt: "Acelerada, pensando no futuro.", val: "calma"}, {txt: "Pesada, absorvendo energia dos outros.", val: "protecao"}, {txt: "Tranquila, mas acordo sem energia.", val: "vitalidade"}] },
    { text: "Onde você costuma sentir tensão física quando passa por um estresse?", options: [{txt: "Na cabeça, testa ou nuca.", val: "calma"}, {txt: "No peito ou na garganta.", val: "comunicacao"}, {txt: "No estômago ou ombros.", val: "vitalidade"}] },
    { text: "Se a sua energia atual fosse um clima, qual seria?", options: [{txt: "Tempestade agitada e imprevisível.", val: "calma"}, {txt: "Dia nublado, estagnado e sem brilho.", val: "vitalidade"}, {txt: "Vento seco, disperso e sem foco.", val: "foco"}] },
    { text: "O que você sente que está 'bloqueado' na sua vida hoje?", options: [{txt: "Minha comunicação e expressão.", val: "comunicacao"}, {txt: "Minha prosperidade ou ânimo.", val: "vitalidade"}, {txt: "Minha intuição e amor próprio.", val: "amor"}] },
    { text: "Escolha um elemento da natureza para te abraçar agora:", options: [{txt: "Água (para limpar e fluir).", val: "amor"}, {txt: "Fogo (para transformar).", val: "vitalidade"}, {txt: "Terra (para enraizar).", val: "protecao"}] },
    { text: "Qual palavra soa como um remédio para sua alma hoje?", options: [{txt: "Aterramento", val: "protecao"}, {txt: "Coragem", val: "vitalidade"}, {txt: "Paz", val: "calma"}] }
];

let currentQ = 0;
let respostasValores = [];

function configurarQuiz() {
    document.getElementById('btn-iniciar-quiz').addEventListener('click', iniciarQuiz);
    document.getElementById('close-quiz').addEventListener('click', fecharQuiz);
}

function iniciarQuiz() {
    vibrar('click');
    currentQ = 0;
    respostasValores = [];
    document.getElementById('modal-quiz').classList.remove('hidden');
    setTimeout(() => document.getElementById('modal-quiz').classList.remove('opacity-0'), 10);
    renderizarPergunta();
}

function fecharQuiz() {
    document.getElementById('modal-quiz').classList.add('opacity-0');
    setTimeout(() => document.getElementById('modal-quiz').classList.add('hidden'), 300);
}

function renderizarPergunta() {
    const container = document.getElementById('quiz-content');
    const bar = document.getElementById('quiz-progress');
    
    bar.style.width = `${((currentQ) / PERGUNTAS_QUIZ.length) * 100}%`;

    if (currentQ >= PERGUNTAS_QUIZ.length) {
        calcularResultadoQuiz();
        return;
    }

    const q = PERGUNTAS_QUIZ[currentQ];
    
    // Animação de fade-in para as perguntas
    container.innerHTML = `
        <div class="fade-in">
            <p class="text-[10px] text-center font-bold tracking-widest text-[#C0A062] mb-4">PERGUNTA ${currentQ + 1} DE ${PERGUNTAS_QUIZ.length}</p>
            <h2 class="text-xl font-serif font-bold text-center mb-8" style="color: var(--text-main);">${q.text}</h2>
            <div class="space-y-3">
                ${q.options.map((opt, i) => `
                    <button onclick="responderQuiz('${opt.val}')" class="w-full text-left p-4 rounded-xl border border-[#E6E0D4] bg-white active:bg-gray-50 transition-colors shadow-sm text-sm" style="color: var(--text-main);">
                        ${opt.txt}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// FUTURE: Machine Learning NLP - Substituir a lógica de tally simples abaixo por análise semântica.
function responderQuiz(valor) {
    vibrar('click');
    respostasValores.push(valor);
    currentQ++;
    renderizarPergunta();
}

function calcularResultadoQuiz() {
    vibrar('magica');
    document.getElementById('quiz-progress').style.width = '100%';
    
    // Acha o valor que mais repetiu
    const counts = respostasValores.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
    const vencedor = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    // Mapeamento de Prescrição Estática (Para simplificar)
    const prescricoes = {
        "calma": { c: "ametista", i: "lavanda", msg: "Notamos que sua mente está acelerada e pedindo descanso. Este ritual vai desacelerar seus pensamentos." },
        "protecao": { c: "turmalina-negra", i: "arruda", msg: "Você está absorvendo o ambiente. É hora de fechar seu campo energético e descarregar o peso." },
        "vitalidade": { c: "citrino", i: "canela", msg: "Sua energia criativa e de ação precisa de um choque de vida. Vamos reaquecer seu fogo interno." },
        "foco": { c: "citrino", i: "canela", msg: "Sua mente dispersa precisa de aterramento e direção. Este ritual estimula a clareza mental." },
        "comunicacao": { c: "ametista", i: "lavanda", msg: "Há nós emocionais travando sua expressão. Transmute isso com calma e paz." },
        "amor": { c: "ametista", i: "lavanda", msg: "Conecte-se com seu chakra superior para ouvir sua intuição pura." }
    };

    const ritual = prescricoes[vencedor] || prescricoes["calma"];
    const cristalObj = obterItem(ritual.c);
    const incensoObj = obterItem(ritual.i);

    const container = document.getElementById('quiz-content');
    container.innerHTML = `
        <div class="fade-in text-center pb-10">
            <i data-lucide="sparkles" class="w-10 h-10 mx-auto mb-4" style="color: var(--gold);"></i>
            <h2 class="text-2xl font-serif font-bold mb-2" style="color: var(--text-main);">Seu Ritual Perfeito</h2>
            <p class="text-sm mb-8 leading-relaxed" style="color: var(--text-muted);">${ritual.msg}</p>
            
            <div class="flex flex-col gap-4 text-left">
                <!-- Cristal -->
                <div onclick="fecharQuiz(); abrirModalItem('${ritual.c}')" class="flex items-center gap-4 p-3 rounded-xl border border-[#2E4F2B] bg-[#2E4F2B]/5 cursor-pointer">
                    <div class="w-16 h-16 rounded-lg bg-cover bg-center" style="background-image: url('${cristalObj.imagem_url || IMG_PLACEHOLDER}')"></div>
                    <div>
                        <p class="text-[10px] font-bold uppercase tracking-wider text-[#2E4F2B]">Pedra Guia</p>
                        <p class="font-bold text-[#3E2723]">${cristalObj.nome}</p>
                    </div>
                </div>
                
                <div class="flex justify-center -my-2 z-10"><div class="w-6 h-6 rounded-full bg-white border border-[#C0A062] flex items-center justify-center font-bold text-xs text-[#C0A062]">+</div></div>
                
                <!-- Incenso -->
                <div onclick="fecharQuiz(); abrirModalItem('${ritual.i}')" class="flex items-center gap-4 p-3 rounded-xl border border-[#C0A062] bg-[#C0A062]/5 cursor-pointer">
                    <div class="w-16 h-16 rounded-lg bg-cover bg-center" style="background-image: url('${incensoObj.imagem_url || IMG_PLACEHOLDER}')"></div>
                    <div>
                        <p class="text-[10px] font-bold uppercase tracking-wider text-[#C0A062]">Aromaterapia</p>
                        <p class="font-bold text-[#3E2723]">${incensoObj.nome}</p>
                    </div>
                </div>
            </div>
            
            <button onclick="fecharQuiz()" class="w-full mt-10 py-4 rounded-xl font-bold text-white shadow-lg" style="background-color: var(--accent-green);">Finalizar Teste</button>
        </div>
    `;
    lucide.createIcons();
}
