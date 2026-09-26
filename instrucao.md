# Auditoria de Regressão — `app-form-field` & Inputs (Bravo Business)
### Instrução de trabalho complementar para o agente de código

---

## 0. Como usar este documento

Este ficheiro complementa `instrucao.md`. Nasce de um problema concreto: depois de introduzir o componente partilhado `app-form-field` (secção 1 de `instrucao.md`), os inputs deixaram de ficar consistentes — a barra de pesquisa da loja, o login do backoffice e os formulários de produto/categoria mostram caixas duplicadas, texto repetido e o ícone de erro a cobrir o campo inteiro em vez de ficar discreto à direita.

As 4 imagens anexadas pelo Elizandro mostram exactamente isto:
1. **Pesquisa da loja** — o texto "Pesquisar produtos" aparece em maiúsculas/negrito dentro da caixa (como se fosse um valor, não um placeholder), o ícone de lupa fica empilhado por cima do texto em vez de ao lado, e a mesma frase repete-se outra vez por baixo da caixa.
2. **Editar produto** — os campos (Nome, Preço, Preço anterior, Badge) aparecem como uma caixa cinzenta "achatada", sem borda visível nítida — parece uma caixa dentro de outra caixa.
3. **Novo produto** — no estado de erro, o triângulo vermelho de aviso aparece enorme, centrado, a tapar todo o campo, e o input em si parece ter desaparecido.
4. **Login do backoffice** — o mesmo problema do triângulo de erro a cobrir o campo, tanto no email como na password.

**Regras gerais (mantidas de `instrucao.md`):**
- Confirma o plano antes de codificar.
- Entrega ficheiros completos.
- Não alteres `environment.apiUrl`, `api.models.ts` nem o fluxo de checkout via WhatsApp.
- Texto em pt-PT.
- Corre `ng build` no fim.

---

## 1. Causa raiz (importante ler antes de "andar a tapar buracos")

Há **uma única causa raiz** que explica as 4 imagens em simultâneo. Vale a pena perceber isto antes de mexer em CSS à toa.

### 1.1 O Angular não deixa o `app-form-field` estilizar o `<input>` que recebe por `<ng-content>`

Em `form-field.component.scss` existe esta regra:

```scss
.field-control ::ng-content, .field-control input, .field-control textarea, .field-control select {
  flex: 1; border: none; background: transparent; padding: 11px 12px; font: inherit; color: var(--text); min-width: 0;
}
```

Dois problemas aqui:

- `::ng-content` **não existe** em CSS — não é um pseudo-elemento válido, é apenas texto morto que nunca fez nada.
- `.field-control input` (a parte que parecia ir resolver o problema) **também nunca corresponde a nada**, por uma razão estrutural do Angular: com `ViewEncapsulation.Emulated` (o padrão), o Angular marca cada elemento com o atributo do **componente que o escreveu no seu template**, não do componente que o recebe via `<ng-content>`. O `<input>` que aparece dentro de `<app-form-field>` foi escrito no template de `catalog-page`, `admin-login`, `admin-product-form`, etc. — por isso continua a carregar o atributo *desses* componentes, nunca o do `form-field`. Um selector escrito em `form-field.component.scss` simplesmente não o vê.

**Consequência:** o `<input>` nunca recebe `flex:1`, nunca preenche a largura da caixa. Fica com a largura intrínseca do browser (uns ~180px), enquanto a caixa visível à volta (`.field-control`) é muito mais larga. O ícone de erro/sucesso, que *esse sim* está no template do `form-field` e por isso *é* estilizado correctamente (14px), acaba posicionado logo a seguir ao input invisível — como o input tem a mesma cor de fundo da caixa e uma borda muito ténue, fica invisível a olho nu, dando a ilusão de que o ícone "tapa" o campo inteiro.

### 1.2 Colisão de especificidade no campo de pesquisa

Em `catalog-page.component.scss`:

```scss
.catalog-toolbar label { display:flex; flex-direction:column; gap:7px; font-size:11px; color:var(--muted); font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
.search-field { min-width:250px; flex:1; display:flex; align-items:center; gap:8px; }
```

