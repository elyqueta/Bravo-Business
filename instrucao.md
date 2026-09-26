# Auditoria UX/UI, Formulários & Segurança — Bravo Business (Angular)
### Instrução de trabalho complementar para o agente de código

---

## 0. Como usar este documento

Este ficheiro complementa `instrucao.md` (já em grande parte implementado: toasts, confirm dialog, skeletons de catálogo/tabela, sidebar mobile do admin, formulário de produto com detalhes/galeria). Foca-se em quatro frentes pedidas explicitamente: **(1)** estados visuais dos inputs a igualar a referência anexada, **(2)** animação de submissão diferente do skeleton de GET, **(3)** máscara de preço "estilo banco", **(4)** segurança de tokens/CSP — mais um conjunto de achados extra de responsividade e robustez encontrados durante a análise.

**Regras gerais (mantidas de `instrucao.md`):**
- Confirma o plano de cada fase antes de codificar.
- Entrega ficheiros completos.
- Não alteres `environment.apiUrl`, `api.models.ts` nem o fluxo de checkout via WhatsApp.
- Mantém a linguagem visual: Bebas Neue + DM Sans, `#c8a96e`, tokens `--surface`/`--border`/`--r`/`--sh`, ícones Font Awesome, dark mode.
- Texto em pt-PT.
- Corre `ng build` no fim de cada fase.

---

## 1. Estados visuais dos inputs (igualar a imagem de referência)

**Observação:** a imagem mostra um sistema de input com: rótulo/legenda opcional acima do valor ("Input Caption"), estado *Default*, *Active* (foco, borda azul/accent), *Filled*, *Error* (borda vermelha + ícone + mensagem por baixo + contador "0 results"), *Success* (borda verde + ícone check), *Com texto de ajuda* + contador de caracteres (`15/60`), *Com botão* (ícone à direita, ex. pesquisa), *Disabled* (cinza, sem interação).

**Estado actual:** os inputs do admin (`admin-form input`, `admin-auth-card input`) e do catálogo (`.catalog-toolbar input`) usam um único estilo de borda `var(--border)`; erro é apenas texto vermelho por baixo (`.admin-field-error`), sem alterar a borda do campo; não existe estado de sucesso, nem contador de caracteres, nem botão de limpar (×) dentro do campo.

### 1.1 Criar componente partilhado `app-form-field`

Novo ficheiro `src/app/shared/form-field/form-field.component.ts` (+ html/scss), standalone, para uniformizar todos os campos de texto/número da app (login, produto, categoria, pesquisa do catálogo, contacto):

```ts
// form-field.component.ts
import { Component, ContentChild, ElementRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FieldState = 'default' | 'error' | 'success';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent {
  readonly caption = input<string>('');
  readonly state = input<FieldState>('default');
  readonly helpText = input<string>('');
  readonly errorText = input<string>('');
  readonly maxLength = input<number | null>(null);
  readonly currentLength = input<number>(0);
  readonly disabled = input(false);
  readonly showClear = input(false);
  readonly clear = signal<() => void>(() => {});
}
```

```html
<!-- form-field.component.html -->
<div
  class="field"
  [class.field-error]="state() === 'error'"
  [class.field-success]="state() === 'success'"
  [class.field-disabled]="disabled()"
>
  @if (caption()) {
    <span class="field-caption">{{ caption() }}</span>
  }
  <div class="field-control">
    <ng-content></ng-content>
    @if (state() === 'success') {
      <i class="fa-solid fa-circle-check field-icon success"></i>
    }
    @if (state() === 'error') {
      <i class="fa-solid fa-triangle-exclamation field-icon error"></i>
    }
    @if (showClear() && !disabled()) {
      <button type="button" class="field-clear" (click)="clear()()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    }
  </div>
  <div class="field-foot">
    @if (state() === 'error' && errorText()) {
      <small class="field-msg error"
        ><i class="fa-solid fa-triangle-exclamation"></i>{{ errorText() }}</small
      >
    } @else if (state() === 'success' && helpText()) {
      <small class="field-msg success">{{ helpText() }}</small>
    } @else if (helpText()) {
      <small class="field-msg">{{ helpText() }}</small>
    }
    @if (maxLength()) {
      <small class="field-count">{{ currentLength() }} / {{ maxLength() }}</small>
    }
  </div>
</div>
```

