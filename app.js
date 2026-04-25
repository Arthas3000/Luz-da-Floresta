// ==========================================
// [JS_01_ESTADO_GLOBAL] CONFIGURAÇÕES E BANCO
// ==========================================
let dbCrystals = {};
let dbIncenses = {};
let meuAltar = JSON.parse(localStorage.getItem('altarFloresta')) || { colecao: [], desejo:[] };
const IMG_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23C0A062' stroke-width='1'%3E%3Cpath d='M12 2L2 12l10 10 10-10L12 2z'/%3E%3C/svg%3E";

document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await carregarDadosBanco();
    
    configurarNavegacaoAbas();
    configurarBuscaEFiltros();
    configurarSistemaAltar();
    configurarOraculoCartaGigante();
    configurarFluxoQuiz();
    
    document.getElementById('close-item').addEventListener('click', fecharModalPadrao);
});

async function carregarDadosBanco() {
    try {
        const response = await fetch('data.json');
        const dados = await response.json();
        dbCrystals = dados.cristais || {};
        dbIncenses = dados.incensos || {};
        renderizarListaCatalogo('todos', '');
        
        verificarCartaDoDia();
    } catch (error) { 
        console.error("Erro ao carregar data.json", error); 
    }
}

function dispararVibracao(tipo) {
    if (!("vibrate" in navigator)) return;
    if (tipo === 'click') navigator.vibrate(30);
    if (tipo === 'sucesso') navigator.vibrate([100, 50, 100]);
    if (tipo === 'magica') navigator.vibrate([50, 100, 50, 150, 50, 200]);
}

// ==========================================
// [JS_02_NAVEGACAO] ABAS
// ==========================================
function configurarNavegacaoAbas() {
    const botoes = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.tab-content');

    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            views.forEach(v => v.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden', 'opacity-0');

            botoes.forEach(b => { b.classList.remove('active-tab'); b.classList.add('opacity-50'); });
            btn.classList.add('active-tab'); btn.classList.remove('opacity-50');

            if(target === 'view-altar') atualizarExibicaoAltar();
        });
    });
}

function obterDadosDoItem(id) {
    if (dbCrystals[id]) return { ...dbCrystals[id], id, categoria: 'cristal' };
    if (dbIncenses[id]) return { ...dbIncenses[id], id, categoria: 'incenso' };
    return null;
}

