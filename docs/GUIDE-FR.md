# Guide du projet : tout comprendre, fichier par fichier

Ce guide explique **pourquoi** chaque élément du framework existe. Lis-le dans l'ordre, en ouvrant les fichiers à côté.
L'objectif : pouvoir expliquer chaque ligne en entretien, comme si tu l'avais écrite (et idéalement, tu la réécriras toi-même, voir les exercices à la fin).

---

## 0. Playwright en 2 minutes (avec tes repères TestComplete)

Playwright est une librairie open source de Microsoft qui pilote les navigateurs **Chromium, Firefox et WebKit** via leur protocole interne (pas via WebDriver comme Selenium). `@playwright/test` est le **test runner** livré avec : il gère l'exécution parallèle, les fixtures, les rapports, les retries, etc.

| TestComplete | Playwright |
|---|---|
| Name Mapping / Aliases | **Locators** (`getByRole`, `getByTestId`...) rangés dans des **Page Objects** |
| Script units (JavaScript/Python) | Fichiers `*.spec.ts` en TypeScript |
| Keyword tests | Pas d'équivalent : tout est en code (on peut générer avec `codegen`) |
| Object Spy | `npx playwright codegen` + le sélecteur de locator de l'UI Mode |
| `WaitObject`, `WaitProperty`, délais | **Auto-waiting** intégré + **web-first assertions** (`await expect(...)`) |
| Checkpoints (property, region) | `expect(locator).toHaveText()`, `toHaveScreenshot()` |
| Project Suite / Test Items | `playwright.config.ts` → **projects**, `test.describe`, tags |
| Event handlers (`OnStartTest`...) | `beforeEach` / `afterEach` / **fixtures** |
| Data-Driven Loop (Excel/CSV) | Une boucle `for` qui génère des `test()` (ou lecture d'un JSON/CSV) |
| Test Log | **HTML report** + **Trace Viewer** |
| TestExecute sur agent | `npx playwright test` sur n'importe quelle CI (GitHub Actions, Jenkins, Azure DevOps) |
| Desktop + Web + Mobile | **Web uniquement** (+ émulation mobile, + Electron expérimental) |

Ce dernier point est important en entretien : Playwright ne teste **pas** les applications desktop Windows. Ton expérience TestComplete reste un atout réel, pas un truc à cacher.

---

## 1. Les applications testées

- **Sauce Demo** (`https://www.saucedemo.com`) : boutique de démo faite pour s'entraîner. Comptes publics affichés sur la page de login (`standard_user`, `locked_out_user`... mot de passe `secret_sauce`).
- **JSONPlaceholder** : fausse API REST. Les POST/PUT/DELETE répondent comme une vraie API mais ne sauvegardent rien → les tests sont indépendants.
- **demo.playwright.dev/api-mocking** : page de démo Playwright qui charge une liste de fruits via `GET /api/v1/fruits`. Idéale pour montrer le mocking réseau.

---

## 2. `playwright.config.ts` : le cœur du framework

Ouvre [playwright.config.ts](../playwright.config.ts).

### Options globales
- `testDir: './tests'` : où chercher les tests.
- `fullyParallel: true` : les tests d'un même fichier tournent aussi en parallèle. Ça oblige à écrire des tests **indépendants** (aucun test ne doit dépendre du résultat d'un autre).
- `forbidOnly: !!process.env.CI` : si quelqu'un oublie un `test.only`, la CI échoue au lieu de n'exécuter qu'un seul test en silence.
- `retries` : 2 en CI, 0 en local. En local on veut **voir** l'instabilité tout de suite. En CI, un test qui passe au 2e essai est marqué **flaky** dans le rapport : c'est un signal, pas une solution.
- `workers` : nombre de processus parallèles.
- `reporter` : `list` dans le terminal + `html`. En CI, `github` ajoute des annotations directement sur la PR.