```scss
// form-field.component.scss
.field { display: grid; gap: 6px; }
.field-caption {
  font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted);
}
.field-control {
  position: relative; display: flex; align-items: center;
  border: 1.5px solid var(--border); border-radius: 8px; background: var(--surface2);
  transition: border-color .18s, box-shadow .18s;
}
.field-control:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-lt);
}
.field-error .field-control { border-color: var(--danger); }
.field-error .field-control:focus-within { box-shadow: 0 0 0 3px rgba(224,85,85,.14); }
.field-success .field-control { border-color: #25a35a; }
.field-success .field-control:focus-within { box-shadow: 0 0 0 3px rgba(37,163,90,.14); }
.field-disabled .field-control { opacity: .55; cursor: not-allowed; }
.field-control ::ng-content, .field-control input, .field-control textarea {
  flex: 1; border: none; background: transparent; padding: 11px 12px; font: inherit; color: var(--text);
}
.field-control input:focus, .field-control textarea:focus { outline: none; }
.field-icon { padding-right: 12px; font-size: 14px; }
.field-icon.success { color: #25a35a; }
.field-icon.error { color: var(--danger); }
.field-clear {
  padding-right: 12px; color: var(--muted); font-size: 13px;
}
.field-clear:hover { color: var(--text); }
.field-foot { display: flex; justify-content: space-between; gap: 10px; min-height: 14px; }
.field-msg { font-size: 11px; color: var(--muted); display: flex; align-items: center; gap: 5px; }
.field-msg.error { color: var(--danger); }
.field-msg.success { color: #25a35a; }
.field-count { font-size: 11px; color: var(--muted); margin-left: auto; }
```

> Nota de acessibilidade: liga `errorText()`/`helpText()` ao input via `aria-describedby` (id gerado) e `aria-invalid="true"` quando `state()==='error'` — adiciona isto ao componente com um `id` de instância única (`crypto.randomUUID()` ou contador estático).

### 1.2 Onde aplicar

| Campo | Ficheiro | Estado a activar |
|---|---|---|
| Email / Password | `admin-login.component.html` | `error` quando `form.controls.X.touched && invalid`; `success` opcional ao ficar válido após toque |
| Preço / Preço anterior | `admin-product-form.component.html` | `error` já existe como texto solto — migrar para o wrapper com borda vermelha |
| Nome / Descrição | `admin-product-form.component.html` | contador de caracteres (`maxLength=200` já definido no form) |
| Nome / Prefixo / Âncora | `admin-category-form.component.html` | `error` em validação |
| Pesquisa do catálogo | `catalog-page.component.html` | `showClear` quando `search` não vazio (botão × que já existe visualmente noutros campos do wireframe) |
| Detalhe do produto — input de característica | `admin-product-form.component.html` (`featureCtrl`) | `success` breve ao adicionar (feedback de que foi aceite) |

**Importante:** isto é uma refactorização visual/estrutural — corre `ng build` após cada ficheiro migrado e confirma que o `FormControl`/`ngModel` por trás continua a funcionar (o `<input>` real fica dentro de `<app-form-field>` via `<ng-content>`, a diretiva `formControlName`/`ngModel` mantém-se no `<input>`, não no wrapper).

---

## 2. Animação de submissão de formulário (distinta do skeleton de GET)

**Princípio:** skeleton = "ainda não tenho dados" (GET inicial); animação de submit = "tenho dados, estou a processá-los" (POST/PATCH/DELETE). Não devem parecer a mesma coisa.

### 2.1 Estado actual
- Botões de submit já mudam ícone para `fa-spinner fa-spin` + texto "A guardar..." (login, produto, categoria) — bom ponto de partida, mas falta:
  1. Bloquear o resto do formulário durante o submit (hoje só o botão fica `disabled`; os campos continuam editáveis).
  2. Um sinal de sucesso perceptível antes do redirecionamento (hoje navega imediatamente após o toast, o que pode passar despercebido em ecrãs rápidos).