// ==========================================
// [JS_03_GERAR_HTML_DETALHE]
// ==========================================
function gerarHtmlDetalhesItem(id, isTarot = false) {
    const item = obterDadosDoItem(id);
    if (!item) return '';

    const taNaColecao = meuAltar.colecao.includes(id);
    const taNoDesejo = meuAltar.desejo.includes(id);
    const isCristal = item.tipo === 'cristal';
    const tagInfo = isCristal ? `Chakra: ${item.chakra}` : `Modo de Uso: ${item.como_usar}`;

    let sinergiaHTML = '';
    if (item.sinergia) {
        const par = obterDadosDoItem(item.sinergia);
        if (par) {
            sinergiaHTML = `
                <div class="mt-4 pt-4 border-t" style="border-color: var(--border-color);">
                    <h3 class="font-bold uppercase tracking-wider text-[10px] mb-2 flex items-center gap-2" style="color: var(--gold);">
                        <i data-lucide="sparkles" class="w-3 h-3"></i> Sinergia
                    </h3>
                    <div onclick="abrirModalPadrao('${par.id}')" class="flex items-center gap-3 p-2 rounded-xl border border-[#C0A062] cursor-pointer" style="background-color: rgba(192, 160, 98, 0.05);">
                        <div class="w-10 h-10 rounded-lg bg-cover bg-center bg-[#E6E0D4]" style="background-image: url('${par.imagem_url || IMG_PLACEHOLDER}')"></div>
                        <div class="flex-1">
                            <p class="text-sm font-bold" style="color: var(--text-main);">${par.nome}</p>
                        </div>
                        <i data-lucide="chevron-right" class="w-4 h-4 text-[#C0A062]"></i>
                    </div>
                </div>
            `;
        }
    }

    let cuidadosHTML = '';
    if (isCristal && item.cuidados) {
        cuidadosHTML = `
            <details class="group p-3 mt-3 rounded-xl border transition-all" style="background-color: var(--bg-color); border-color: var(--border-color);">
                <summary class="font-bold text-[10px] uppercase tracking-wider flex justify-between items-center outline-none cursor-pointer" style="color: var(--text-main);">
                    Como Cuidar <i data-lucide="chevron-down" class="w-3 h-3 group-open:rotate-180 transition-transform" style="color: var(--accent-green);"></i>
                </summary>
                <div class="pt-2 mt-2 border-t space-y-2 text-[11px] leading-relaxed" style="border-color: var(--border-color); color: var(--text-muted);">
                    <p><strong style="color: var(--accent-green);">Limpeza:</strong> ${item.cuidados.limpeza}</p>
                    <p><strong style="color: var(--accent-green);">Energização:</strong> ${item.cuidados.energizacao}</p>
                </div>
            </details>
        `;
    }

    let btnFecharTarotHTML = '';
    if(isTarot) {
        btnFecharTarotHTML = `
            <button onclick="fecharCartaGigante(event)" class="w-full mt-6 py-4 rounded-xl font-bold text-white shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2" style="background-color: var(--text-main);">
                Guardar Carta
            </button>
        `;
    }

    return `
        <div class="conteudo-verso-interno block w-full">
            <div class="h-44 w-full bg-cover bg-center relative bg-[#E6E0D4] shrink-0" style="background-image: url('${item.imagem_url || IMG_PLACEHOLDER}');">
                <div class="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#C0A062] border border-[#C0A062]">Carta do Dia</div>
            </div>
            <div class="px-5 -mt-4 relative z-10 pb-8">
                <h2 class="text-3xl font-serif font-bold mb-0.5" style="color: var(--text-main);">${item.nome}</h2>
                <p class="text-[10px] font-bold uppercase tracking-widest mb-6" style="color: var(--gold);">${tagInfo}</p>
                
                <div class="flex gap-2 mb-6">
                    <button onclick="alternarItemAltar('${id}', 'colecao', ${isTarot})" class="flex-1 py-3 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${taNaColecao ? 'bg-[#2E4F2B] text-white' : 'bg-[#E6E0D4] text-[#3E2723]'}">
                        ${taNaColecao ? "Na Coleção" : "Já Tenho"}
                    </button>
                    <button onclick="alternarItemAltar('${id}', 'desejo', ${isTarot})" class="flex-1 py-3 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${taNoDesejo ? 'bg-[#C0A062] text-white' : 'bg-transparent border border-[#C0A062] text-[#C0A062]'}">
                        ${taNoDesejo ? "Desejado" : "Eu Quero"}
                    </button>
                </div>
                
                <div class="space-y-4 text-sm text-[#795548] leading-relaxed">
                    <p>${item.energia}</p>
                    ${cuidadosHTML}
                    ${sinergiaHTML}
                </div>
                
                ${btnFecharTarotHTML}
            </div>
        </div>
    `;
}

// ==========================================
// [JS_04_CARTA_GIGANTE] LÓGICA DO ORÁCULO
// ==========================================
const tarotScene = document.getElementById('tarot-scene');
const tarotCard = document.getElementById('tarot-card');
const tarotOverlay = document.getElementById('tarot-overlay');
const tarotBackContent = document.getElementById('tarot-back-content');
let isTarotFlipping = false;

function verificarCartaDoDia() {
    const hoje = new Date().toLocaleDateString();
    const storage = JSON.parse(localStorage.getItem('cartaDoDia'));
    
    if (storage && storage.data === hoje) {
        tarotBackContent.innerHTML = gerarHtmlDetalhesItem(storage.id, true);
        lucide.createIcons();
        tarotCard.classList.add('flipped');
        tarotScene.classList.add('carta-ja-revelada');
    }
}

function configurarOraculoCartaGigante() {
    tarotScene.addEventListener('click', () => {
        if (isTarotFlipping || tarotScene.classList.contains('is-expanding')) return;
        
        const hoje = new Date().toLocaleDateString();
        const storage = JSON.parse(localStorage.getItem('cartaDoDia'));

        // AÇÃO 2: ZOOM (Se a carta já está virada para cima)
        if (storage && storage.data === hoje) {
            ativarZoomCarta();
            return;
        }

        // AÇÃO 1: REVELAR (Primeiro clique do dia)
        executarSorteioNovo(hoje);
    });
}

