# Auditoria UX/UI — Loja & Painel Admin (Bravo Business)
### Instrução de trabalho para o Kilo Code

---

## 0. Como usar este documento

Este ficheiro deve ser lido pelo agente de código (Kilo Code) como instrução de execução. O projecto é uma aplicação Angular standalone (v22) com loja pública (`features/shop/*`) e painel administrativo (`features/admin/*`), já ligada a uma API real (`environment.apiUrl`). A base funcional já foi corrigida numa ronda anterior (reactividade com signals, shell do admin, interceptor de sessão, debounce na pesquisa). Este documento foca-se exclusivamente em **experiência de utilizador**: feedback do sistema, estados de carregamento/vazio, responsividade, componentização e polimento visual — para dar ao produto um acabamento de nível profissional, coerente com uma loja em produção.

**Regras gerais para o agente:**

- Confirma o plano de cada fase antes de codificar; não avances sem validação.
- Entrega sempre ficheiros completos (não excertos parciais).
- Não alteres `environment.apiUrl`, `api.models.ts` (contratos de dados) nem o fluxo de checkout via WhatsApp.
- Mantém a linguagem visual existente: Bebas Neue + DM Sans, cor de destaque `#c8a96e`, tokens `--surface`/`--border`/`--r`/`--sh`, ícones Font Awesome (nunca emojis), suporte a modo escuro.
- Texto de interface em português de Portugal (pt-PT).
- Sempre que criares um padrão reutilizável (toast, skeleton, modal de confirmação, estado vazio), extrai-o para `src/app/shared/` como componente/serviço standalone, para não voltar a duplicar-se entre loja e admin.
- Corre `ng build` no final de cada fase para confirmar que compila sem erros.

---

## 1. Resumo executivo

O que já está bem resolvido:
- Estado reactivo com signals em toda a parte admin.
- Debounce na pesquisa de produtos do admin.
- Interceptor de sessão (401 → logout automático).
- Estados vazios já existem em: carrinho, favoritos, catálogo da loja, lista de produtos do admin.
- Toast de sucesso já existe na loja (`toast()` do `global.js` legado — nota: a app Angular actual **não tem equivalente**, ver secção 2.A).

O que falta para um acabamento "produção séria":
1. Feedback de sucesso/erro do admin aparece como banner estático no topo da página — obriga a fazer scroll para ver. Precisa de virar toast/notificação flutuante.
2. Sem spinners/skeletons durante os pedidos à API (loja e admin) — o utilizador só vê "aparecer" o conteúdo sem transição.
3. `window.confirm()` nativo para eliminar produtos/categorias — feio, inconsistente com a marca.
4. Formulário de produto do admin: falta um editor de "detalhes/características" (tamanhos, materiais, etc. — o campo `features` já existe no modelo de dados e é usado para leitura, mas não tem UI de edição).
5. Gestão de galeria de imagens no admin é uma `<textarea>` de URLs em texto livre — não é utilizável por uma pessoa não-técnica.
6. Sidebar do admin em mobile vira uma navbar horizontal — o pedido é que continue como sidebar/drawer com hambúrguer, tal como a loja já faz.
7. Tabela de produtos do admin não é responsiva em ecrãs pequenos.
8. Botão "Ver loja" colado visualmente ao botão de logout, e o logout não segue o estilo dos restantes itens de navegação da sidebar.
9. Falta uma página de detalhe/visualização de produto no admin (ver quando foi criado/actualizado — os campos `createdAt`/`updatedAt` já existem no `ProductApi` e não são mostrados em lado nenhum).
10. Duplicação de markup por várias páginas (cabeçalhos de página, badges, preços) que deveria estar componentizado.

---

## 2. Achados detalhados e proposta de solução

### A. Sistema global de feedback (toast + confirmação) — prioridade máxima

**Problema:** `AdminPageComponent`, `AdminProductsComponent`, `AdminProductFormComponent`, `AdminCategoriesComponent`, `AdminCategoryFormComponent`, `AdminLoginComponent` mostram erro/sucesso através de `<div class="admin-error">`/`<div class="admin-success">` fixos no topo do formulário/painel. Em ecrãs longos (ex.: formulário de produto), o utilizador submete o formulário, a mensagem aparece no topo, mas o scroll continua onde estava — a pessoa não vê nada e pensa que não aconteceu nada.