`.catalog-toolbar label` (1 classe + 1 tipo) é **mais específico** do que `.search-field` (1 classe), por isso ganha sempre, independentemente da ordem no ficheiro. O `<label class="search-field">` acaba a herdar `flex-direction:column`, `font-weight:700` e `text-transform:uppercase` — daí o texto em negrito/maiúsculas empilhado verticalmente com o ícone, tal como na imagem 1. Além disso, `.catalog-toolbar input { font: inherit; }` propaga esse negrito/maiúsculas directamente para o placeholder do input.

### 1.3 Texto repetido no campo de pesquisa

Em `catalog-page.component.html`:

```html
<app-form-field [showClear]="!!search" [helpText]="'Pesquisar produtos'" [caption]="''" [clear]="clearSearchSignal">
  <label class="search-field">...<input ... placeholder="Pesquisar produtos" /></label>
</app-form-field>
```

O texto "Pesquisar produtos" aparece três vezes: placeholder do input, `helpText` por baixo da caixa, e (por causa do 1.2) visualmente dentro da própria caixa. É informação a mais para dizer a mesma coisa.

### 1.4 `[disabled]` do wrapper não desactiva o `<input>` real

`FormFieldComponent.disabled` só aplica `opacity` e `pointer-events:none` ao `.field-control` (CSS, cosmético). O `<input>` por trás **continua sem o atributo `disabled` real** — continua focável por teclado (Tab) e continua a ser lido por leitores de ecrã como um campo activo. Isto acontece em `admin-login.component.html`, onde `[disabled]` é passado ao `<app-form-field>` mas nunca ao `<input>`.

### 1.5 Classe morta em `admin-product-form.component.html`

```html
<input ... [class.field-success]="featureSuccess()" />
```

`.field-success` só tem efeito quando aplicada ao `<div class="field">` exterior (`.field-success .field-control {...}`). Pô-la directamente no `<input>` não faz nada — é código morto, ficou provavelmente de uma tentativa anterior à existência do `[state]` no `<app-form-field>` que já envolve este mesmo input.

---

## 2. Especificação dos estados (referência única para todos os inputs da app)

| Estado | Borda | Fundo | Ícone | Texto de apoio |
|---|---|---|---|---|
| Default | `1.5px solid var(--border)` | `var(--surface2)` | — | `helpText`, se existir |
| Active (foco) | `var(--accent)` + anel `0 0 0 3px var(--accent-lt)` | igual | — | igual |
| Filled | igual ao default | igual | — | igual |
| Error | `var(--danger)` + anel `rgba(224,85,85,.14)` | igual | `fa-triangle-exclamation`, 14px, encostado à direita, cor `var(--danger)` | mensagem em `var(--danger)` por baixo |
| Success | `#25a35a` + anel `rgba(37,163,90,.14)` | igual | `fa-circle-check`, 14px, à direita, cor `#25a35a` | opcional, em `#25a35a` |
| Disabled | igual ao default, `opacity:.55` | igual | — | — |
| Com botão (pesquisa/limpar) | igual ao default | igual | ícone à esquerda (lupa) e/ou botão × à direita, ambos 14px | contador `x/y`, se aplicável |

O ícone **nunca** deve ocupar mais espaço do que o necessário para o seu glifo (14px) nem alterar a altura da caixa — fica sempre encostado à direita, com o texto do campo a preencher o resto.

---

## 3. Correcções — passo a passo

### 3.1 `src/styles.css` — novo bloco global (a correcção principal)

Como o Angular nunca vai deixar `form-field.component.scss` estilizar um `<input>` projectado, este reset **tem de viver no CSS global** (sem encapsulamento). Para ganhar sempre, sem depender da ordem de carregamento, qualifica com `.field` (o wrapper exterior) para subir a especificidade acima de qualquer regra antiga (`.admin-form input`, `.admin-auth-card input`, `.catalog-toolbar input`, todas com especificidade `(0,1,1)`):

```css
/* ════════════════════════════════════════
   FORM FIELD — RESET DO INPUT PROJECTADO
   Tem de ficar aqui (global, sem encapsulamento).
   O Angular marca um elemento projectado via
   <ng-content> com o atributo do componente que
   o ESCREVEU no template, nunca do componente
   que o recebe — por isso uma regra equivalente
   dentro de form-field.component.scss nunca
   correspondia a nada. Ver auditoria-inputs-formfield.md.
════════════════════════════════════════ */
.field .field-control > input,
.field .field-control > select,
.field .field-control > textarea,
.field .field-control label > input {
  flex: 1;
  width: 100%;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 11px 12px;
  font: inherit;
  color: var(--text);
  text-transform: none;
  letter-spacing: 0;
}
.field .field-control > input:focus,
.field .field-control > select:focus,
.field .field-control > textarea:focus,
.field .field-control label > input:focus {
  outline: none;
}
.field .field-control > textarea {
  resize: vertical;
}
```