### 2.2 Proposta — `submitting` + `submitted` como dois estados distintos do skeleton

Adicionar a cada formulário (produto, categoria, login) um `signal<'idle' | 'submitting' | 'success'>('idle')` e:

```html
<form [formGroup]="form" (ngSubmit)="save()" [class.form-locked]="submitState() === 'submitting'">
  <fieldset [disabled]="submitState() === 'submitting'">
    ...campos...
  </fieldset>
  <div class="admin-form-actions wide">
    <button type="submit" class="admin-primary" [class.is-success]="submitState() === 'success'">
      @switch (submitState()) {
        @case ('submitting') { <i class="fa-solid fa-spinner fa-spin"></i> A guardar... }
        @case ('success') { <i class="fa-solid fa-circle-check"></i> Guardado! }
        @default { <i class="fa-solid fa-floppy-disk"></i> Guardar alterações }
      }
    </button>
  </div>
</form>
```

```scss
.form-locked { position: relative; }
.form-locked::after {
  content: ''; position: absolute; inset: 0; background: rgba(255,255,255,.02);
  pointer-events: none; border-radius: var(--r);
}
.admin-primary.is-success {
  background: #25a35a; color: #fff;
  animation: submitPop .35s ease;
}
@keyframes submitPop {
  0% { transform: scale(1); }
  40% { transform: scale(1.04); }
  100% { transform: scale(1); }
}
```

No TS: ao receber sucesso da API, define `submitState.set('success')`, aguarda ~500-600ms (`setTimeout`) e só depois chama `toast.success(...)` + `router.navigateByUrl(...)`. Isto dá um feedback visual claro de "aconteceu", distinto do shimmer cinzento dos skeletons.

Aplicar em: `admin-login.component.ts` (submit), `admin-product-form.component.ts` (save), `admin-category-form.component.ts` (save), e nos botões de eliminar dentro do `ConfirmDialogComponent` (feedback de "A remover..." semelhante, já parcialmente coberto por `deletingId()`).

### 2.3 Barra de progresso fina para "refresh" (não é GET inicial nem submit)
Para o botão "Actualizar" (`admin-refresh`) em produtos/categorias/dashboard, que hoje troca para skeleton completo mesmo quando já há dados no ecrã (perde-se o conteúdo por um instante), propor uma barra fina (estilo YouTube) no topo do painel em vez de substituir a lista:

```scss
.admin-panel { position: relative; }
.admin-panel-loading-bar {
  position: absolute; top: 0; left: 0; height: 2px; background: var(--accent);
  animation: loadingBar 1.1s ease-in-out infinite;
}
@keyframes loadingBar {
  0% { width: 0; left: 0; }
  50% { width: 60%; }
  100% { width: 0; left: 100%; }
}
```
Mostrar esta barra apenas quando `loading() && products().length > 0` (já há dados, é um refresh); manter o skeleton actual só quando `loading() && !products().length` (estado inicial), que já é o comportamento em `admin-products.component.html`/`admin-categories.component.html` — confirmar e alinhar `admin-page.component.html` da mesma forma.

---

## 3. Máscara de preço "estilo input bancário"

**Pedido:** o utilizador digita dígitos e eles entram pela direita, empurrando as casas decimais para a esquerda à medida que se digita (ex.: digitar `1`,`2`,`3`,`4`,`5` produz `0,01` → `0,12` → `1,23` → `12,34` → `123,45`), sem quebrar a formatação `pt-AO` já usada (`MoneyService`).

### 3.1 Problema no código actual
`admin-product-form.component.ts` (`onPriceInput`/`formatCurrencyInput`) já tenta preservar a posição do cursor no meio da string formatada — é frágil (recalcula "dígitos antes do cursor" a cada tecla) e não implementa o padrão "cents-first" pedido. A abordagem correcta de inputs bancários **fixa o cursor sempre no fim** e trata o valor como um número inteiro de cêntimos.