### `use` : les options partagées
- `baseURL` : permet d'écrire `page.goto('/inventory.html')`. Changer d'environnement (dev, staging) = changer une variable `BASE_URL`, sans toucher aux tests.
- `testIdAttribute: 'data-test'` : par défaut `getByTestId()` cherche `data-testid`. Sauce Demo utilise `data-test`, donc on le configure.
- `trace: 'on-first-retry'` : enregistre une **trace** (DOM, réseau, console, captures à chaque action) quand un test est rejoué. C'est l'outil n°1 pour débugger un échec en CI.
- `screenshot` / `video` : gardés uniquement en cas d'échec (économie d'espace).

### `projects` : la partie la plus importante à savoir expliquer
Un **project** = un groupe de tests + une configuration. Ici :
1. `setup` : exécute `auth.setup.ts`, qui se connecte une fois et sauvegarde la session.
2. `chromium`, `firefox`, `webkit` : les tests UI, avec `storageState` (la session sauvegardée) et `dependencies: ['setup']` → Playwright lance d'abord `setup`.
3. `api` : les tests API, sans navigateur.

`npx playwright test --project=chromium` ne lance que ce projet (+ ses dépendances).

### `process.loadEnvFile('.env')`
Charge les variables d'un fichier `.env` (fonction native de Node 20.12+). Beaucoup de projets utilisent la librairie `dotenv` pour la même chose : cite les deux en entretien.

---

## 3. Les locators : la compétence n°1

Un **Locator** est une *description* de comment trouver un élément, pas l'élément lui-même. Il est évalué **au moment de l'action**, et Playwright **attend automatiquement** que l'élément soit attaché, visible, stable, activé et non masqué avant de cliquer (*actionability checks*).

Ordre de préférence recommandé par Playwright (et utilisé dans le projet) :
1. `getByRole('button', { name: 'Login' })` : comme un utilisateur ou un lecteur d'écran voit la page. Le plus robuste.
2. `getByLabel`, `getByPlaceholder('Username')`, `getByText`.
3. `getByTestId('error')` : attribut dédié aux tests, stable si l'équipe dev l'ajoute.
4. CSS / XPath (`page.locator('.btn')`) : en dernier recours, fragile car lié à la structure du DOM.

Techniques utilisées dans le projet :
- **Filtrage** : `this.items.filter({ hasText: name })` → la carte produit qui contient ce nom ([InventoryPage.ts](../src/pages/InventoryPage.ts)).
- **Chaînage** : `this.item(name).getByRole('button', { name: 'Add to cart' })` → le bouton *dans* cette carte. Sans ça, il y aurait 6 boutons "Add to cart" → erreur **strict mode violation** (Playwright refuse d'agir si un locator correspond à plusieurs éléments).

---

## 4. Les assertions : web-first vs génériques

```ts
await expect(inventoryPage.title).toHaveText('Products');   // web-first : RÉ-ESSAIE jusqu'au timeout (5 s par défaut)
expect(prices).toEqual(sorted);                              // générique : vérifie une seule fois une valeur
```

- Les **web-first assertions** (`toBeVisible`, `toHaveText`, `toHaveCount`, `toHaveURL`...) prennent un Locator ou une Page, et attendent. On les `await`.
- Ne jamais écrire `expect(await locator.isVisible()).toBe(true)` : `isVisible()` n'attend pas, c'est la source classique de tests instables.
- Piège montré dans `getPrices()` : `allTextContents()` **n'attend pas**. D'où le `await this.items.first().waitFor()` avant.
- `expect.soft(...)` : l'échec est enregistré mais le test continue (utile pour vérifier plusieurs champs d'un formulaire).

Pas de `waitForTimeout(3000)` dans le projet : un délai fixe est soit trop court (instable), soit trop long (lent). On attend une **condition**.

---

## 5. Page Object Model

Dossier [src/pages](../src/pages). Chaque classe :
- reçoit `page` dans son constructeur ;
- déclare ses locators en `readonly` ;
- expose des **actions métier** (`login()`, `addToCart()`, `fillInformation()`).