Não é preciso tocar em `.admin-form input`, `.admin-auth-card input` nem `.catalog-toolbar input` — a especificidade mais alta desta regra nova sobrepõe-se automaticamente às propriedades conflituosas (borda, fundo, padding), e deixa intactas propriedades não conflituosas que continuam a fazer sentido (ex: `height:40px` em `.catalog-toolbar input`, `height:46px` em `.admin-auth-card input`).

### 3.2 `form-field.component.scss` — remover a regra morta

Apaga este bloco (nunca funcionou e agora está duplicado com o passo 3.1):

```scss
.field-control ::ng-content, .field-control input, .field-control textarea, .field-control select {
  flex: 1; border: none; background: transparent; padding: 11px 12px; font: inherit; color: var(--text); min-width: 0;
}
.field-control input:focus, .field-control textarea:focus, .field-control select:focus { outline: none; }
```

O resto do ficheiro (`.field`, `.field-caption`, `.field-control` base, `.field-error`, `.field-success`, `.field-disabled`, `.field-icon`, `.field-clear`, `.field-foot`, `.field-msg`, `.field-count`) mantém-se — já está correcto porque são elementos escritos no próprio template do `form-field`.

### 3.3 `catalog-page.component.scss` — resolver a colisão de especificidade

```diff
- .catalog-toolbar label {
+ .catalog-toolbar label:not(.search-field) {
    display: flex;
    flex-direction: column;
    gap: 7px;
    font-size: 11px;
    color: var(--muted);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
```

### 3.4 `catalog-page.component.html` — tirar a repetição de texto

```diff
- <app-form-field [showClear]="!!search" [helpText]="'Pesquisar produtos'" [caption]="''" [clear]="clearSearchSignal">
+ <app-form-field [showClear]="!!search" [clear]="clearSearchSignal">
    <label class="search-field"
      ><i class="fa-solid fa-magnifying-glass"></i
      ><input
        [(ngModel)]="search"
        (ngModelChange)="onSearchChange($event)"
        placeholder="Pesquisar produtos"
      /></label
    >
  </app-form-field>
```

O placeholder + o ícone de lupa já comunicam a função do campo; não precisa de legenda nem de texto de apoio repetido.

### 3.5 `admin-login.component.html` — desactivar o campo a sério, não só visualmente

Envolve os dois campos num `<fieldset [disabled]="...">`, tal como já se faz em `admin-product-form.component.html` e `admin-category-form.component.html`:

```diff
- <form [formGroup]="form" (ngSubmit)="submit()">
+ <form [formGroup]="form" (ngSubmit)="submit()">
+   <fieldset [disabled]="submitState() === 'submitting' || auth.isLoginLocked()">
      <app-form-field
        caption="Email"
        [state]="form.controls.email.touched && form.controls.email.invalid ? 'error' : 'default'"
        [helpText]="form.controls.email.touched && form.controls.email.invalid ? 'Indica um email válido.' : ''"
-       [disabled]="submitState() === 'submitting' || auth.isLoginLocked()"
      >
        <input type="email" formControlName="email" placeholder="admin@bravo.co.ao" ... />
      </app-form-field>
      <app-form-field
        caption="Password"
        ...
-       [disabled]="submitState() === 'submitting' || auth.isLoginLocked()"
      >
        <input type="password" formControlName="password" placeholder="A tua password" ... />
      </app-form-field>
+   </fieldset>
    <button class="admin-submit" type="submit" [disabled]="submitState() === 'submitting' || auth.isLoginLocked()">
      ...
    </button>
  </form>
```

Um `<input>` dentro de um `<fieldset disabled>` fica realmente desactivado (não focável, não editável, anunciado como tal por leitores de ecrã) — e o CSS `.field-disabled .field-control` deixa de ser necessário para este caso porque o browser já aplica `:disabled` nativamente. Se quiseres manter o esbatimento visual (`opacity:.55`) também quando bloqueado por `isLoginLocked()`, passa esse mesmo booleano só para efeitos de estilo através de `[class.field-disabled]` no `<app-form-field>` — mas o `disabled` real do input vem sempre do `fieldset`.