function ativarZoomCarta() {
    isTarotFlipping = true;
    dispararVibracao('click');
    tarotOverlay.classList.add('active');
    tarotScene.classList.add('is-expanding'); 
    setTimeout(() => {
        tarotScene.classList.add('placed-on-table');
        isTarotFlipping = false;
    }, 100);
}

function executarSorteioNovo(dataHoje) {
    isTarotFlipping = true;
    dispararVibracao('magica');
    tarotCard.classList.add('suspense-ativo');
    
    const chaves = Object.keys(dbCrystals);
    const idSorteado = chaves[Math.floor(Math.random() * chaves.length)];
    
    localStorage.setItem('cartaDoDia', JSON.stringify({ data: dataHoje, id: idSorteado }));
    
    tarotBackContent.innerHTML = gerarHtmlDetalhesItem(idSorteado, true);
    lucide.createIcons();
    tarotBackContent.scrollTop = 0;
    
    setTimeout(() => {
        tarotOverlay.classList.add('active');
        tarotScene.classList.add('is-expanding'); 
        setTimeout(() => {
            tarotCard.classList.add('flipped');
            dispararVibracao('click');
            setTimeout(() => {
                tarotScene.classList.add('placed-on-table');
                isTarotFlipping = false;
                tarotScene.classList.add('carta-ja-revelada');
            }, 800); 
        }, 200);
    }, 1000);
}

function fecharCartaGigante(event) {
    if(event) event.stopPropagation(); 
    dispararVibracao('click');
    tarotScene.classList.remove('placed-on-table');
    tarotScene.classList.remove('is-expanding');
    tarotOverlay.classList.remove('active');
    
    setTimeout(() => {
        tarotCard.classList.remove('suspense-ativo');
        tarotBackContent.scrollTop = 0; 
    }, 600);
}

// ==========================================
// [JS_05_MODAL_PADRAO] 
// ==========================================
function abrirModalPadrao(id) {
    dispararVibracao('click');
    const content = document.getElementById('item-content');
    content.innerHTML = gerarHtmlDetalhesItem(id, false);
    lucide.createIcons();
    document.getElementById('item-container').scrollTop = 0;
    const modal = document.getElementById('modal-item');
    const container = document.getElementById('item-container');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        container.classList.remove('translate-y-full');
    }, 10);
}

