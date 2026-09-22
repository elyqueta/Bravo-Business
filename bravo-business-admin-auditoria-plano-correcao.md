# Auditoria Técnica — Painel Admin (Bravo Business)
### Diagnóstico das causas principais + plano de correcção para o agente de código

---

## 0. Como usar este documento

Este ficheiro é para ser lido pelo teu agente de código como instrução de trabalho. Está organizado em:

1. **Causas raiz** — os problemas estruturais que geram os sintomas que reportaste.
2. **Outros problemas encontrados** — bugs e riscos adicionais detectados durante a auditoria, não mencionados por ti mas que afectam a experiência do utilizador ou a integridade dos dados.
3. **Plano de correcção por fases** — passos concretos, ficheiro a ficheiro, para o agente executar.
4. **Regras gerais** que o agente deve respeitar durante toda a execução.
5. **Checklist de aceitação** para validar no final que nada foi quebrado.

**Regras gerais para o agente (aplicam-se a todas as fases):**

- Confirma o plano de cada fase antes de escrever código; não avances para a fase seguinte sem validação.
- Prefere edições cirúrgicas aos ficheiros existentes em vez de reescrever tudo do zero. Só justifica-se substituição completa de um ficheiro quando a fase o pede explicitamente (ex.: extracção de um novo componente partilhado).
- Entrega sempre ficheiros completos e funcionais (não excertos parciais) para qualquer ficheiro que edites.
- Não alteres o backend/API (`environment.apiUrl`), os contratos de dados (`api.models.ts`), o fluxo de checkout via WhatsApp, nem o comportamento da loja pública (`StoreService`, páginas `loja/*`) — o âmbito é exclusivamente o painel `admin/*`.
- Mantém a linguagem visual existente: tipografia Bebas Neue + DM Sans, cor de destaque `#c8a96e`, tokens `--surface`/`--border`/`--r`, ícones Font Awesome, modo escuro.
- Depois de cada fase, corre `ng build` (ou equivalente) para confirmar que compila sem erros antes de passar à fase seguinte.

---

## 1. Causas raiz identificadas

### Causa Raiz #1 — A interface não reage às respostas assíncronas (state não-reactivo)

**Sintomas que explica:**
- A mensagem de erro de login só aparece depois de o utilizador escrever um espaço num dos campos.
- O dashboard, a página de Produtos e a página de Categorias só mostram dados depois de clicar em "Actualizar".
- Ao eliminar um registo, a lista não reflecte a remoção de imediato.

**O que está a acontecer:**

Todos os componentes afectados (`AdminLoginComponent`, `AdminPageComponent`, `AdminProductsComponent`, `AdminProductFormComponent`, `AdminCategoriesComponent`, `AdminCategoryFormComponent`) guardam o estado que vem da API em **propriedades de classe simples**:

```ts
// AdminPageComponent
products: ProductApi[] = [];
categories: CategoryApi[] = [];
error = "";
success = "";
```

Estas propriedades são actualizadas dentro do callback `next`/`error` de um `.subscribe(...)` numa chamada HTTP:

```ts
this.api.products(this.search).subscribe({
  next: (response) => { this.products = response.data; this.loading = false; },
  ...
});
```

Quando essa resposta chega, a Angular precisa de correr uma nova ronda de *change detection* para a vista reflectir o novo valor de `this.products`. Isso depende do Angular saber que "algo mudou" — o que normalmente é accionado automaticamente pelo `zone.js` quando uma tarefa assíncrona (como um pedido HTTP) termina.

**Porque é que a loja pública (`StoreService`) não sofre disto:**

O `StoreService` usa **Angular Signals** (`signal<Product[]>([])`, `.set(...)`) para guardar `products`, `cart`, `wishlist`, etc. Os *signals* têm o seu próprio mecanismo de reactividade, **independente do zone.js** — quando um valor muda via `.set()`, qualquer parte da vista que o lê (`store.products()`) é notificada e actualizada de forma fiável, seja qual for o estado do *change detection* baseado em zonas.

O `AuthService.user` também é um *signal* — por isso o nome do utilizador e o estado de sessão no `AdminPageComponent` (que lê `auth.user()`) funcionam correctamente, enquanto `this.products`/`this.error`/`this.loading` (propriedades simples, no mesmo componente) não.