### 3.6 `admin-product-form.component.html` — limpar código morto

```diff
  <input
    type="text"
    [formControl]="featureCtrl"
    placeholder="Adicionar detalhe..."
    (keydown.enter)="$event.preventDefault(); addFeature()"
-   [class.field-success]="featureSuccess()"
  />
```

O estado de sucesso já é comunicado correctamente pelo `[state]="featureSuccess() ? 'success' : 'default'"` no `<app-form-field>` que envolve este input — a classe extra no `<input>` não tinha efeito nenhum.

---

## 4. Melhorias opcionais (baixa prioridade, não bloqueiam o resto)

1. **Seta customizada nos `<select>`**: com a borda a vir agora do `.field-control`, a seta nativa do browser pode parecer desalinhada em alguns SOs. Se quiseres um visual 100% uniforme entre browsers, aplica `appearance: none` ao `.field .field-control > select` e adiciona um ícone de seta em `background-image`, reaproveitando o padrão já usado em `.icon-picker-trigger` (chevron ao lado direito).
2. **`aria-invalid`/`aria-describedby` automáticos**: hoje cada formulário calcula `[attr.aria-invalid]` manualmente (só o login o faz). Seria mais robusto o próprio `FormFieldComponent` gerar um `id` único (já existe `instanceId`) e aplicar `aria-describedby`/`aria-invalid` ao controlo projectado via `@ContentChild(NgControl)` ou `@ContentChild('input,select,textarea')`, evitando repetir esta lógica em cada página.
3. **Altura consistente**: depois da correcção 3.1, confirma visualmente se o login (`height:46px` herdado de `.admin-auth-card input`) e os restantes formulários (sem `height` fixo, ficam com a altura natural do padding `11px` + linha de texto, ~40-42px) ficam parecidos o suficiente; se quiseres pixel-perfeito, define `min-height: 44px;` directamente em `.field-control` no `form-field.component.scss` (este sim aplica-se sem problemas, porque `.field-control` é escrito no próprio template do `form-field`).

---

## 5. Como testar (mapear cada imagem à correcção)

| Imagem | Sintoma | Corrigido por |
|---|---|---|
| 1 — Pesquisa | Texto em negrito/maiúsculas, ícone empilhado, frase repetida | 3.1 (input passa a ocupar a largura toda) + 3.3 (deixa de herdar `flex-direction:column`/negrito) + 3.4 (remove repetição) |
| 2 — Editar produto | Caixa "achatada", sem borda nítida | 3.1 (o input deixa de ter a sua própria borda/fundo escondida dentro da caixa do `field-control`) |
| 3 — Novo produto (erro) | Triângulo enorme a tapar o campo | 3.1 (o input passa a `flex:1`, o ícone volta a ficar pequeno e encostado à direita) |
| 4 — Login | Mesmo problema do triângulo em email e password | 3.1 + 3.5 (desactivação real durante bloqueio) |

Depois de aplicar as correcções, corre `ng build` e confirma visualmente as 4 páginas (pesquisa da loja, `/admin/produtos/novo`, `/admin/produtos/:id/editar`, `/admin/login`) nos estados: vazio, com foco, com erro (tocar e sair sem preencher), e com sucesso (preencher um preço válido).

---

## 6. Checklist de aceitação

- [ ] O campo de pesquisa da loja mostra o ícone de lupa ao lado do texto (não por cima), com o placeholder em peso normal (não negrito/maiúsculas), e sem frase repetida por baixo.
- [ ] Todos os inputs/selects/textareas dentro de `<app-form-field>` preenchem a largura total da caixa, com uma única borda visível (não duas caixas aninhadas).
- [ ] O ícone de erro/sucesso aparece pequeno (14px), encostado à direita, sem nunca cobrir o texto do campo.
- [ ] Bloquear o login (tentativas falhadas) desactiva os campos de facto (não recebem foco por Tab), não apenas visualmente.
- [ ] Não existe código morto (`[class.field-success]` directo em inputs já cobertos pelo `[state]` do wrapper).
- [ ] `ng build --configuration production` compila sem erros nem avisos novos.
- [ ] Nenhuma destas correcções altera `environment.apiUrl`, `api.models.ts` ou o fluxo de checkout via WhatsApp.