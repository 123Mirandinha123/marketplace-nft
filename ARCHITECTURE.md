# Arquitetura — Kurio Marketplace de NFTs

Este documento registra as decisões técnicas do projeto, o contexto em que foram
tomadas e as contrapartidas (trade-offs) de cada escolha.

## 1. Visão geral e escopo

A Kurio é uma SPA (Single Page Application) de marketplace de NFTs, construída
como demonstração de produto. O objetivo é entregar uma experiência completa de
catálogo, carrinho, checkout e conta de usuário **sem depender de um backend
real** — toda a API é simulada no navegador com MSW.

Consequências diretas dessa decisão:

- o "backend" é um banco em `localStorage`, isolado por navegador;
- as regras de negócio vivem nos handlers do MSW, no mesmo formato de uma API HTTP;
- trocar o mock por uma API real é uma mudança de configuração (`VITE_API_URL`),
  pois o contrato HTTP já existe.

## 2. Stack e justificativas

| Tecnologia | Papel | Por que foi escolhida |
| --- | --- | --- |
| React 19 + TypeScript | UI e tipagem | Modelo por componentes e tipos compartilhados entre UI e contrato da API |
| Vite 8 | Dev server e build | HMR rápido, build enxuto e integração nativa com o ecossistema |
| TanStack Router | Roteamento | Rotas file-based, type-safety de params/search e hooks de navegação (`beforeLoad`) |
| TanStack Query | Estado de servidor | Cache, deduplicação, retry e invalidação sem estado global manual |
| MSW | API simulada | Intercepta requisições HTTP reais; o app não sabe que é mock |
| Tailwind CSS v4 + Radix UI | Estilo e acessibilidade | Tokens utilitários e primitivos acessíveis (padrão shadcn/ui, estilo `radix-nova`) |
| React Hook Form + Zod | Formulários e validação | Formulários performáticos e schemas reutilizados no cliente e nos handlers |
| Axios | Cliente HTTP | Instância única com interceptors de token e tratamento de erro centralizado |
| Decimal.js | Cálculos monetários | Evita erros de ponto flutuante em preços e totais em ETH |
| Sonner | Feedback | Toasts simples e consistentes |
| Lucide | Ícones | Conjunto leve e tree-shakeable |

## 3. Organização em camadas e por feature

```
routes/      adaptadores finos: ligam URL -> página/guarda
features/    domínio: auth, cart, checkout, home, nfts, orders, profile
lib/         infraestrutura: api, sessão, formatação, query client
mocks/       "backend" simulado: handlers, banco e catálogo
components/  UI compartilhada (layout e primitivos)
types/       contrato da API (DTOs)
```

A organização **por feature** foi preferida a pastas por tipo (hooks/, services/,
components/) porque cada domínio mantém junto o que muda junto: página, hooks,
API e regras. Isso reduz acoplamento entre áreas e facilita remover ou evoluir uma
feature inteira.

As rotas são deliberadamente finas: validam entrada (params/search), aplicam a
guarda de sessão quando necessário e delegam a renderização para `features/`.

## 4. Roteamento e autenticação

- `src/routes/__root.tsx` é o shell da aplicação: header, footer e tab bar
  mobile aparecem condicionalmente conforme o `pathname` (por exemplo, a tab bar
  só existe em home, mercado, perfil e carteiras).
- O `routeTree.gen.ts` é **gerado** pelo plugin `@tanstack/router-plugin` no
  build/dev (com `autoCodeSplitting`); não deve ser editado manualmente.
- Rotas protegidas usam `beforeLoad` + `requireSession`
  (`src/features/auth/require-session.ts`): a sessão é obtida via
  `queryClient.ensureQueryData`, aproveitando o cache do TanStack Query, e o
  usuário é redirecionado para `/login?redirect=<href>` quando não autenticado.
- A sessão é um token salvo em `localStorage` (`kurio.session.token`). O Axios
  injeta `Authorization: Bearer <token>`; respostas 401 limpam o token
  automaticamente. Os mocks validam o token pelo hash (SHA-256) e expiram a
  sessão após 7 dias.

## 5. Gerenciamento de estado

- **Estado de servidor**: TanStack Query. O `QueryClient`
  (`src/lib/query-client.ts`) usa `staleTime` de 30s, `gcTime` de 5min, sem
  refetch ao focar a janela e retry apenas em falhas de rede/5xx (até 2 vezes).
- **Estado de UI local**: `useState` nos componentes e controllers de feature
  (ex.: filtros em `useCatalog`).
- **Carrinho**: Context API (`CartProvider`) com persistência em
  `localStorage` (`kurio.cart.v1`). A chave de item é `nftId:editionId`, e a
  quantidade é limitada pelo estoque da edição. Não foi usado Redux/Zustand
  porque o estado global é pequeno e previsível.
- **Sessão**: token em `localStorage` + cache do TanStack Query para o usuário.

## 6. Camada de API

`src/lib/api.ts` cria uma instância única do Axios:

- `baseURL` = `VITE_API_URL` quando definido, senão `/api`;
- interceptor de request adiciona o token Bearer;
- interceptor de response normaliza erros em `ApiError` (status + código + detalhes)
  e limpa a sessão em 401.

Isso mantém os _features_ ignorantes de detalhes de transporte: eles chamam
funções como `fetchNftsRequest` e recebem dados tipados ou `ApiError`.

## 7. Estratégia de mocks

- O MSW roda como service worker (`public/mockServiceWorker.js`, servido na raiz).
- Ativação em `src/main.tsx`:
  `DEV || VITE_ENABLE_MOCKS === 'true' || !VITE_API_URL`. A última condição faz
  o deploy de demonstração funcionar na Vercel sem backend.
- O banco simulado (`src/mocks/db.ts`) fica em `localStorage`
  (`kurio.mock.db.v1`, `version: 2`) com usuários, sessões, NFTs, favoritos e
  pedidos. `loadDb` valida a versão, reinicializa em caso de corrupção e
  garante que os usuários de seed existam; `updateDb` faz read-modify-write.
- Os handlers (`src/mocks/handlers.ts`) implementam o contrato completo:
  autenticação, perfil, carteiras, catálogo com filtros/paginação, pedidos e
  favoritos, além de endpoints auxiliares `__mocks/reset`, `__mocks/scenario` e
  `__mocks/state`.
- A escolha por MSW (em vez de dados estáticos importados) preserva o
  comportamento assíncrono real: loading, erro, latência e paginação exercitam
  os mesmos caminhos que uma API real exercitaria.

## 8. Regras de negócio relevantes

- **Validação dupla**: os mesmos schemas Zod orientam o formulário e o handler,
  que responde `422 VALIDATION_ERROR` com detalhes.
- **Dinheiro**: todos os cálculos usam `Decimal` e os valores trafegam como
  string (ETH), evitando imprecisão de `number`.
- **Checkout**: subtotal → desconto (`KURIO10`, 10%) → taxa de rede (2,5%) →
  total. A mesma regra existe no carrinho (`features/cart/totals.ts`) e no
  servidor mockado, que é a fonte da verdade.
- **Estoque**: ao criar o pedido, o handler valida a edição e a quantidade
  disponível e decrementa o estoque de forma atômica no `updateDb`.
- **Pedido**: numeração sequencial `KUR-0001`, status `confirmed` e
  `transactionHash` derivado de SHA-256 (`id + userId`), simulando o hash on-chain.
- **Sessão**: token opaco criado no mock e armazenado apenas como hash.

## 9. Design system

- Os tokens de cor, raio e superfícies ficam em `src/index.css` (CSS variables +
  `@theme inline` do Tailwind v4), com tema escuro próprio (fundo `#140d0a`,
  destaque `#d28a4c`).
- Tipografia monoespaçada via `@fontsource/roboto-mono`.
- Componentes de UI seguem o padrão shadcn/ui sobre Radix, com variantes via
  `class-variance-authority` e composição de classes com `cn` (`clsx` +
  `tailwind-merge`).

## 10. Build, ambientes e deploy

- Build: `tsc -b && vite build` (type-check antes de gerar `dist/`).
- Alias `@/*` → `src/*` configurado no Vite e no TypeScript.
- `.tanstack/`, `dist/`, `node_modules/` e resultados de teste são ignorados no Git.
- Deploy na Vercel como SPA estática. Como não há `VITE_API_URL`, os mocks são
  ativados automaticamente e o service worker é servido a partir da raiz.

## 11. Trade-offs e dívidas técnicas

| Tema | Situação atual | Impacto / caminho |
| --- | --- | --- |
| Backend | API simulada com MSW | Dados não são compartilhados entre navegadores e podem ser resetados; substituir por API real via `VITE_API_URL` |
| Autenticação | Hash de senha no cliente e token em `localStorage` | Adequado para demo, **não** para produção; requer backend com auth real |
| Persistência | `localStorage` | Limite de tamanho, sem concorrência nem integridade transacional |
| Testes | `@playwright/test` e `@mswjs/socket.io-binding` nas devDependencies, mas sem configuração/specs | Criar suíte E2E reaproveitando os mocks |
| Bundle | Chunk dos mocks (~470 kB) entra no build de produção por causa do modo demo | Em produção real, definir `VITE_API_URL` para excluir os mocks |
| Deep links | Rotas como `/mercado` ou `/nft/nft-1` retornam 404 ao acessar direto na Vercel | Adicionar `vercel.json` com rewrite de todas as rotas para `/index.html` |
| Dependência ociosa | `socket.io-client` instalado sem uso em `src/` | Remover ou implementar o recurso em tempo real |

## 12. Evoluções possíveis

1. Backend real (REST ou GraphQL) mantendo o contrato atual de `/api`.
2. Autenticação server-side (sessão/cookies HTTP-only, hashing forte).
3. Suíte de testes E2E com Playwright e testes de handlers com MSW.
4. `vercel.json` com SPA fallback e cache headers para assets.
5. Realtime (Socket.IO) para estoque, favoritos ou status de pedido.
6. Internacionalização e acessibilidade contínua.
