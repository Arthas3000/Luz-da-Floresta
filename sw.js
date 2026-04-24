const CACHE_NAME = 'luz-da-floresta-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './data.json',
    './manifest.json'
    // Se tiver adicionado os icones, pode colocar aqui: './icon-192.png', './icon-512.png'
];

// Instala o Service Worker e guarda os arquivos em cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Cache aberto com sucesso');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Limpa caches antigos quando houver atualização
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Apagando cache antigo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Intercepta as requisições (Estratégia: Stale-While-Revalidate)
// Responde rápido com o cache, mas atualiza o cache no fundo se tiver internet
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // Apenas clona e guarda no cache se a requisição for válida
                if(networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Se falhar (sem internet) e não tiver no cache, não faz nada
            });

            // Retorna o cache IMEDIATAMENTE se existir, senão espera a rede
            return cachedResponse || fetchPromise;
        })
    );
});