Isto explica de forma unificada **três dos cinco sintomas reportados**: sempre que o estado alterado é uma propriedade simples dentro de um callback assíncrono, a vista só se actualiza quando surge, por coincidência, outro evento tratado directamente pelo Angular (um clique em "Actualizar", escrever um espaço num input) — porque esse evento é despoletado por um *event listener* que o próprio Angular gere directamente e que força uma nova passagem de *change detection*, revelando o valor que já tinha sido actualizado silenciosamente.

**Como confirmar isto em runtime (fazer antes de corrigir, para teres a certeza):**

1. Abre o painel admin, faz login com credenciais erradas de propósito.
2. Abre a consola do browser e o separador Network — confirma que o pedido `POST /auth/login` retorna e falha (erro 401/400).
3. Sem tocar em mais nada, verifica se `<p class="admin-form-error">` aparece no DOM (Elements/Inspector) — se o texto **já estiver no DOM mas invisível/desactualizado visualmente**, é outro problema; se o elemento **nem sequer existir no DOM** até interagires com o formulário, confirma a hipótese acima.
4. Verifica em `angular.json` → `polyfills` se `zone.js` está mesmo a ser carregado (já está listado) e confirma no `main.ts` que não existe nenhuma chamada a `provideExperimentalZonelessChangeDetection()`/`provideZonelessChangeDetection()` — não existe nos ficheiros fornecidos, o que reforça que isto é um problema de propagação e não uma configuração explícita de zoneless.

**Correcção recomendada (ver Fase 2 do plano):** migrar o estado destes componentes (`products`, `categories`, `error`, `success`, `loading`) de propriedades simples para `signal()`, replicando o padrão já usado em `StoreService`/`AuthService`. Esta é a correcção mais robusta porque resolve o problema **independentemente da causa exacta subjacente ao zone.js**, e alinha o código admin com o padrão que já existe (e já funciona) no resto da aplicação.

---

### Causa Raiz #2 — Layout do sidebar duplicado e inconsistente entre páginas

**Sintoma que explica:** o botão de logout desaparece ao sair do Dashboard para Produtos/Categorias.

**O que está a acontecer:**

O bloco `<aside class="admin-sidebar">` (marca, navegação, rodapé) está **copiado manualmente** em cada um dos seguintes ficheiros, em vez de existir uma única fonte de verdade:

| Ficheiro | Tem botão de logout? | Usa `routerLinkActive` dinâmico? |
|---|---|---|
| `admin-page.component.html` (Dashboard) | ✅ Sim | ✅ Sim |
| `admin-products.component.html` | ❌ Não — só tem link "Ver loja" | ❌ Não — `class="active"` fixo no HTML |
| `admin-product-form.component.html` | ❌ Não tem sequer `admin-sidebar-foot` | ❌ Não |
| `admin-categories.component.html` | ❌ Não tem `admin-sidebar-foot` | ❌ Não — `class="active"` fixo |
| `admin-category-form.component.html` | ❌ Não tem `admin-sidebar-foot` | ❌ Não |

Ou seja: **só o Dashboard foi actualizado** com o botão de logout numa ronda anterior de alterações; as outras quatro páginas nunca receberam essa alteração porque cada uma mantém a sua própria cópia do sidebar. É um problema clássico de duplicação de código (DRY violado) — qualquer alteração futura ao sidebar (novo link, alteração de estilo, etc.) tem de ser replicada manualmente em 5 sítios, e é isso que já está a falhar aqui.

**Correcção recomendada (ver Fase 1 do plano):** extrair um único componente `AdminShellComponent` que contenha o sidebar completo (marca, navegação com `routerLinkActive` dinâmico em todos os links, nome do utilizador, botão de logout, link "Ver loja") e um `<router-outlet>` ou `<ng-content>` para o conteúdo de cada página. As 6 páginas admin passam a usar este *shell* único.

---

### Causa Raiz #3 — Regra CSS que esconde o rodapé do sidebar em mobile

**Sintoma que explica:** em mobile, o sidebar vira navbar e o botão de logout não aparece — mesmo no Dashboard.

