# Kurio — Marketplace de NFTs

Marketplace de NFTs para colecionadores, criadores e cultura digital. A aplicação
permite explorar um catálogo de obras, montar carrinho, finalizar compras com
carteira digital e acompanhar pedidos — tudo com uma API simulada no navegador.

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