Adicionalmente, `window.confirm(...)` é usado em `deleteProduct`/`deleteCategory`/`delete(product)` — janela nativa do browser, sem identidade visual.

**Solução proposta:**

1. Criar `src/app/shared/toast/toast.service.ts` — serviço standalone (`providedIn: 'root'`) com um `signal<ToastMessage[]>([])`, método `show(message: string, type: 'success' | 'error' | 'info')`, auto-dismiss em ~4s, suporte a múltiplos toasts empilhados.
2. Criar `src/app/shared/toast/toast-container.component.ts` — componente fixo (`position: fixed; bottom: 26px; right: 26px` no desktop, full-width no mobile), reaproveitando o visual do `.toast` que já existe em `styles.css` (ícone Font Awesome, fundo `var(--text)`, texto `var(--bg)`), mas com variante de cor para erro (usar `var(--danger)` como borda/ícone) e sucesso (usar `var(--accent)` ou verde `#25d366` para alinhar com o WhatsApp da marca).
3. Montar `<app-toast-container>` uma única vez em `app.component.html`, para funcionar tanto na loja como no admin.
4. Substituir, em todos os componentes admin listados acima, `error.set(...)`/`success.set(...)` por chamadas a `toastService.show(...)`. Podes manter os signals `error`/`success` apenas onde ainda sejam necessários para desenhar estado inline (ex.: mensagem de validação por campo), mas o feedback de "operação concluída/falhou" passa a ser sempre toast.
5. Criar `src/app/shared/confirm-dialog/confirm-dialog.service.ts` + componente modal (overlay com blur, caixa `--surface`/`--r`/`--sh-lg`, título, texto, botão "Cancelar" e botão de acção destrutiva a vermelho) para substituir todos os `window.confirm(...)`. Deve devolver uma `Promise<boolean>` ou usar um `Observable`, para manter a chamada tão simples como:
   ```ts
   const confirmed = await this.confirmDialog.ask({
     title: 'Remover produto',
     message: `Tens a certeza que queres remover "${product.name}"? Esta acção não pode ser revertida.`,
     confirmLabel: 'Remover',
     danger: true,
   });
   if (!confirmed) return;
   ```

**Ficheiros afectados:** `app.component.html`, todos os componentes em `features/admin/*` que hoje usam `error()`/`success()`/`window.confirm`.

---

### B. Estados de carregamento (spinners/skeletons)

**Problema:** Não existe nenhum indicador visual enquanto se espera pela API:
- `StoreService.loadCatalog()` na loja — a home e o catálogo mostram grelha vazia até os produtos chegarem, sem feedback.
- `ProductDetailPageComponent` já tem um estado de "A carregar produto..." com spinner Font Awesome — bom exemplo a replicar.
- Admin: `AdminProductsComponent`, `AdminCategoriesComponent`, `AdminPageComponent` têm o signal `loading()` disponível mas não é usado visualmente em lado nenhum excepto para desactivar botões.

**Solução proposta:**

1. Criar `src/app/shared/skeleton/skeleton-card.component.ts` — bloco cinza com animação de "shimmer" (gradiente animado via CSS, usando `var(--surface2)`/`var(--surface3)`), no formato de um `.pcard` (mesma altura/proporção). Usar em:
   - `catalog-page.component.html` — mostrar 8 `<app-skeleton-card>` enquanto `!store.catalogReady()`.
   - `home-page.component.html` — idem nas secções de categoria em destaque.
2. Criar `src/app/shared/skeleton/skeleton-row.component.ts` (ou reutilizar o mesmo componente com `[variant]="'row'"`) para a tabela de produtos/categorias do admin, mostrado enquanto `loading()` é `true` e a lista está vazia.
3. Em botões de submissão (login, guardar produto, guardar categoria), o padrão já usado no login (`[class.fa-spinner]="loading()"` a girar) deve ser replicado em `admin-product-form` e `admin-category-form` (confirmar se já está — está parcialmente feito, mas confirmar consistência visual do `fa-spin`).
4. No modal/página de produto, ao trocar de imagem no upload, mostrar um pequeno spinner sobreposto à pré-visualização durante a leitura do ficheiro (é instantâneo com `URL.createObjectURL`, mas útil manter o padrão para quando a gravação for para o servidor).

---

### C. Formulário de produto do admin — pré-preenchimento, detalhes e galeria