function fecharModalPadrao() {
    const modal = document.getElementById('modal-item');
    const container = document.getElementById('item-container');
    container.classList.add('translate-y-full');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// ==========================================
// [JS_06_ALTAR]
// ==========================================
function salvarDadosAltar() { localStorage.setItem('altarFloresta', JSON.stringify(meuAltar)); }

function alternarItemAltar(id, tipo, recarregarTarot = false) {
    dispararVibracao('sucesso');
    const outroTipo = tipo === 'colecao' ? 'desejo' : 'colecao';
    meuAltar[outroTipo] = meuAltar[outroTipo].filter(i => i !== id);
    if (meuAltar[tipo].includes(id)) meuAltar[tipo] = meuAltar[tipo].filter(i => i !== id);
    else meuAltar[tipo].push(id);
    salvarDadosAltar();
    
    if (recarregarTarot) {
        const container = document.getElementById('tarot-back-content');
        const pos = container.scrollTop;
        container.innerHTML = gerarHtmlDetalhesItem(id, true);
        container.scrollTop = pos;
    } else {
        const container = document.getElementById('item-container');
        const pos = container.scrollTop;
        document.getElementById('item-content').innerHTML = gerarHtmlDetalhesItem(id, false);
        container.scrollTop = pos;
    }
    lucide.createIcons();
    if(!document.getElementById('view-altar').classList.contains('hidden')) atualizarExibicaoAltar();
}

let abaAltarAtiva = 'colecao';
function configurarSistemaAltar() {
    const btnColecao = document.getElementById('btn-colecao');
    const btnDesejos = document.getElementById('btn-desejos');
    const setAba = (ativo, inativo, aba) => {
        abaAltarAtiva = aba;
        ativo.classList.remove('opacity-60', 'bg-transparent');
        ativo.classList.add('bg-white', 'shadow-sm');
        inativo.classList.add('opacity-60', 'bg-transparent');
        inativo.classList.remove('bg-white', 'shadow-sm');
        atualizarExibicaoAltar();
    };
    btnColecao.onclick = () => setAba(btnColecao, btnDesejos, 'colecao');
    btnDesejos.onclick = () => setAba(btnDesejos, btnColecao, 'desejo');
}

function gerarCardListagemHTML(item) {
    const taNaColecao = meuAltar.colecao.includes(item.id);
    const taNoDesejo = meuAltar.desejo.includes(item.id);
    const badgeColor = item.tipo === 'cristal' ? 'bg-[#2E4F2B]' : 'bg-[#C0A062]';
    return `
        <div onclick="abrirModalPadrao('${item.id}')" class="crystal-card rounded-xl overflow-hidden flex flex-col relative">
            <div class="absolute top-2 left-2 z-10 text-[9px] text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${badgeColor}">${item.tipo}</div>
            ${taNaColecao ? '<i data-lucide="check-circle" class="absolute top-2 right-2 text-green-500 bg-white rounded-full w-5 h-5 z-10 shadow-sm"></i>' : ''}
            ${taNoDesejo ? '<i data-lucide="heart" class="absolute top-2 right-2 text-[#C0A062] bg-white rounded-full w-5 h-5 z-10 shadow-sm"></i>' : ''}
            <div class="h-32 bg-cover bg-center border-b relative bg-[#E6E0D4]" style="background-image: url('${item.imagem_url || IMG_PLACEHOLDER}');"></div>
            <div class="p-3">
                <p class="font-bold text-sm truncate w-full" style="color: var(--text-main);">${item.nome}</p>
                <p class="text-[10px] truncate w-full mt-0.5" style="color: var(--text-muted);">${item.tags?.slice(0,2).join(', ') || ''}</p>
            </div>
        </div>
    `;
}

function atualizarExibicaoAltar() {
    const container = document.getElementById('altar-results');
    const listaIds = meuAltar[abaAltarAtiva];
    if(listaIds.length === 0) {
        container.innerHTML = `<p class="text-center py-10 col-span-2 text-sm text-[#795548]">Seu espaço está vazio.</p>`;
        return;
    }
    container.innerHTML = listaIds.map(id => {
        const item = obterDadosDoItem(id);
        return item ? gerarCardListagemHTML(item) : '';
    }).join('');
    lucide.createIcons();
}

// ==========================================
// [JS_07_EXPLORAR]
// ==========================================
function configurarBuscaEFiltros() {
    const input = document.getElementById('search-input');
    const btns = document.querySelectorAll('.filter-btn');
    let filtroAtual = 'todos';
    const rodarPesquisa = () => { renderizarListaCatalogo(filtroAtual, input.value.toLowerCase()); };
    input.addEventListener('input', rodarPesquisa);
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => {
                b.style.backgroundColor = 'transparent'; b.style.color = 'var(--text-muted)'; b.style.borderColor = 'var(--border-color)';
            });
            btn.style.backgroundColor = 'var(--accent-green)'; btn.style.color = 'white'; btn.style.borderColor = 'var(--accent-green)';
            filtroAtual = btn.getAttribute('data-filter');
            rodarPesquisa();
        });
    });
}

function renderizarListaCatalogo(filtro, termo) {
    const container = document.getElementById('explorar-results');
    let resultados = [];
    const buscarEmBanco = (banco) => {
        return Object.values(banco).filter(item => {
            if(termo === '') return true;
            return item.nome.toLowerCase().includes(termo) || item.tags?.some(tag => tag.toLowerCase().includes(termo));
        });
    };
    if (filtro === 'todos' || filtro === 'cristal') {
        const c = buscarEmBanco(dbCrystals).map(i => ({...i, id: Object.keys(dbCrystals).find(k=>dbCrystals[k].nome===i.nome)}));
        resultados = resultados.concat(c);
    }
    if (filtro === 'todos' || filtro === 'incenso') {
        const i = buscarEmBanco(dbIncenses).map(x => ({...x, id: Object.keys(dbIncenses).find(k=>dbIncenses[k].nome===x.nome)}));
        resultados = resultados.concat(i);
    }
    if(resultados.length === 0) {
        container.innerHTML = `<p class="col-span-2 text-center text-sm py-10" style="color: var(--text-muted);">Nenhuma energia encontrada.</p>`;
        return;
    }
    container.innerHTML = resultados.map(item => gerarCardListagemHTML(item)).join('');
    lucide.createIcons();
}