### 3.2 Algoritmo proposto (substituir `onPriceInput`/`formatCurrencyInput`)

```ts
/** Converte o valor actual do campo (já formatado ou não) num total de cêntimos,
 *  aplica o novo dígito/tecla, e devolve a string formatada pt-AO com 2 casas decimais. */
private centsFromFormatted(value: string): number {
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}

private formatFromCents(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

onPriceInput(controlName: 'price' | 'oldPrice', event: Event): void {
  const input = event.target as HTMLInputElement;
  // Ignora qualquer tecla que não seja dígito/backspace — o browser já filtra a maior
  // parte via inputmode="decimal", isto é só a rede de segurança final.
  const cents = this.centsFromFormatted(input.value);
  const formatted = this.formatFromCents(cents);
  this.form.get(controlName)?.setValue(formatted, { emitEvent: false });
  // Cursor sempre no fim — é o padrão de qualquer input monetário tipo "banco".
  requestAnimationFrame(() => {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  });
}

/** Backspace deve "puxar" um dígito de volta, não apagar um separador. */
onPriceKeydown(controlName: 'price' | 'oldPrice', event: KeyboardEvent): void {
  if (event.key !== 'Backspace') return;
  event.preventDefault();
  const current = this.form.get(controlName)?.value || '';
  const cents = Math.floor(this.centsFromFormatted(current) / 10);
  this.form.get(controlName)?.setValue(this.formatFromCents(cents), { emitEvent: false });
}
```

```html
<input
  type="text"
  inputmode="decimal"
  formControlName="price"
  (input)="onPriceInput('price', $event)"
  (keydown)="onPriceKeydown('price', $event)"
/>
```

- `onPriceBlur` pode ser removido — o valor já está sempre bem formatado a cada tecla, não há "estado inválido a meio" para corrigir no blur. Manter apenas a inicialização (`this.money.format(product.price)` ao carregar em edição) convertendo primeiro para cêntimos: `this.formatFromCents(Math.round(product.price * 100))`.
- `MoneyService.parse()` continua a ser usado tal como está no `save()` para reconverter a string formatada num número antes de enviar à API — não precisa de alterações.
- Aplicar exactamente o mesmo par de métodos a `oldPrice`.
- Testar casos-limite: campo vazio → deve mostrar `0,00`; colar um valor grande (`ctrl+v`) → `centsFromFormatted` extrai só os dígitos, funciona igual; apagar tudo com backspace repetido → chega a `0,00` e para (sem `NaN`).

---

## 4. Skeletons — auditoria e melhorias

### 4.1 Inventário actual
| Local | Componente usado | Estado |
|---|---|---|
| `catalog-page` | `app-skeleton-card` (8) | ✅ ok |
| `home-page` (por categoria) | `app-skeleton-card` (4) | ✅ ok |
| `admin-categories` | `app-skeleton-card` (6) | ✅ ok |
| `admin-products` (tabela) | `app-skeleton-row` (5) | ✅ ok |
| `admin-page` (dashboard) | `skel-line` inline duplicado | ⚠️ ver 4.2 |
| `admin-product-form` (edição) | `skel-line` inline dedicado | ⚠️ ver 4.3 |
| `admin-product-detail` | spinner + texto | ⚠️ ver 4.4 |
| `product-detail-page` (loja) | spinner + texto | ⚠️ ver 4.4 (prioridade menor) |

### 4.2 Consolidar shimmer
O keyframe `@keyframes shimmer` e as classes `.skel-line`/`.skel-short`/`.skel-price` estão duplicados em pelo menos 4 ficheiros (`styles.css`, `admin-page.component.scss`, `skeleton-card.component.scss`, `skeleton-row.component.scss`). Propor mover para uma única classe utilitária global em `src/styles.css` (`.skel-shimmer` com o keyframe) e os componentes/scss locais passam só a compor tamanhos (`width`, `height`) sobre essa classe base, evitando 4 cópias do mesmo gradiente/animação a divergirem ao longo do tempo.