Règle suivie : **les Page Objects ne contiennent pas d'assertions**, ce sont les tests qui vérifient. Les tests restent lisibles et les pages réutilisables. (Certaines équipes mettent des méthodes `expectLoaded()` dans les pages : les deux se défendent, sache argumenter.)

**Composition** : le header (panier + menu) apparaît sur plusieurs pages, donc c'est un composant [Header.ts](../src/components/Header.ts) inclus dans `InventoryPage` et `CartPage` (`inventoryPage.header.logout()`). On évite la duplication sans passer par l'héritage d'une énorme `BasePage`.

---

## 6. Fixtures : le concept qui impressionne en entretien

Ouvre [src/fixtures/test.ts](../src/fixtures/test.ts).

Une **fixture** est une ressource préparée pour un test, puis nettoyée après. `page`, `context`, `browser`, `request` sont des fixtures intégrées. Quand un test écrit `async ({ page }) => {}`, Playwright crée un **nouveau contexte navigateur isolé** (comme une fenêtre de navigation privée) pour ce test.

On étend `test` avec nos propres fixtures :

```ts
inventoryPage: async ({ page }, use) => {
  // avant use() : préparation (setup)
  await use(new InventoryPage(page));
  // après use() : nettoyage (teardown), ex. supprimer des données créées
},
```

Avantages par rapport à `beforeEach` :
- **À la demande** : la fixture n'est créée que si le test la demande.
- **Réutilisable** dans tous les fichiers, setup et teardown au même endroit.
- **Composable** : une fixture peut dépendre d'une autre (`inventoryPage` dépend de `page`).

Les tests importent donc `test` et `expect` depuis `src/fixtures/test`, pas depuis `@playwright/test`.

---

## 7. Authentification : login une seule fois

Problème : se connecter via l'interface dans chaque test est lent et répétitif.