// ==========================================
// [JS_08_QUIZ]
// ==========================================
const PERGUNTAS_SITUACIONAIS = [
    { text: "Como sua mente se comportou ao deitar para dormir nas últimas noites?", options: [{txt: "Acelerada, pensando no futuro.", val: "calma"}, {txt: "Pesada, absorvendo energia dos outros.", val: "protecao"}, {txt: "Tranquila, mas acordo sem energia.", val: "vitalidade"}] },
    { text: "Onde você costuma sentir tensão física quando passa por um estresse?", options: [{txt: "Na cabeça, testa ou nuca.", val: "calma"}, {txt: "No peito ou na garganta.", val: "comunicacao"}, {txt: "No estômago ou ombros.", val: "vitalidade"}] },
    { text: "Se a sua energia atual fosse um clima, qual seria?", options: [{txt: "Tempestade agitada e imprevisível.", val: "calma"}, {txt: "Dia nublado, estagnado e sem brilho.", val: "vitalidade"}, {txt: "Vento seco, disperso e sem foco.", val: "foco"}] },
    { text: "O que você sente que está 'bloqueado' na sua vida hoje?", options: [{txt: "Minha comunicação e expressão.", val: "comunicacao"}, {txt: "Minha prosperidade ou ânimo.", val: "vitalidade"}, {txt: "Minha intuição e amor próprio.", val: "amor"}] },
    { text: "Escolha um elemento da natureza para te abraçar agora:", options: [{txt: "Água (para limpar e fluir).", val: "amor"}, {txt: "Fogo (para transformar).", val: "vitalidade"}, {txt: "Terra (para enraizar).", val: "protecao"}] },
    { text: "Qual palavra soa como um remédio para sua alma hoje?", options: [{txt: "Aterramento", val: "protecao"}, {txt: "Coragem", val: "vitalidade"}, {txt: "Paz", val: "calma"}] }
];

let indicePerguntaAtual = 0;
let arrayDeRespostas = [];

function configurarFluxoQuiz() {
    const btn = document.getElementById('btn-iniciar-quiz');
    if(btn) btn.addEventListener('click', iniciarTelaQuiz);
    const close = document.getElementById('close-quiz');
    if(close) close.addEventListener('click', fecharTelaQuiz);
}

function iniciarTelaQuiz() {
    dispararVibracao('click');
    indicePerguntaAtual = 0;
    arrayDeRespostas = [];
    document.getElementById('modal-quiz').classList.remove('hidden');
    setTimeout(() => document.getElementById('modal-quiz').classList.remove('opacity-0'), 10);
    renderizarEtapaQuiz();
}

function fecharTelaQuiz() {
    document.getElementById('modal-quiz').classList.add('opacity-0');
    setTimeout(() => document.getElementById('modal-quiz').classList.add('hidden'), 300);
}