### 4.3 `admin-product-form` — alinhar skeleton ao grid real
Hoje usa linhas genéricas de largura fixa. Propor gerar as linhas com as mesmas proporções do `admin-form` (grid 3 colunas): nome (2 linhas curtas), categoria/preço/preço-antigo (3 blocos lado a lado), descrição (bloco alto), detalhes (3 chips), galeria (grelha de 4 quadrados). Isto reduz o "salto" de layout entre skeleton e conteúdo real.

### 4.4 Criar skeleton dedicado para páginas de detalhe
Novo componente `src/app/shared/skeleton/skeleton-detail.component.ts` (imagem grande + 2 linhas de título + bloco de descrição + preço), usado em:
- `admin-product-detail.component.html` — substitui o spinner actual enquanto `loading()`.
- `product-detail-page.component.html` — substitui o `#loading` template actual.

Mantém o spinner apenas como *fallback* para chamadas muito rápidas onde nem vale a pena montar skeleton (opcional, baixa prioridade).

---

## 5. Responsividade — achados adicionais

Já implementado e confirmado nos ficheiros analisados: drawer mobile do admin (`admin-shell`), tabela→cartões em `admin-products`, toolbar do catálogo em coluna a 620px, grid do formulário de produto a 1 coluna a 850px, `admin-product-detail` a 1 coluna a 760px.

Pontos a melhorar:

1. **Áreas de toque pequenas em mobile.** `.qbtn` (28px), `.pact` (33px), `.soc` (38px), `.icn` (40px) ficam abaixo ou no limite da recomendação de 44×44px (Apple HIG / Material). Propor, só dentro de `@media (max-width: 520px)`, aumentar `.qbtn`/`.pact`/`.soc` para no mínimo 40px e `.pcard-acts`/`.mthumb` com mais espaçamento entre alvos tocáveis.
2. **Safe-area em iOS (notch/home indicator).** Não há `viewport-fit=cover` nem `env(safe-area-inset-*)` em lado nenhum. Como `.toast` fica fixo a `bottom: 26px`, `.drw-ft` e `.mob-foot` ficam colados ao fundo do ecrã, e o `.admin-mob-topbar` ao topo — em iPhones com home indicator/notch isto pode ficar parcialmente tapado. Adicionar a `src/index.html`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
   ```
   E em `styles.css`:
   ```css
   .toast { padding-bottom: calc(11px + env(safe-area-inset-bottom, 0px)); bottom: calc(26px + env(safe-area-inset-bottom, 0px)); }
   .drw-ft, .mob-foot { padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px)); }
   #navbar, .admin-mob-topbar { padding-top: env(safe-area-inset-top, 0px); height: calc(var(--nav) + env(safe-area-inset-top, 0px)); }
   ```
3. **Breakpoint intermédio (700–900px) na página de contactos.** `.contact-map iframe` só reduz altura a partir de 700px (`min-height: 320px`); entre 700-900px o layout já empilhou (grid vira 1 coluna a 700px) mas o iframe de 320px de altura ao lado de um painel de contacto pequeno pode deixar muito espaço vazio em tablets — considerar um valor intermédio (`~380px`) num breakpoint a 900px, opcional/baixa prioridade.
4. **`admin-form-loading-inner` (skeleton do form) não tem breakpoint próprio** — herda o container, confirmar visualmente em 375px que as linhas não ficam demasiado longas/curtas face aos campos reais depois da mudança da secção 4.3.
5. **Ficheiros legados fora do Angular (`index.htm`, `global.js`, `style.css` na raiz).** Não fazem parte do `angular.json` (`browser: src/main.ts`, `index: src/index.html`, `styles: src/styles.css`) — parecem um protótipo vanilla anterior à migração para Angular, duplicando ~1500 linhas de HTML/JS/CSS que já não são build-adas. Recomenda-se confirmar com o Elizandro se podem ser removidos do repositório: reduzem confusão de manutenção, tamanho do repo, e superfície de ataque acidental (nenhuma validação/segurança nesses ficheiros, caso algum hosting estático os sirva por engano via URL directa `/index.htm`).

---

## 6. Segurança — prioridade máxima

### 6.1 Tokens em `localStorage` → mover para memória + cookie HttpOnly

**Problema concreto:** `auth.service.ts` guarda `bravo-admin-token` e `bravo-admin-user` em `localStorage`; `refresh.service.ts` guarda `bravo-admin-refresh-token` também em `localStorage`. Qualquer XSS (mesmo um único `<script>` injectado, ex. via uma dependência npm comprometida ou um campo mal sanitizado no futuro) consegue ler `localStorage.getItem(...)` e exfiltrar o token de acesso **e** o refresh token — controlo total e persistente da conta admin. Isto é o risco nº1 identificado nesta auditoria.

**Arquitectura alvo (exige alterações no frontend E no backend — sinalizar isto claramente, não é só uma mudança de ficheiro Angular):**

1. **Access token:** deixa de ir para `localStorage`. Passa a viver apenas em memória, num `signal` privado dentro de `AuthService` (`private readonly _token = signal<string | null>(null)`). Se a página for recarregada (F5), o token em memória perde-se — é esperado e aceitável, resolve-se com o passo 3.
2. **Refresh token:** deixa de ser lido/escrito pelo Angular. Passa a ser um cookie `HttpOnly; Secure; SameSite=Strict` definido pela **API** na resposta de `/auth/login` e `/auth/refresh` (`Set-Cookie`), nunca visível a JavaScript. `/auth/logout` no backend deve limpar esse cookie.
3. **Rehidratação silenciosa no arranque da app:** no `APP_INITIALIZER` (ou no construtor de `AuthService` chamado uma vez em `app.component.ts`), chamar `POST /auth/refresh` com `{ withCredentials: true }` e sem corpo — se existir um cookie de sessão válido, a API devolve um novo access token que é guardado em memória; se não existir/expirou, o utilizador simplesmente fica por autenticar (comportamento actual do guard já o redirecciona para login).
4. **Interceptor:** `auth.interceptor.ts` passa a ler `authService.token()` (o signal em memória) em vez de `localStorage.getItem(...)`.
5. **Todas as chamadas relacionadas com sessão** (`/auth/login`, `/auth/refresh`, `/auth/logout`, `/admin/me`) precisam de `{ withCredentials: true }` no `HttpClient` para o browser enviar/receber o cookie.
6. **CORS no backend** tem de mudar de qualquer wildcard (`*`) para a origem exacta do domínio Vercel + `Access-Control-Allow-Credentials: true` (obrigatório para cookies cross-site funcionarem).

**Esboço do `AuthService` alvo (substituir os métodos que tocam em `localStorage` para tokens):**

```ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _accessToken = signal<string | null>(null);
  readonly user = signal<UserApi | null>(null);

  token(): string | null {
    return this._accessToken();
  }
  isAuthenticated(): boolean {
    return !!this._accessToken();
  }

  login(email: string, password: string) {
    return this.http
      .post<ApiResponse<AuthResult>>(`${environment.apiUrl}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((response) => {
          this._accessToken.set(response.data.accessToken); // refreshToken já não vem para o corpo/JS
          this.user.set(response.data.user);
        }),
      );
  }

  bootstrap(): Observable<boolean> {
    // chamado uma vez no arranque da app
    return this.refreshService.refresh().pipe(
      tap((response) => this._accessToken.set(response.data.accessToken)),
      switchMap(() => this.me()),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe();
    this._accessToken.set(null);
    this.user.set(null);
    void this.router.navigateByUrl('/admin/login');
  }
}
```

> Se, por restrição de prazo, a mudança de backend (cookies `HttpOnly`) não puder acontecer já nesta ronda: **não tratar isto como opcional/nice-to-have** — é o item de maior risco desta auditoria. Como mitigação mínima e temporária enquanto o backend não muda: manter o access token só em memória (passo 1-4 acima são só frontend e já reduzem a janela de exposição, já que o access token deixa de persistir entre sessões), e deixar claramente assinalado no backlog que o refresh token em `localStorage` continua vulnerável até à mudança para cookie `HttpOnly`.

Também mover `bravo-admin-user` (nome/email/role) para fora do `localStorage` — é menos sensível que os tokens mas ainda é PII; passa a vir sempre de `/admin/me` após a rehidratação em vez de ser lido de disco.

### 6.2 Content-Security-Policy e outros headers HTTP

**Problema:** não existe qualquer CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` ou HSTS configurados — nem via `<meta>` no `index.html` nem via servidor. Como o deploy é estático via Vercel (`vercel.json` já existe), a forma correcta de aplicar isto é o bloco `headers` do `vercel.json` (headers como `X-Frame-Options` **não** funcionam via `<meta>`, só CSP tem suporte parcial em `<meta http-equiv="Content-Security-Policy">` — mas para `frame-ancestors`, HSTS, etc. tem de ser via servidor/edge).

**Adicionar a `vercel.json`:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build",
        "outputDirectory": "dist/bravo-business/browser"
      }
    }
  ],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https: ; connect-src 'self' https://bravo-bussiness-api.onrender.com; frame-src https://www.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests"
        },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

Notas importantes:
- `style-src` precisa de `'unsafe-inline'` **apenas** porque o build de produção (`angular.json` → `optimization.styles.inlineCritical: true`) injecta CSS crítico inline no `<head>`. Alternativa mais estrita: desligar `inlineCritical` (custo: um pequeno flash de estilo a menos optimizado) e remover `'unsafe-inline'` do `style-src`. Decidir com o Elizandro qual o trade-off preferido.
- `connect-src` tem de incluir **ambos** os ambientes se o build de staging usar `environment.ts` (localhost) — em produção só o domínio Render é necessário; ajustar se houver mais ambientes.
- `img-src` ficou permissivo (`https:`) porque o catálogo carrega imagens Unsplash e de utilizadores diversos — se as imagens de produto passarem a vir todas de um único domínio (ex. bucket próprio), apertar para esse domínio específico.
- Depois de aplicado, testar a app inteira (loja + admin, incluindo o mapa embutido em Contactos e o botão WhatsApp) para confirmar que nada é bloqueado pela CSP — abrir a consola do browser e procurar erros `Refused to ...`.

**No backend (fora deste repositório, mas necessário em conjunto):** CORS deve listar a origem exacta do site (não `*`), e responder `Access-Control-Allow-Credentials: true` assim que os cookies HttpOnly da secção 6.1 forem implementados.

### 6.3 Outros riscos encontrados

1. **Bloqueio de tentativas de login é só client-side.** `AuthService.recordFailedLogin()`/`isLoginLocked()` usam contadores em `localStorage` (`bravo-login-failed-attempts`, `bravo-login-lock-until`) — qualquer pessoa contorna isto limpando o `localStorage`, usando uma janela anónima, ou chamando a API directamente (Postman/curl), sem passar pelo frontend. Isto dá uma falsa sensação de protecção contra força bruta. `express-rate-limit` já consta como dependência no projecto, o que sugere que a proteção real já pode existir no backend — confirmar, e se sim, fazer o frontend **ler** o estado de bloqueio devolvido pela API (ex. um `429` com `retryAfter`) em vez de o calcular localmente; manter o cronómetro visual apenas como reflexo do que a API já impõe, nunca como a barreira real.
2. **`admin.guard.ts`** protege apenas a navegação (UX) — confirmar que toda a gente na equipa entende que a autorização real tem de estar sempre no backend (o guard nunca pode ser a única barreira a dados sensíveis).
3. **Validação de ficheiros só no frontend.** `onImageSelected`/`onGallerySelected` verificam `file.type.startsWith('image/')` e tamanho ≤5MB — o tipo MIME é trivialmente falsificável; isto deve continuar a existir como UX (feedback imediato), mas o backend tem de re-validar por assinatura de ficheiro (magic bytes), nunca confiar no `Content-Type` enviado pelo browser.
4. **SRI (Subresource Integrity) na CDN do Font Awesome.** `src/index.html` carrega `https://cdnjs.cloudflare.com/.../font-awesome/6.5.2/css/all.min.css` sem `integrity`/`crossorigin`. Adicionar:
   ```html
   <link
     rel="stylesheet"
     href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
     integrity="<hash-sha384-da-versao-exacta>"
     crossorigin="anonymous"
     referrerpolicy="no-referrer"
   />
   ```
   (obter o hash correcto a partir do próprio cdnjs, que publica o `integrity` junto de cada versão). Isto impede que um CDN comprometido injecte CSS/JS malicioso sem ser detectado.
5. **Segredos nunca em `environment.*.ts`.** Confirmar como regra permanente: estes ficheiros vão para o bundle público, visíveis a qualquer visitante via DevTools — só a URL pública da API deve lá estar, nunca chaves de API privadas, credenciais, ou tokens de terceiros.
6. **`npm audit`** — dado o tamanho da árvore de dependências (`package-lock.json` extenso), recomenda-se correr `npm audit` periodicamente e antes de cada deploy de produção, como parte do processo (não é uma alteração de código).

---

## 7. Plano de fases

| Fase | Conteúdo | Depende de |
|---|---|---|
| 1 | Componente `app-form-field` + migração dos formulários (secção 1) | — |
| 2 | Máscara de preço cents-first (secção 3) | — |
| 3 | Estados `submitting`/`success` + barra de refresh fina (secção 2) | Fase 1 (usa os mesmos botões) |
| 4 | Consolidar shimmer + skeleton de detalhe (secção 4) | — |
| 5 | Safe-area, touch targets, breakpoint de contactos, limpeza de ficheiros legados (secção 5) | — |
| 6 | Refactor de tokens: access token em memória, remoção de `localStorage` para tokens/refresh, chamadas `withCredentials` (secção 6.1) — **coordenar com quem trata da API**, já que exige `Set-Cookie` + CORS no backend | — |
| 7 | `vercel.json` com CSP e headers (secção 6.2) | Testar exaustivamente depois da Fase 6, já que `connect-src`/CORS interagem |
| 8 | SRI no Font Awesome, alinhar bloqueio de login ao backend, `npm audit` (secção 6.3) | Fase 6/7 |

---

## 8. Checklist de aceitação

- [ ] Inputs em toda a app mostram claramente os estados *default/active/error/success/disabled*, com borda colorida e ícone, tal como na referência.
- [ ] Campos com limite de caracteres mostram contador `x / y`.
- [ ] Submeter um formulário bloqueia os campos, mostra "A guardar...", depois um breve estado de sucesso antes de navegar — visualmente distinto do skeleton cinzento de carregamento inicial.
- [ ] Actualizar uma lista já carregada mostra uma barra fina de progresso em vez de substituir tudo por skeleton.
- [ ] Digitar num campo de preço preenche da direita para a esquerda como um input bancário, backspace remove um dígito de cada vez, sem nunca mostrar `NaN` ou string vazia inválida.
- [ ] Existe skeleton dedicado nas páginas de detalhe de produto (loja e admin), não apenas spinner+texto.
- [ ] Botões/ícones tocáveis em mobile têm pelo menos ~40px.
- [ ] `viewport-fit=cover` + `env(safe-area-inset-*)` aplicados onde há elementos fixos ao fundo/topo.
- [ ] O access token do admin já não está em `localStorage`; vive apenas em memória durante a sessão do separador.
- [ ] O refresh token está num cookie `HttpOnly; Secure; SameSite` definido pelo backend, nunca acessível a `document.cookie`/JS.
- [ ] `withCredentials: true` está presente em todas as chamadas de autenticação/sessão.
- [ ] `vercel.json` define CSP + `X-Content-Type-Options` + `X-Frame-Options` + `Referrer-Policy` + `Permissions-Policy` + HSTS, testado sem erros de consola em toda a app.
- [ ] Font Awesome carregado com `integrity`/`crossorigin`.
- [ ] Ficheiros legados vanilla (`index.htm`, `global.js`, `style.css` na raiz) removidos ou confirmados como necessários por outro motivo.
- [ ] `ng build --configuration production` compila sem erros nem avisos novos.
- [ ] Nenhuma destas fases altera o fluxo de checkout via WhatsApp nem os contratos de `api.models.ts`.