**Evidência exacta**, em `admin-page.component.scss` (e replicada por `styleUrls` nos outros componentes admin que apontam para o mesmo ficheiro):

```scss
@media (max-width: 850px) {
  ...
  .admin-sidebar-foot {
    display: none;   // <- esconde TUDO: nome do utilizador, "Ver loja" E o botão de logout
  }
  ...
}
```

Esta regra esconde por completo o bloco `.admin-sidebar-foot` a partir de ecrãs com 850px ou menos, **sem qualquer alternativa visível para terminar sessão em mobile**. Não é uma consequência da Causa Raiz #1 ou #2 — é um bug CSS directo e independente, confirmado no código.

**Correcção recomendada (ver Fase 1 do plano, junto com a extracção do shell):** ao mover o sidebar para o `AdminShellComponent`, redesenhar o comportamento mobile para que o botão de logout continue acessível (por exemplo, como ícone no topo da navbar mobile, ou dentro de um menu de utilizador dedicado) em vez de simplesmente escondido.

---

## 2. Outros problemas encontrados (não reportados, mas relevantes)

Durante a auditoria foram identificados problemas adicionais que valem a pena corrigir na mesma intervenção, por ordem de impacto:

**A. Guard de sessão não valida expiração do token — só verifica se existe**
`adminGuard` (`admin.guard.ts`) chama `auth.isAuthenticated()`, que é apenas `!!this.token()` — confirma que existe um valor em `localStorage`, não que o token ainda é válido no servidor. Se o token expirar, o utilizador passa o guard mas todas as chamadas à API começam a falhar com mensagens genéricas ("Não foi possível carregar..."), sem nunca ser reencaminhado para o login. Recomenda-se um interceptor HTTP que detecte respostas `401` e force `auth.logout()` + redireccionamento automático.

**B. Condição de corrida no formulário de edição de produto**
Em `AdminProductFormComponent.ngOnInit()`, as chamadas `this.api.categories()` e `this.api.products(id)` são disparadas em paralelo e resolvem de forma assíncrona e independente. Se a resposta de `categories()` chegar **depois** da resposta de `products(id)` já ter definido correctamente `categorySlug` no formulário, o callback de `categories()` sobrepõe-no com `this.categories[0]?.slug` (a primeira categoria da lista) — corrompendo silenciosamente a categoria seleccionada ao editar um produto. Isto é reproduzível e pode levar a produtos guardados na categoria errada sem o utilizador perceber.

**C. Falta de debounce na pesquisa de produtos**
Em `AdminProductsComponent`, o campo de pesquisa dispara `load()` a cada tecla (`(ngModelChange)="load()"`), gerando um pedido HTTP por cada carácter escrito. Além da carga desnecessária na API, respostas podem chegar fora de ordem (uma pesquisa antiga a resolver depois de uma mais recente), mostrando resultados desactualizados. Recomenda-se debounce (ex.: 300–400ms).

**D. Chamadas a `categories()` repetidas e não partilhadas**
`AdminPageComponent`, `AdminProductsComponent`... na verdade só o form usa; mas `AdminPageComponent` e `AdminProductFormComponent` chamam `this.api.categories()` de forma independente sempre que a página carrega, sem qualquer cache ou estado partilhado. Não é um bug crítico, mas é uma oportunidade de simplificação quando o estado for migrado para signals (Fase 2) — pode centralizar-se num serviço `AdminStoreService` semelhante ao `StoreService` da loja.

**E. Sem feedback visual durante a eliminação de um registo**
O `loading` só é activado durante `load()`/`loadAll()`, nunca durante o próprio pedido de `delete()`. Combinado com a Causa Raiz #1, isto faz o botão de eliminar parecer "morto" entre o clique e a lista actualizar.

**F. Fugas de memória com `URL.createObjectURL`**
Em `AdminProductFormComponent.onImageSelected()`/`onGallerySelected()`, cada `URL.createObjectURL(file)` gerado nunca é libertado com `URL.revokeObjectURL(...)`. Em sessões admin longas com muitas trocas de imagem, isto acumula referências na memória do browser. Baixa prioridade, mas fácil de corrigir.