**Nota:** o pré-preenchimento do formulário ao editar **já funciona** (`AdminProductFormComponent.ngOnInit`, quando existe `id`, chama `this.api.products(id)` e faz `this.form.patchValue({...})`, incluindo a imagem actual via `product()?.img` no template). O que falta é:

1. **Detalhes/características do produto** (tamanhos, materiais, etc.):
   - O modelo `Product`/`ProductApi` já tem `features?: string[] | null` e já é lido e mostrado na página de detalhe da loja (secção "Qualidade seleccionada" é fixa — os `features` reais do produto nunca aparecem em lado nenhum na loja!). Corrigir isto também na loja (`product-detail-page.component.html`): substituir a lista fixa de 3 itens por `*ngFor` sobre `item.features`, com fallback para os 3 itens genéricos actuais quando `features` estiver vazio.
   - No admin, adicionar ao `FormGroup` de `AdminProductFormComponent` um `FormArray` (ou uma lista simples gerida fora do form reactivo, tipo `signal<string[]>([])`) chamada "Detalhes do produto". UI: um input de texto + botão "Adicionar" (Enter também deve adicionar), e a lista mostrada como chips/tags removíveis (`<span class="feat-chip">Tamanho: M <button (click)="remove(i)">×</button></span>`). Placeholder com exemplos: "Material: 100% algodão", "Tamanhos: S, M, L, XL".
   - Ao gravar, serializar como `payload.append('features', JSON.stringify(features()))`, tal como já é feito com `galleryUrls`.

2. **Galeria de imagens** — eliminar a exposição de URLs em texto livre ao utilizador comum:
   - Remover do template o `<textarea formControlName="gallery">` visível como campo de texto solto.
   - Ao editar um produto, mostrar as imagens de galeria existentes (`product()?.gallery`) como uma grelha de miniaturas, cada uma com um botão "×" no canto para marcar para remoção (basta filtrá-la da lista antes de reconstruir o `galleryUrls` a enviar — não precisa de chamada extra à API).
   - Manter o campo de upload múltiplo (`onGallerySelected`) mas estilizá-lo como uma zona de "arrastar e largar" (dropzone) em vez do `<input type="file">` cru — pode ser um `<label>` estilizado a englobar o input (padrão comum: borda tracejada, ícone de upload, texto "Arrasta imagens ou clica para escolher").
   - O resultado final: o admin só vê miniaturas e botões de "+" / "×"; nunca escreve ou lê uma URL manualmente.

3. **Metadados só de leitura**: mostrar, quando `editingId` existe, uma pequena secção discreta (texto `--muted`, tipo rodapé do formulário) com "Criado em: {{ product()?.createdAt | date:'dd/MM/yyyy HH:mm' }}" e "Última actualização: {{ product()?.updatedAt | date:'dd/MM/yyyy HH:mm' }}" — usa `DatePipe` (precisa `CommonModule`, já importado).

4. **Remover código morto**: confirmar que não sobra nenhum controlo de formulário não ligado ao template (o antigo campo `img` do `AdminPageComponent.productForm` já não é usado pela versão actual do formulário standalone — ao migrar tudo para o novo componente, o `AdminPageComponent` deixou de ser necessário para produtos/categorias; confirmar se ainda faz sentido manter os métodos `saveProduct`/`deleteProduct`/`saveCategory`/`deleteCategory`/`productForm`/`categoryForm` nesse ficheiro, já que a página `/admin` agora é só o dashboard de visão geral — se não forem usados em lado nenhum do template actual do dashboard, remover para não confundir manutenção futura).

**Ficheiros afectados:** `admin-product-form.component.ts/html/scss`, `product-detail-page.component.html`, `api.models.ts` (confirmar que `CreateProductInput.features` já existe — existe), `admin-page.component.ts` (limpeza).

---

### D. Página de detalhe do produto no admin (nova)

**Pedido:** ver quando o produto foi criado/adicionado, e outros detalhes, numa página dedicada (não apenas no formulário de edição).

**Solução proposta:** criar `src/app/features/admin/admin-product-detail/admin-product-detail.component.ts` (+ html/scss), rota `admin/produtos/:id` (distinta de `:id/editar`). Conteúdo:
- Imagem principal + galeria em miniatura (read-only, clicável para trocar a imagem principal, tal como a página de detalhe da loja).
- Nome, código, categoria, preço (com preço antigo riscado se existir), badge.
- Lista de `features` (detalhes/características).
- Descrição completa.
- Bloco de metadados: criado em / actualizado em.
- Botões: "Editar" (vai para `/admin/produtos/:id/editar`) e "Eliminar" (abre o `ConfirmDialog` da secção 2.A).

