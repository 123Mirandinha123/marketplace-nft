# Kurio — Marketplace de NFTs

Marketplace de NFTs para colecionadores, criadores e cultura digital. A aplicação
permite explorar um catálogo de obras, montar carrinho, finalizar compras com
carteira digital e acompanhar pedidos — tudo com uma API simulada no navegador.

https://marketplace-nft-ru8l.vercel.app/

## Funcionalidades

- Catálogo de NFTs com busca, filtros e destaques na home
- Página de detalhe da obra com edições e informações de raridade
- Carrinho com cálculo de totais, taxas e aplicação de cupom
- Checkout em etapas: carteira, dados do comprador e confirmação do pedido
- Autenticação (login e cadastro) com sessão persistida
- Perfil do usuário, histórico de pedidos e gerenciamento de carteiras
- Layout responsivo com navegação mobile (tab bar)
- API mockada com MSW, simulando autenticação, catálogo, estoque e pedidos

## Stack

- **React 19** + **TypeScript**
- **Vite 8**
- **TanStack Router** (rotas file-based) e **TanStack Query**
- **Tailwind CSS v4** + **Radix UI** (componentes no estilo shadcn/ui)
- **React Hook Form** + **Zod** para formulários e validação
- **Axios** para HTTP
- **MSW** para mock da API
- **Sonner** (toasts), **Lucide** (ícones) e **Decimal.js** (cálculos monetários)
- **Socket.IO Client** para eventos em tempo real

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Home com destaques e catálogo |
| `/mercado` | Catálogo completo com filtros |
| `/nft/:nftId` | Detalhe da NFT |
| `/carrinho` | Carrinho de compras |
| `/pagamento` | Checkout |
| `/confirmacao` | Confirmação do pedido |
| `/login` | Entrar |
| `/perfil` | Perfil e pedidos do usuário |
| `/carteiras` | Carteiras digitais |

## Como rodar

Pré-requisitos: **Node.js 20+** e **npm**.

```bash
# instalar dependências
npm install

# ambiente de desenvolvimento (mocks habilitados automaticamente)
npm run dev

# build de produção
npm run build

# pré-visualizar o build
npm run preview

# lint
npm run lint
```

A aplicação sobe em `http://localhost:5173`.

## API mockada

A aplicação usa o MSW para simular toda a API (`/api`). Os mocks são habilitados
automaticamente no desenvolvimento e também em produção quando **não** existe
`VITE_API_URL` configurada (caso do deploy na Vercel). Para controlar manualmente:

```bash
VITE_ENABLE_MOCKS=true
```

Os dados simulados (usuários, NFTs, estoque e pedidos) são persistidos no
`localStorage` do navegador. O catálogo base fica em `src/mocks/catalog.json`.

## Estrutura

```
src/
  components/   # layout e componentes de UI
  features/     # auth, cart, checkout, home, nfts, orders, profile
  lib/          # api, formatação, query client, sessão
  mocks/        # MSW (handlers, banco simulado, catálogo)
  routes/       # rotas do TanStack Router
  types/        # tipos da API
```

## Scripts

| Script | Descrição |
| --- | --- |
| `dev` | Servidor de desenvolvimento com Vite |
| `build` | Type-check + build de produção |
| `lint` | ESLint |
| `preview` | Pré-visualização do build |