Solution ([tests/auth.setup.ts](../tests/auth.setup.ts)) :
1. Le projet `setup` se connecte une fois.
2. `page.context().storageState({ path })` sauvegarde cookies + localStorage dans `playwright/.auth/standard-user.json` (ignoré par git, car c'est une session).
3. Les projets UI démarrent chaque test avec cet état → déjà connectés.

Pour les tests qui testent justement le login, on repart d'un état vide :
```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

Variante en entreprise : se connecter **via l'API** dans le setup (plus rapide que l'UI), puis sauvegarder le state.

---

## 8. Les tests UI

### [login.spec.ts](../tests/ui/login.spec.ts)
- `test.describe` groupe, `test.beforeEach` ouvre la page de login.
- **Data-driven** : un tableau de cas + une boucle `for` → un test généré par ligne, chacun avec un nom unique (obligatoire).
- **Tags** : `{ tag: '@smoke' }` → `npx playwright test --grep @smoke`.

### [inventory.spec.ts](../tests/ui/inventory.spec.ts)
- Tri : on récupère les prix affichés, on les trie en JS, et on compare. On teste le **comportement**, pas des valeurs codées en dur.
- Badge panier : `toBeHidden()` puis `toHaveText('2')`.

### [checkout.spec.ts](../tests/ui/checkout.spec.ts)
- Scénario de bout en bout découpé avec `test.step()` : les étapes apparaissent dans le rapport HTML et la trace.
- Vérification de calcul : subtotal = somme des prix, total = subtotal + taxe. `toBeCloseTo` évite les problèmes d'arrondi des nombres décimaux.
- `buildCustomer()` ([products.ts](../src/data/products.ts)) : un **builder de données** avec valeurs par défaut et `overrides` (`buildCustomer({ firstName: '' })` pour le cas d'erreur).

### [network-mocking.spec.ts](../tests/ui/network-mocking.spec.ts)
- `page.route(pattern, handler)` intercepte les requêtes correspondant au pattern.
- `route.fulfill({ json })` : renvoie une **fausse réponse**, le serveur n'est jamais appelé. Usages : tester un état difficile à obtenir (liste vide, erreur 500, données extrêmes), ou tester le front sans backend.
- `route.fetch()` puis `fulfill({ response, json })` : laisse passer la vraie requête et **modifie** la réponse.
- `page.waitForResponse()` : on crée la promesse **avant** l'action qui déclenche la requête, sinon on risque de rater la réponse.
- Autres possibilités : `route.abort()` (bloquer images/pubs), `route.continue({ headers })` (modifier la requête).

---

## 9. Les tests API

[src/api/PostsApi.ts](../src/api/PostsApi.ts) encapsule les appels ; [tests/api/posts.spec.ts](../tests/api/posts.spec.ts) vérifie :
- le **status code** (`200`, `201`, `404`) ;
- les **headers** (`content-type`) ;
- le **body** : `toEqual` (égalité exacte), `toMatchObject` (sous-ensemble), `expect.objectContaining` + `expect.any(Number)` (structure sans valeur exacte).

La fixture `request` (`APIRequestContext`) envoie des requêtes HTTP sans navigateur, donc c'est très rapide. Cas d'usage réels :
- tests API purs ;
- **préparer des données** avant un test UI (créer un utilisateur par API, puis vérifier dans l'UI) → tests plus rapides et plus stables ;
- nettoyer après un test.

---

## 10. CI : GitHub Actions

[.github/workflows/playwright.yml](../.github/workflows/playwright.yml) : à chaque push / PR sur `main` :
`npm ci` → `npm run typecheck` → `npx playwright install --with-deps` (navigateurs + dépendances Linux) → `npx playwright test` → upload du rapport HTML comme **artifact** (téléchargeable depuis l'onglet Actions, même si les tests échouent, grâce à `if: !cancelled()`).

Notions à connaître pour aller plus loin : **sharding** (`--shard=1/4` pour répartir sur plusieurs machines), **matrix** de navigateurs, image Docker officielle `mcr.microsoft.com/playwright`.

---

## 11. Débugger : les outils à montrer en entretien

| Outil | Commande | Usage |
|---|---|---|
| UI Mode | `npm run ui` | lancer les tests, voir chaque étape, "time travel", mode watch |
| Inspector | `npm run test:debug` | exécution pas à pas, `await page.pause()` dans le code |
| Trace Viewer | `npx playwright show-trace trace.zip` | analyser un échec CI : DOM, réseau, console à chaque action |
| Codegen | `npm run codegen` | enregistrer des actions et récupérer de bons locators |
| Rapport HTML | `npm run report` | résultats, captures, vidéos, traces |
| Extension VS Code | "Playwright Test for VSCode" | lancer/débugger un test d'un clic, choisir un locator |

---

## 12. Exercices (à faire toi-même : c'est ce qui rend l'expérience réelle)

1. Ajouter un test : trier par prix décroissant (`hilo`).
2. Créer `ProductDetailsPage` : cliquer sur un produit, vérifier nom/prix, l'ajouter au panier depuis cette page.
3. Ajouter un test `@smoke` dans `cart.spec.ts` : "Continue Shopping" ramène à l'inventaire et garde le panier.
4. Ajouter une fixture `loggedInCart` qui prépare un panier avec 2 produits (astuce : écrire `cart-contents` dans le localStorage avec `page.addInitScript` ou passer par l'UI).
5. Mocking : simuler une erreur 500 sur `/api/v1/fruits` (`route.fulfill({ status: 500 })`) et observer ce que la page affiche.
6. Test visuel : `await expect(page).toHaveScreenshot()` sur la page de login (lance une fois avec `--update-snapshots`).
7. Tests API : ajouter `/comments?postId=1` et valider le schéma de la réponse.
8. Utiliser `problem_user` et écrire un test qui **détecte** le bug des images (toutes identiques).
9. Ajouter ESLint avec `eslint-plugin-playwright` (règles anti-`waitForTimeout`, anti-`test.only`...).
10. Ajouter un projet `Mobile Safari` (`devices['iPhone 15']`) pour le smoke.