function renderizarEtapaQuiz() {
    const container = document.getElementById('quiz-content');
    const barra = document.getElementById('quiz-progress');
    barra.style.width = `${((indicePerguntaAtual) / PERGUNTAS_SITUACIONAIS.length) * 100}%`;

    if (indicePerguntaAtual >= PERGUNTAS_SITUACIONAIS.length) {
        calcularEExibirResultado();
        return;
    }

    const q = PERGUNTAS_SITUACIONAIS[indicePerguntaAtual];
    container.innerHTML = `
        <div class="fade-in">
            <p class="text-[10px] text-center font-bold tracking-widest text-[#C0A062] mb-4">PERGUNTA ${indicePerguntaAtual + 1} DE ${PERGUNTAS_SITUACIONAIS.length}</p>
            <h2 class="text-xl font-serif font-bold text-center mb-8" style="color: var(--text-main);">${q.text}</h2>
            <div class="space-y-3">
                ${q.options.map((opt) => `
                    <button onclick="salvarRespostaQuiz('${opt.val}')" class="w-full text-left p-4 rounded-xl border border-[#E6E0D4] bg-white active:bg-gray-50 transition-colors shadow-sm text-sm" style="color: var(--text-main);">
                        ${opt.txt}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function salvarRespostaQuiz(valor) {
    dispararVibracao('click');
    arrayDeRespostas.push(valor);
    indicePerguntaAtual++;
    renderizarEtapaQuiz();
}

function calcularEExibirResultado() {
    dispararVibracao('magica');
    document.getElementById('quiz-progress').style.width = '100%';
    const contagem = arrayDeRespostas.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
    const sentimentoDominante = Object.keys(contagem).reduce((a, b) => contagem[a] > contagem[b] ? a : b);

    const prescricoes = {
        "calma": { c: "ametista", i: "lavanda", msg: "Notamos que sua mente está acelerada e pedindo descanso. Este ritual vai desacelerar seus pensamentos." },
        "protecao": { c: "turmalina-negra", i: "arruda", msg: "Você está absorvendo o ambiente. É hora de fechar seu campo energético e descarregar o peso." },
        "vitalidade": { c: "citrino", i: "canela", msg: "Sua energia criativa e de ação precisa de um choque de vida. Vamos reaquecer seu fogo interno." },
        "foco": { c: "citrino", i: "canela", msg: "Sua mente dispersa precisa de aterramento e direção. Este ritual estimula a clareza mental." },
        "comunicacao": { c: "ametista", i: "lavanda", msg: "Há nós emocionais travando sua expressão. Transmute isso com calma e paz." },
        "amor": { c: "ametista", i: "lavanda", msg: "Conecte-se com seu chakra superior para ouvir sua intuição pura." }
    };

    const ritual = prescricoes[sentimentoDominante] || prescricoes["calma"];
    const cristalObj = obterDadosDoItem(ritual.c);
    const incensoObj = obterDadosDoItem(ritual.i);
    const container = document.getElementById('quiz-content');
    
    container.innerHTML = `
        <div class="fade-in text-center pb-10">
            <i data-lucide="sparkles" class="w-10 h-10 mx-auto mb-4" style="color: var(--gold);"></i>
            <h2 class="text-2xl font-serif font-bold mb-2" style="color: var(--text-main);">Seu Ritual Perfeito</h2>
            <p class="text-sm mb-8 leading-relaxed" style="color: var(--text-muted);">${ritual.msg}</p>
            <div class="flex flex-col gap-4 text-left">
                <div class="flex items-center gap-4 p-3 rounded-xl border border-[#2E4F2B] bg-[#2E4F2B]/5">
                    <div class="w-16 h-16 rounded-lg bg-cover bg-center shrink-0" style="background-image: url('${cristalObj.imagem_url || IMG_PLACEHOLDER}')"></div>
                    <div class="flex-1">
                        <p class="text-[10px] font-bold uppercase tracking-wider text-[#2E4F2B]">Pedra Guia</p>
                        <p class="font-bold text-[#3E2723]">${cristalObj.nome}</p>
                    </div>
                    <button onclick="abrirModalPadrao('${ritual.c}')" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#2E4F2B] text-[#2E4F2B] active:bg-[#2E4F2B] active:text-white transition-colors">Ver mais</button>
                </div>
                <div class="flex justify-center -my-2 z-10"><div class="w-6 h-6 rounded-full bg-white border border-[#C0A062] flex items-center justify-center font-bold text-xs text-[#C0A062]">+</div></div>
                <div class="flex items-center gap-4 p-3 rounded-xl border border-[#C0A062] bg-[#C0A062]/5">
                    <div class="w-16 h-16 rounded-lg bg-cover bg-center shrink-0" style="background-image: url('${incensoObj.imagem_url || IMG_PLACEHOLDER}')"></div>
                    <div class="flex-1">
                        <p class="text-[10px] font-bold uppercase tracking-wider text-[#C0A062]">Aromaterapia</p>
                        <p class="font-bold text-[#3E2723]">${incensoObj.nome}</p>
                    </div>
                    <button onclick="abrirModalPadrao('${ritual.i}')" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#C0A062] text-[#C0A062] active:bg-[#C0A062] active:text-white transition-colors">Ver mais</button>
                </div>
            </div>
            <button onclick="fecharTelaQuiz()" class="w-full mt-10 py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform" style="background-color: var(--accent-green);">Finalizar Teste</button>
        </div>
    `;
    lucide.createIcons();
}
