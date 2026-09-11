# Digital Invite — 50 anos de Muricarliton

Convite digital interativo para a festa de 50 anos de **Muricarliton Antônio Figueredo da Silva**,
em 27/09/2026, às 11h30, no Alto da Serra Recepções, em Cuité.

A aplicação tem duas frentes:

1. **Página pública do convite** (`/`) — informações do evento e formulário de confirmação de
   presença (RSVP), aberto até 26/09/2026.
2. **Dashboard administrativo** (`/admin`) — área protegida por login onde o organizador acompanha
   as confirmações recebidas.

A identidade visual segue o conceito **"Cordel Arcade"**: xilogravura nordestina (traço entalhado,
hachura, textura granulada) fundida a uma estética retrô de videogame, em tom caloroso e sóbrio.

> **Idioma do código:** todo o código-fonte, incluindo nomes de variáveis, componentes, arquivos e
> comentários, é escrito em inglês. Apenas a documentação e os textos exibidos ao usuário final estão
> em português.

## Stack

| Camada               | Tecnologia                                       |
| -------------------- | ------------------------------------------------ |
| Gerenciador          | Yarn                                             |
| Build                | Vite 8                                           |
| Framework            | React 19 + TypeScript 6 (`strict`)               |
| Estilização          | Tailwind CSS v4 (plugin oficial do Vite)         |
| Componentes          | shadcn/ui (base Radix, preset Nova)              |
| Roteamento           | React Router v7                                  |
| Formulários          | React Hook Form + Zod (`@hookform/resolvers`)    |
| Ícones               | Lucide                                           |
| Animação             | Framer Motion                                    |
| Dados e autenticação | Supabase (Postgres + Auth), consumido no browser |
| Qualidade            | ESLint (flat config, type-aware) + Prettier      |

Não há backend próprio. A segurança dos dados é garantida por Row Level Security no Postgres do
Supabase.

## Rodando localmente

```bash
yarn install
```

```bash
cp .env.example .env.local
```

Preencha as duas variáveis em `.env.local` com os valores do painel do Supabase
(Project Settings → API):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

A `anon key` é pública por natureza — a proteção real dos dados vem das policies de RLS. A chave de
`service role` nunca deve aparecer no client.

```bash
yarn dev
```

## Scripts

| Script              | O que faz                                 |
| ------------------- | ----------------------------------------- |
| `yarn dev`          | Servidor de desenvolvimento               |
| `yarn build`        | Type-check do projeto e build de produção |
| `yarn preview`      | Serve o build de produção localmente      |
| `yarn lint`         | ESLint em todo o projeto                  |
| `yarn lint:fix`     | ESLint com correção automática            |
| `yarn typecheck`    | Apenas o type-check                       |
| `yarn format`       | Prettier em todo o projeto                |
| `yarn format:check` | Verifica formatação sem alterar arquivos  |

## Design tokens

Os tokens ficam em dois arquivos que se complementam:

- `src/styles/globals.css` — as CSS variables da paleta, as pilhas tipográficas e as classes
  utilitárias de contorno entalhado (`.carved-1`, `.carved-2`, `.carved-3`).
- `tailwind.config.ts` — a extensão do tema do Tailwind (`colors`, `fontFamily`), que apenas aponta
  para aquelas variáveis. O arquivo é carregado pela diretiva `@config` no topo do `globals.css`.

Os identificadores estão em inglês e correspondem aos nomes em português do design system:

| Token          | Design system | Valor     |
| -------------- | ------------- | --------- |
| `carved-black` | Preto Entalhe | `#1C1410` |
| `bone-white`   | Branco Osso   | `#F4EEDD` |
| `sertao-brown` | Marrom Sertão | `#6B4226` |

As famílias tipográficas estão disponíveis como `font-title` (Xilosa) e `font-body` (Caveat).

Regras visuais que valem para todo componente construído sobre essa base: sombra sempre por hachura,
nunca gradiente ou drop shadow suave; sem glow, brilho ou transparências; traços grossos e levemente
irregulares, evitando radius uniforme.

## Pendências conhecidas

- **Fonte Xilosa**: os arquivos ainda não foram entregues pelo designer. A pilha de títulos cai em um
  serifado genérico até que o `@font-face` seja adicionado em `src/styles/globals.css` — há um `TODO`
  no arquivo com o trecho pronto. A Caveat já está self-hosted via Fontsource.
- **Assets visuais**: ilustrações, iconografia e textura de papel serão criados do zero pelo designer
  dentro do estilo "Cordel Arcade".
- **Paleta**: os valores HEX vêm de um guia de estilo anterior e ainda precisam ser revalidados pelo
  designer.

## Estado atual do projeto

Esta é a etapa de **setup**. A estrutura de pastas, o roteamento e os tokens estão prontos, e os
componentes existem como stubs marcados com `TODO`. Ainda serão implementados em etapas seguintes:

- o formulário de RSVP funcional e a inserção real no Supabase;
- a autenticação do administrador (`supabase.auth.signInWithPassword`) e o redirecionamento do
  `ProtectedRoute`;
- o dashboard com o card de total de confirmações e a tabela de RSVPs;
- as tabelas e policies no painel do Supabase;
- o deploy na Vercel.