Na tabela de produtos (`admin-products.component.html`), o nome do produto ou uma nova acção "olho" (`fa-eye`) deve linkar para esta página de detalhe, ficando: `fa-eye` (ver) · `fa-pen` (editar) · `fa-trash` (eliminar).

---

### E. Painel Admin — sidebar/shell mobile como drawer, não navbar

**Problema:** em `admin-shell.component.scss`, a media query `@media (max-width: 850px)` transforma a sidebar numa barra horizontal fixa no topo (`grid-template-columns: 1fr`, `.admin-nav { display: flex; overflow: auto }`), escondendo o rodapé (`.admin-sidebar-foot p`, `.admin-sidebar-store` ficam com `display: none`). O pedido é que o comportamento mobile siga o mesmo padrão já usado na loja: um botão de hambúrguer que abre a sidebar completa como um **drawer lateral com overlay**, exactamente como `NavbarComponent`/`navbar.component.html` já faz (`.mob-overlay`, `.mob-menu`, transição `translateX`).

**Solução proposta:**

1. Adicionar a `AdminShellComponent` um `mobileOpen = signal(false)` e um botão de hambúrguer visível apenas em mobile (`@media max-width: 850px`), fixo no topo (pequena barra com o logo + hambúrguer, tipo "topbar mobile" — reaproveitar as classes `.hbg`/`span` já existentes em `styles.css` para o ícone de 3 traços).
2. A `<aside class="admin-sidebar">` passa a ter, em mobile, `position: fixed; transform: translateX(-100%)`, com `.on { transform: translateX(0) }` quando `mobileOpen()` for verdadeiro — mesma mecânica do `.mob-menu` da loja, mas a abrir pela esquerda (é uma sidebar, não um menu de conta) ou pela direita, o que fizer mais sentido visualmente; adicionar `<div class="admin-mob-overlay">` com blur, clicável para fechar.
3. Ao navegar (clique num link do menu), fechar o drawer automaticamente (`(click)="mobileOpen.set(false)"` em cada `<a>` da nav, ou subscrever a `Router.events` para fechar em qualquer `NavigationEnd`).
4. O rodapé da sidebar (nome do utilizador, "Ver loja", logout) deixa de ser escondido em mobile — fica dentro do mesmo drawer, sempre acessível, tal como no desktop.

**Ficheiros afectados:** `admin-shell.component.ts/html/scss`.

---

### F. Sidebar do admin — reorganizar "Ver loja" e estilo do logout

**Problema:** `admin-sidebar-foot` tem, em sequência: nome do utilizador, botão de logout (estilo texto simples, cor `var(--danger)`, sem fundo), depois o link "Ver loja" (estilo diferente, texto pequeno cinza). Ficam visualmente colados e com tratamentos inconsistentes — o pedido é que "Ver loja" suba para junto dos outros itens de navegação (mesmo estilo de `.admin-nav a`), e que o logout também siga esse mesmo estilo de botão de navegação (ícone + texto, padding, hover), apenas com uma cor de destaque diferente (ex.: hover a vermelho) para sinalizar que é uma acção diferente — sem parecer "gerado por IA"/deslocado do resto do design.

**Solução proposta:**

1. Mover o link "Ver loja" (`<a routerLink="/loja">`) para dentro de `<nav class="admin-nav">`, como mais um item de navegação (com o mesmo `<i class="fa-solid ...">` + texto), posicionado no topo ou como último item da lista principal — não como um extra separado no rodapé. Sugestão de ícone: `fa-store` ou `fa-arrow-up-right-from-square`.
2. Transformar o `<button (click)="logout()">` para usar exactamente as mesmas classes/estrutura visual de `.admin-nav a` (ícone à esquerda + texto, mesmo padding/border-radius/font-size), mas como `<button class="admin-nav-link admin-nav-danger">` — no CSS, criar uma variante `.admin-nav a.danger, .admin-nav button.danger { color: var(--danger) } .admin-nav a.danger:hover, .admin-nav button.danger:hover { background: rgba(224,85,85,.1); color: var(--danger) }` em vez do sublinhado actual.
3. O rodapé da sidebar (`.admin-sidebar-foot`) passa a conter apenas o nome do utilizador (ex.: como um pequeno cartão com avatar/inicial + nome), servindo de identificação, sem mais acções penduradas ali.

