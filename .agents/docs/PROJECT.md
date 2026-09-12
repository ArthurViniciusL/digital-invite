# Convite Interativo — Aniversário de 50 anos de Muricarliton

## 1. Visão geral

Aplicação web (SPA) que serve como convite digital interativo para a festa de 50 anos de **Muricarliton Antônio Figueredo da Silva**, com identidade visual baseada em xilogravura nordestina fundida a estética retrô de videogame ("Cordel Arcade"). A aplicação tem duas frentes:

1. **Página pública do convite**: exibe as informações do evento e um formulário de confirmação de presença (RSVP).
2. **Dashboard administrativo**: área protegida por login onde o organizador acompanha as confirmações recebidas.

Este projeto é 100% digital — não há necessidade de considerar versões impressas ou itens físicos.

## 2. Informações do evento (conteúdo obrigatório)

- **Aniversariante**: Muricarliton Antônio Figueredo da Silva
- **Idade**: 50 anos
- **Data e horário**: 27/09/2026, às 11h30
- **Local**: Alto da Serra Recepções, Cuité
- **Prazo para confirmação de presença (RSVP)**: até 26/09/2026
- Ainda não há texto (verso de cordel) definido para o convite — a redação faz parte do escopo de produção.

## 3. Stack técnica

- **Package manager**: Yarn
- **Build tool**: Vite
- **Framework**: React.js
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Validação de formulários**: Zod
- **Ícones**: Lucide Icons
- **Animações**: Framer Motion
- **Lint**: ESLint configurado com boas práticas de Clean Code
- **Backend/dados**: Supabase (Postgres + Auth)
- **Deploy**: Vercel (subdomínio gerado automaticamente, sem domínio próprio)
- **Dispositivo alvo**: aplicação **responsiva** (funciona bem em mobile e desktop; não é fixa em landscape — essa restrição vale apenas para o jogo, projeto separado)

## 4. Design system

### 4.1 Conceito visual
"**Cordel Arcade**": fusão entre xilogravura nordestina tradicional (traço entalhado, textura granulada, hachuras para sombra) e estética retrô de videogames antigos (referência Atari) — silhuetas mais geométricas e "blocadas", sem adotar cores vibrantes de videogame. Tom: caloroso e festivo, mas sóbrio, sem infantilização.

### 4.2 Paleta de cores
| Cor | Uso | 
| --- | --- |
| **Preto Entalhe** (#1C1410) | Cor principal — traço, ilustrações, texto de destaque |
| **Branco Osso** (#F4EEDD) | Cor principal — fundo, respiro, texto sobre fundo escuro |
| **Marrom Sertão** (#6B4226) | Cor complementar — detalhes sutis, assets, fontes secundárias, hover de botões |

> Observação: os valores HEX acima vêm de um guia de estilo anterior (paleta craft/bege) e precisam ser revalidados/ajustados pelo designer para a nova direção "Branco Osso + Preto Entalhe como base, Marrom Sertão como apoio", sem cor de destaque vibrante adicional.

### 4.3 Tipografia
- **Títulos**: Xilosa
- **Textos comuns**: Caveat

### 4.4 Contornos e formas
Uso de `border-radius` com múltiplos raios (cantos individuais assimétricos) para simular entalhe de xilogravura — formas com "barrigas" e cantos ligeiramente tortos. Exemplo de referência:
```css
border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
```
Aplicar esse tratamento em cards, botões e molduras de imagem, com variação sutil entre elementos para reforçar a sensação de entalhe manual (evitar radius uniforme/perfeitamente simétrico).

### 4.5 Regras de traço e textura (herdadas da xilogravura tradicional)
- Linhas grossas, levemente irregulares — evitar vetores perfeitamente lisos.
- Sombra sempre por hachura (linhas paralelas/cruzadas) — nunca gradiente ou drop shadow suave.
- Textura granulada sutil de papel/impressão pode ser usada como textura de fundo.
- Evitar: gradientes, glow, brilho, transparências, cores vibrantes/saturadas fora da paleta definida.

### 4.6 Iconografia/temas disponíveis (repertório visual)
- Sertão: mandacaru, cactos, sol estilizado, terra rachada
- Flora estilizada
- Elementos religiosos populares (ex-votos) — usar com discrição
- Instrumentos musicais: violão, sanfona, pandeiro, triângulo, zabumba
- Nome "Muricarliton" e "50" como peça tipográfica central, estilo título de cordel

> Assets/ilustrações ainda não existem — serão criados do zero pelo designer dentro do estilo "Cordel Arcade" descrito acima.

## 5. Funcionalidades / Escopo

### 5.1 Página pública do convite
- Rota pública, acessível via link único (mesmo link enviado a todos os convidados — não há personalização por convidado).
- Exibição das informações do evento (nome, "50 anos", data, horário, local).
- Elemento de interatividade (a definir em conjunto com o designer — ex.: abertura animada estilo "abrir folheto de cordel", uso de Framer Motion para transições).
- Formulário de RSVP com os campos:
  - Nome (obrigatório)
  - E-mail (obrigatório)
  - Número de pessoas no convite (obrigatório, numérico — cobre convidados que trazem família)
  - Botão de confirmar presença
- Validação de formulário via Zod.
- Limite esperado: até ~30 registros de RSVP (grupos familiares incluídos).
- RSVP aceito até 26/09/2026 (a UI pode indicar esse prazo, mas não é estritamente necessário bloquear envios após a data — validar com o time se deve haver bloqueio).

### 5.2 Dashboard administrativo
- Rota protegida, acessível apenas mediante login.
- **Autenticação**: e-mail + senha, com token JWT (via Supabase Auth). Um único usuário administrador (o organizador) é suficiente — não há necessidade de múltiplos perfis/papéis.
- Exibe:
  - Total de confirmações recebidas
  - Tabela com colunas: **Nome, E-mail, Número de pessoas, Status**
- Dados lidos diretamente do endpoint/tabela de RSVP no Supabase (a mesma tabela alimentada pelo formulário público).

## 6. Modelagem de dados (Supabase) — proposta inicial

**Tabela `rsvp`**
| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | uuid (PK) | gerado automaticamente |
| `nome` | text | obrigatório |
| `email` | text | obrigatório |
| `number_of_persons` | integer | obrigatório |
| `status` | text/enum | ex.: `confirmado` (definir se haverá outros status, como "cancelado") |
| `created_at` | timestamptz | default now() |

**Regras de acesso (RLS)**:
- Inserção (`INSERT`) na tabela `rsvp`: pública (anon key), sem necessidade de autenticação — é o formulário do convite.
- Leitura (`SELECT`) na tabela `rsvp`: restrita a usuários autenticados (apenas o admin, via dashboard).
- Autenticação do admin: usuário único criado no Supabase Auth (e-mail + senha).

## 7. Fora de escopo (para este projeto)

- Qualquer elemento impresso ou físico (convite em papel, topo de bolo, lembrancinha).
- Link/página personalizada por convidado.
- Múltiplos usuários administradores ou níveis de permissão.
- Envio automático de e-mails de confirmação/lembrete (não solicitado até o momento).
- O jogo 2D de plataforma (projeto separado, com cronograma e stack próprios).

## 8. Prazo

- Desenvolvimento do convite: **10/09/2026 a 12/09/2026**.
- RSVP aberto ao público até: **26/09/2026**.
- Evento: **27/09/2026**.