**G. Reload completo em vez de navegação SPA após login**
`AdminLoginComponent.submit()` usa `window.location.assign("/admin")` no sucesso, em vez de `router.navigateByUrl('/admin')`. Isto força um recarregamento completo da página (mais lento, perde o estado da SPA) em vez de uma transição instantânea. Não é a causa do bug do dashboard (a Causa Raiz #1 explica isso), mas depois de corrigida a Causa Raiz #1, vale a pena trocar para navegação SPA para uma transição mais rápida e consistente com o resto da aplicação.

**H. `<select>`/campo `img` morto no formulário de produto**
O `FormGroup` de `AdminProductFormComponent` declara um controlo `img: [""]` que nunca está ligado a nenhum `<input>` no template (a imagem é sempre submetida via `FormData`/`this.imageFile`). É código morto que pode confundir manutenção futura — remover ou documentar a intenção.

**I. Eliminação de categoria sem aviso sobre produtos associados**
Eliminar uma categoria que ainda tem produtos atribuídos não avisa o utilizador disso (só pede confirmação genérica "Remover {label}?"). Se o backend não impedir isto, produtos ficam com uma `categorySlug` órfã. Recomenda-se, no mínimo, reforçar o texto de confirmação; idealmente validar do lado do backend também (fora do âmbito deste documento, mas vale a pena assinalar à equipa responsável pela API).

---

## 3. Plano de correcção por fases

> Ordem pensada para entregar as correcções de maior impacto visível primeiro (Causa Raiz #2 + #3 resolvem-se em conjunto na mesma fase, por partilharem o mesmo ficheiro-alvo), evitando retrabalho.

### Fase 1 — Extrair `AdminShellComponent` (resolve Causa Raiz #2 e #3)

**Objectivo:** existir uma única fonte de verdade para o sidebar/navbar admin, incluindo o botão de logout, sempre visível (desktop e mobile).

**Passos:**

1. Criar `src/app/features/admin/shell/admin-shell.component.ts` (+ `.html` + `.scss`), como componente `standalone`, que:
   - Injecta `AuthService` (para `auth.user()` e `logout()`).
   - Renderiza a marca (logo + "BRAVOBUSINESS"), a navegação (Visão geral / Produtos / Categorias) usando `routerLink` + `routerLinkActive="active"` em **todos** os itens, sem excepção.
   - Renderiza o rodapé do sidebar: nome do utilizador (`auth.user()?.fullName || "Administrador"`), botão de logout, link "Ver loja".
   - Expõe um `<router-outlet>` (opção recomendada, mais simples de integrar com as rotas existentes) **ou** `<ng-content>` (se preferires manter os componentes actuais como filhos explícitos) para a área de conteúdo.
2. Mover para este componente o CSS actualmente em `admin-page.component.scss` referente a `.admin-shell`, `.admin-sidebar*`, `.admin-nav`, `.icon-picker-*` só se for partilhado — o resto (`.admin-content`, `.admin-stats`, tabelas, formulários) fica nos componentes de página, já que é específico de cada um.
3. **Corrigir o comportamento mobile nesta mesma alteração:** em vez de `.admin-sidebar-foot { display: none; }`, redesenhar para que o botão de logout continue acessível — por exemplo, manter `.admin-sidebar-foot` visível mas compacto (só ícone + tooltip), ou movê-lo para dentro da barra de navegação horizontal em `.admin-nav` no breakpoint mobile. Não eliminar a possibilidade de logout em nenhum tamanho de ecrã.
4. Actualizar `app.routes.ts` para que as rotas `admin`, `admin/produtos`, `admin/produtos/novo`, `admin/produtos/:id/editar`, `admin/categorias`, `admin/categorias/nova`, `admin/categorias/:id/editar` passem a ter o `AdminShellComponent` como componente pai (rota com `children`), com `canActivate: [adminGuard]` aplicado uma única vez ao pai em vez de repetido em cada filho.
5. Remover de `admin-page.component.html`, `admin-products.component.html`, `admin-product-form.component.html`, `admin-categories.component.html`, `admin-category-form.component.html` todo o bloco `<aside class="admin-sidebar">...</aside>` — cada um destes fica só com `<section class="admin-content">...</section>` (o conteúdo específico da página).
6. Confirmar que `AdminLoginComponent` **não** usa o `AdminShellComponent` (a página de login não deve ter sidebar).

**Teste desta fase:** navegar entre Dashboard → Produtos → Categorias → Novo Produto → Nova Categoria em desktop e em mobile (ou DevTools em modo responsivo), confirmando que o botão de logout está sempre visível e funcional, e que o item de navegação activo é sempre destacado correctamente.

---

### Fase 2 — Migrar estado assíncrono para Signals (resolve Causa Raiz #1)

**Objectivo:** garantir que a vista reflecte sempre o estado mais recente, sem depender de um evento adicional para "acordar" a detecção de alterações.

**Padrão a aplicar, componente a componente** (exemplo ilustrativo com `AdminProductsComponent`):

```ts
// Antes
products: ProductApi[] = [];
loading = false;
error = "";

load(): void {
  this.loading = true;
  this.api.products(this.search).subscribe({
    next: (response) => { this.products = response.data; this.loading = false; },
    error: () => { this.error = "..."; this.loading = false; },
  });
}
```

```ts
// Depois
readonly products = signal<ProductApi[]>([]);
readonly loading = signal(false);
readonly error = signal("");

load(): void {
  this.loading.set(true);
  this.api.products(this.search).subscribe({
    next: (response) => { this.products.set(response.data); this.loading.set(false); },
    error: () => { this.error.set("..."); this.loading.set(false); },
  });
}
```

E no template, as leituras passam a ser chamadas de função: `*ngFor="let product of products()"`, `*ngIf="loading()"`, `{{ error() }}`.

**Aplicar este padrão aos seguintes componentes e respectivos campos de estado:**

| Componente | Campos a migrar para `signal()` |
|---|---|
| `AdminLoginComponent` | `loading`, `error` |
| `AdminPageComponent` | `products`, `categories`, `loading`, `error`, `success` |
| `AdminProductsComponent` | `products`, `search`, `loading`, `error` |
| `AdminProductFormComponent` | `categories`, `product`, `loading`, `error`, `imagePreview`, `galleryPreviews` |
| `AdminCategoriesComponent` | `categories`, `error` |
| `AdminCategoryFormComponent` | `category`, `loading`, `error`, `iconPickerOpen` |

**Passos por componente:**

1. Trocar cada propriedade simples por `signal(valorInicial)` (ou `signal<Tipo>(valorInicial)` quando o tipo não é inferível).
2. Trocar todas as atribuições directas (`this.x = y`) por `this.x.set(y)`, e mutações relativas (`this.x++`, `this.x.push(...)`) por `this.x.update(current => ...)`.
3. Actualizar o template correspondente: todas as leituras passam a `x()`.
4. Actualizar `[disabled]`, `*ngIf`, `{{ }}`, `[class.x]` que dependam destes campos, adicionando `()`.
5. Recompilar e testar manualmente o fluxo completo do componente (não só o bug original) para garantir que nada ficou por converter.

**Teste desta fase:**
- Login com credenciais erradas → mensagem de erro deve aparecer imediatamente, sem interagir com mais nenhum campo.
- Login com credenciais correctas → dashboard deve mostrar dados imediatamente após a navegação, sem clicar em "Actualizar".
- Ir a Produtos e a Categorias directamente (navegação SPA) → listas devem popular sem intervenção.
- Eliminar um produto/categoria → a lista deve reflectir a remoção de imediato.

---

### Fase 3 — Reforço de sessão (Problema A)

1. Criar um novo interceptor funcional, `src/app/core/session.interceptor.ts`, que:
   - Intercepta erros HTTP com `catchError`.
   - Se o `status` for `401`, chama `AuthService.logout()` (que já limpa o `localStorage` e navega para `/admin/login`).
   - Repropaga o erro (`throwError`) para que o `.subscribe({ error: ... })` de cada chamada continue a mostrar a sua mensagem local, se aplicável.
2. Registar este novo interceptor em `main.ts`, a par do `authInterceptor` já existente: `provideHttpClient(withInterceptors([authInterceptor, sessionInterceptor]))`.
3. Testar: simular um token inválido (editar manualmente o valor em `localStorage` no DevTools) e confirmar que qualquer acção admin redirecciona automaticamente para o login, em vez de ficar preso a mostrar erros genéricos.

---

### Fase 4 — Correcções secundárias (Problemas B, C, E, F, G, H)

Aplicar de forma independente, cada uma é isolada e de baixo risco:

1. **(B) Condição de corrida no formulário de edição:** em `AdminProductFormComponent.ngOnInit()`, só aplicar o valor por omissão `this.categories[0]?.slug` ao `categorySlug` quando **não** se está a editar (`!this.editingId`). Quando `this.editingId` existir, deixar exclusivamente o callback de `this.api.products(id)` definir `categorySlug`, a partir do produto carregado.
2. **(C) Debounce na pesquisa:** em `AdminProductsComponent`, substituir o `(ngModelChange)="load()"` directo por um mecanismo com atraso (RxJS `Subject` + `debounceTime(350)` + `distinctUntilChanged()`, ou um `setTimeout`/`clearTimeout` simples se preferires evitar introduzir RxJS extra).
3. **(E) Feedback durante eliminação:** adicionar um estado (`deletingId` como `signal<string | null>(null)`, definido no fluxo da Fase 2) para desactivar/mostrar spinner no botão de eliminar da linha em causa enquanto o pedido está em curso.
4. **(F) Revogar `ObjectURL`:** guardar as URLs criadas e chamar `URL.revokeObjectURL(...)` quando substituídas por uma nova selecção de imagem, e no `ngOnDestroy` do componente.
5. **(G) Login com navegação SPA:** trocar `window.location.assign("/admin")` por `this.router.navigateByUrl("/admin")` em `AdminLoginComponent.submit()` — **só aplicar esta alteração depois da Fase 2 estar validada**, já que a Fase 2 é o que garante que o dashboard vai mostrar dados correctamente numa navegação SPA (sem reload completo).
6. **(H) Remover controlo morto:** remover `img: [""]` do `FormGroup` em `AdminProductFormComponent`, confirmando que nada depende dele (`value.img` não é usado no `save()`).

---

### Fase 5 — Testes de regressão e checklist final

Executar manualmente, em desktop e em mobile (ou emulação DevTools), depois de todas as fases:

- [ ] Login com credenciais erradas → erro aparece de imediato.
- [ ] Login com credenciais correctas → navega para o dashboard e os dados aparecem sem clicar em "Actualizar".
- [ ] Navegar Dashboard → Produtos → Categorias → Novo Produto → Editar Produto → Nova Categoria → Editar Categoria, em ambas as direcções.
- [ ] Botão de logout visível e funcional em **todas** as páginas admin, em desktop e mobile.
- [ ] Eliminar um produto e uma categoria → lista actualiza de imediato, sem clique adicional.
- [ ] Editar um produto existente → confirmar que a categoria pré-seleccionada no formulário corresponde sempre à categoria real do produto (testar em ligação lenta/throttled no DevTools, para expor melhor a condição de corrida corrigida).
- [ ] Pesquisar produtos rapidamente → não deve gerar um pedido de rede por cada tecla.
- [ ] Sessão expirada/token inválido → redirecciona automaticamente para o login em vez de mostrar erros genéricos indefinidamente.
- [ ] A loja pública (`/loja`, `/loja/produtos`, carrinho, favoritos, checkout WhatsApp) continua a funcionar exactamente como antes — nenhuma destas fases deve tocar em `StoreService` nem nas páginas `features/shop/*`.
- [ ] `ng build --configuration production` compila sem erros nem avisos novos.

---

## 4. Resumo — mapeamento sintoma → causa → fase de correcção

| Sintoma reportado | Causa raiz | Fase que resolve |
|---|---|---|
| Erro de login só aparece após espaço no input | Causa #1 — estado não-reactivo | Fase 2 |
| Dashboard exige clique em "Actualizar" | Causa #1 | Fase 2 |
| Produtos/Categorias exigem clique em "Actualizar" | Causa #1 | Fase 2 |
| Eliminar registo não reflecte de imediato | Causa #1 | Fase 2 (+ Fase 4.3 para feedback visual) |
| Logout desaparece ao sair do Dashboard | Causa #2 — sidebar duplicado | Fase 1 |
| Logout invisível em mobile | Causa #3 — CSS `display:none` | Fase 1 |