**Ficheiros afectados:** `admin-shell.component.html`, `admin-shell.component.scss`.

---

### G. Tabela de produtos do admin — responsividade

**Problema:** `admin-products.component.html` usa uma `<table class="admin-table">` dentro de `.admin-table-wrap { overflow-x: auto }` — em ecrãs pequenos isto obriga a fazer scroll horizontal para ver preço/badge/acções, o que é uma má experiência táctil.

**Solução proposta:** abaixo de um breakpoint (ex.: 700px), esconder a tabela e mostrar a mesma informação como uma lista de cartões (padrão já usado em `.ditem`/`.account-list` do carrinho/favoritos da loja — reaproveitar esse padrão visual):

```html
<!-- desktop: tabela normal -->
<table class="admin-table hide-sm">...</table>

<!-- mobile: cartões -->
<div class="admin-product-cards show-sm">
  <article class="admin-product-card" *ngFor="let product of products()">
    <img [src]="product.img" [alt]="product.name" />
    <div>
      <strong>{{ product.name }}</strong>
      <span>{{ product.categorySlug }} · {{ product.price | number }} Kz</span>
      <span class="admin-badge" *ngIf="product.badge">{{ product.badge }}</span>
    </div>
    <div class="admin-row-actions">
      <a [routerLink]="['/admin/produtos', product.id]"><i class="fa-solid fa-eye"></i></a>
      <a [routerLink]="['/admin/produtos', product.id, 'editar']"><i class="fa-solid fa-pen"></i></a>
      <button (click)="delete(product)"><i class="fa-solid fa-trash"></i></button>
    </div>
  </article>
</div>
```
Usar classes utilitárias `hide-sm`/`show-sm` já existentes em `styles.css` (ou criar `.show-sm { display: none } @media (max-width: 700px) { .hide-sm { display: none } .show-sm { display: block } }`) — mesmo princípio aplicado à lista de categorias, que já usa cartões (`admin-category-list`) e só precisa de confirmar que o grid colapsa bem em 1 coluna (já tem `@media 850px { grid-template-columns: 1fr }` no SCSS partilhado — confirmar visualmente).

Rever também o `.admin-form` do formulário de produto/categoria em ecrãs pequenos: já tem `grid-template-columns: 1fr` a partir de 850px — confirmar que a pré-visualização de imagem, chips de detalhes e dropzone de galeria (novos, da secção C) também se ajustam correctamente a 1 coluna.

**Ficheiros afectados:** `admin-products.component.html/ts`, `admin-page.component.scss` (partilhado por várias páginas admin), `styles.css` (classes utilitárias, se ainda não existirem globais suficientes).

---

### H. Componentização — duplicação a eliminar

Padrões repetidos em vários templates que devem virar componentes `shared/`:

| Padrão duplicado | Onde aparece hoje | Componente a extrair |
|---|---|---|
| Badge de produto (Sale/Premium/Novo) | `product-card.component.html`, `product-detail-page.component.html`, `admin-products.component.html` | `<app-product-badge [badge]="...">` |
| Preço com preço antigo riscado | `product-card.component.html`, `cart-page.component.html`, `product-detail-page.component.html` | `<app-price [price]="..." [oldPrice]="...">` (usa `store.formatPrice` internamente) |
| Cabeçalho `.page-hero` (eyebrow + título + texto) | `home`, `catalog`, `contactos`, `info-page`, `cart-page` | `<app-page-hero [eyebrow]="..." [title]="..." [subtitle]="...">` |
| Estado vazio (ícone + título + texto + CTA) | `cart-page`, `wishlist-page`, `catalog-page`, `admin-products` (`.admin-empty`) | `<app-empty-state [icon]="..." [title]="..." [text]="..." [ctaLink]="..." [ctaLabel]="...">` |
| Linha de item de carrinho/favorito (`.ditem`) | `cart-page.component.html`, `global.js` legado | já são suficientemente parecidos para extrair `<app-cart-line-item>` reutilizado em ambos os drawers/páginas |

Isto reduz drasticamente o risco de o que aconteceu no passado (sidebar do admin duplicada em 5 sítios, ver `bravo-business-admin-auditoria-plano-correcao.md`, Causa Raiz #2) se repetir noutra área da aplicação.

---

### I. Outras melhorias de e-commerce (nice-to-have, baixa prioridade)

Itens comuns em lojas online de referência que não foram pedidos explicitamente mas valem a pena registar:

- Paginação real na tabela de produtos/categorias do admin (hoje o `AdminApiService.products()` já pede `limit: 100` fixo — se o catálogo crescer, isto deixa de escalar).
- Ordenar/filtrar produtos por categoria também no admin (só existe pesquisa por texto).
- Contador de resultados de pesquisa no admin (ex.: "12 produtos encontrados"), tal como já existe na loja (`.catalog-meta`).
- Página 404 dedicada em vez do redireccionamento silencioso para `/loja` (`{ path: '**', redirectTo: 'loja' }`).
- Debounce também na pesquisa/filtros do catálogo da loja (`catalog-page.component.ts` chama `apply()` directamente em cada `ngModelChange`) — hoje é tudo local (sem pedido à API), por isso é de impacto baixo, mas melhora a fluidez em telemóveis mais lentos.
- Indicador de "produto adicionado" mais visível no botão (ex.: ícone muda para "check" durante 1s) além do toast.

---

## 3. Plano de implementação por fases

### Fase 1 — Sistema global de feedback (toast + confirm dialog)
Ver secção 2.A. Base para todas as fases seguintes (todas as fases usam o toast em vez de banners).

### Fase 2 — Sidebar admin: mobile drawer + reorganização "Ver loja"/logout
Ver secções 2.E e 2.F. Alterações isoladas a `admin-shell.*`.

### Fase 3 — Responsividade da tabela de produtos/categorias do admin
Ver secção 2.G.

### Fase 4 — Estados de carregamento (skeletons/spinners)
Ver secção 2.B. Componentes novos em `shared/skeleton/`.

### Fase 5 — Formulário de produto: detalhes/características + galeria estilizada + metadados
Ver secção 2.C. Inclui a correcção da página de detalhe da loja para mostrar `features` reais.

### Fase 6 — Página de detalhe de produto no admin
Ver secção 2.D. Depende da Fase 1 (toast/confirm) e reaproveita padrões da Fase 5.

### Fase 7 — Componentização (badge, preço, page-hero, empty-state)
Ver secção 2.H. Fazer por último, depois de todas as outras fases estabilizarem os templates, para evitar reabrir ficheiros já mexidos várias vezes.

### Fase 8 (opcional) — Melhorias de e-commerce da secção 2.I
A avaliar com o Elizandro após as fases 1–7 estarem em produção.

---

## 4. Checklist de aceitação

- [ ] Nenhuma mensagem de sucesso/erro no admin obriga a fazer scroll — todas aparecem como toast visível.
- [ ] Eliminar um produto/categoria abre um modal de confirmação com a identidade visual da marca, nunca `window.confirm`.
- [ ] Catálogo da loja e tabelas do admin mostram skeleton/spinner enquanto aguardam a API, nunca uma grelha em branco.
- [ ] Editar um produto mostra a imagem principal, a galeria existente (com opção de remover cada imagem) e os detalhes/características já preenchidos.
- [ ] É possível adicionar/remover "detalhes do produto" (tamanho, material, etc.) no formulário do admin, sem escrever JSON ou texto solto.
- [ ] Já não existe nenhum campo de texto livre para URLs de galeria visível ao utilizador do admin.
- [ ] A página de detalhe do produto no admin mostra data de criação e de última actualização.
- [ ] A loja mostra as características reais do produto (`features`) na página de detalhe, não uma lista fixa genérica.
- [ ] Em mobile, o painel admin abre como sidebar/drawer com hambúrguer (igual à loja), nunca como navbar horizontal, e o botão de logout continua sempre acessível.
- [ ] "Ver loja" está junto dos restantes itens de navegação da sidebar, com o mesmo estilo; o botão de logout usa a mesma estrutura visual dos outros itens, apenas com destaque de cor diferente.
- [ ] A tabela de produtos do admin é totalmente legível e utilizável em ecrãs de telemóvel, sem scroll horizontal forçado.
- [ ] `ng build --configuration production` compila sem erros nem avisos novos.
- [ ] A loja pública (checkout WhatsApp, carrinho, favoritos) continua a funcionar exactamente como antes — nenhuma destas fases deve alterar essa lógica de negócio.