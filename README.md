# oKanban-front, jours 3 et 4

On continue de coder les fonctionalités de notre application !

Ajoute tout le HTML, le CSS et le Javascript qui te sembleront nécessaire. Soit inventif/inventive pour les interfaces graphiques !

Et si tu as des idées de fonctionnalités interessantes, fait toi plaisir !

N'hésites pas non plus à modifier ou étendre les fonctionnalités de l'API !

Liste des fonctionnalités à coder :
- Supprimer une carte.
- Supprimer une liste. Au choix : seulement si elle est vide, ou en supprimant toutes les cartes incluses.
- Afficher les tags des cartes.
- Créer un nouveau tag.
- Modifier un tag.
- Supprimer un tag.
- Associer un tag à une carte.
- Enlever un tag d'une carte.
- Choix d'une couleur à la création d'une carte.
- Modifier la couleur d'une carte.

## Les drag and drop

Pour changer l'ordre des cartes dans une liste, et l'ordre des listes dans la page, tu peux utiliser le drag'n'drop ("glisser-déposer", en français).

Ici encore, 2 solutions s'offrent à toi :
- Tout faire à la main! Il va falloir jouer avec 4 types d'évènement, et définir un bon paquet de paramètres. Tu peux lire [la page de MDN](https://developer.mozilla.org/fr/docs/Web/API/API_HTML_Drag_and_Drop) pour t'aider, mais attends toi à de la difficulté !
- Utiliser un plugin Javascript ! [SortableJS](https://github.com/SortableJS/Sortable), par exemple.

Quelque soit la solution choisie, il faudra appeller l'API pour mettre à jour les infos de la carte/liste, et peut-être aussi des autres cartes/listes ! (et oui, si la carte numéro 1 devient la numéro 3, alors la numéro 2 devient... :thinking: )
---

# oKanban-front, jour 2

## Dynamic data !

C'est l'heure de brancher notre application sur les vrais données !

#### Supprimer les fausses listes et les fausses cartes

#### Récupérer les vraies listes

Commence par ajouter une propriété `base_url` dans app. Sa valeur est l'url "de base" de ton API oKanban !

Crée ensuite une méthode `getListsFromAPI` dans app. Pour faciliter la suite, cette fonction est `async`.

Dans cette méthode, utilise [fetch](https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch) pour appeller la route "GET /lists" de l'api.

Utilise le résultat de la requête fetch, ainsi que les fonctions développées hier, pour créer les vraies listes dans le DOM !

<details>
<summary>De l'aide</summary>

Il faut `await` la réponse de fetch, mais il faut aussi `await response.json()` pour récupérer les données!  
</details>

#### Mise à jour des détails

Modifie les méthodes de app pour que l'attribut "list-id" des listes soit correct et corresponde aux données de l'API.

## Des listes c'est bien, mais avec des cartes c'est mieux !

Met en place le même principe que précedemment, pour afficher les vraies cartes !

On a un léger souci : on ne récupère pas les cartes dans le endpoint "GET /lists".

2 solutions : 
- faire une boucle pour appeler les routes "GET /lists/:id/cards"
- modifier la route "GET /lists" pour qu'elle renvoie directement les cartes !

A toi de voir !

Au passage, il faut modifier `app.makeCardInDOM` pour changer l'attribut "card-id" des cartes, et aussi leur donner un "background-color" qui correpsond !

## Save it baby !

Modifie les méthodes `handleAddListForm` et `handleAddCardForm` :
- Ces méthodes doivent être async.
- Utilise fetch pour appeler les routes POST en envoyant les données du formulaire.
- Utilise la réponse de fetch pour créer les listes/cartes, ou afficher une erreur (avec `alert`) si besoin.
- Pense à tester le code de retour avec `response.status` (il DOIT être égal à 200, sinon on a une erreur).

#### pourquoi j'ai pas de données ?!

Tu as beau envoyer des données, rien n'apparrait côté back. C'est probablement dû au format dans lequel tu envoie les données !

En effet, FormData utilise le format `multipart/form-data`. Or, ce format n'est pas géré par Express !

Il faut rajouter un middleware dans l'api : [multer](https://github.com/expressjs/multer).

<details>
<summary>De l'aide pour multer</summary>

```js
const multer = require('multer');
const bodyParser = multer();

// on utlise .none() pour dire qu'on attends pas de fichier, uniquement des inputs "classiques" !
app.use( bodyParser.none() );
```
</details>

## Éditer une liste

Tu as du remarquer que dans chaque liste, à côté du `<h2>`, se cache un petit formulaire. Il est prévu pour éditer le nom des listes !

Voici ce qu'il faut mettre en place : 
- Lorsqu'on double click sur un titre, on masque le `<h2>`, et on affiche le formulaire.
- Lorsqu'on valide le formulaire (en tapant sur "Entrée"), on appelle l'API.
- Si l'api renvoie une erreur, on ré-affiche le titre sans le modifier.
- Si l'api renvoie un succès, on modifie le `<h2>`, et on le réaffiche.
- Dans tous les cas, on masque le formulaire !

<details>
<summary>De l'aide</summary>

- L'évènement pour un double click est "dblclick".
- Pour afficher/masquer quelque chose, Bulma nous fournit la classe CSS "is-hidden".
- Pour tout le reste, inspire toi de ce qui a été fait les jours précédents : récuperer un élément, lui ajouter un écouter, éviter le fonctionnement par défaut des events, ...
- Et surtout, n'oublie pas de brancher toutes ces nouvelles intercations sur les éléments (listes et cartes) au moment de leur création !

</details>

## Éditer une carte

Mets en place le même fonctionnement pour éditer les titres des cartes.

Attention : 
- On ne clique pas sur le nom, mais sur l'icone "stylo" juste à côté.
- Le formulaire n'existe pas... rajoute le dans le template !

---

# oKanban-front, jour 1

## Static force

Pour ce projet, nous n'allons pas utiliser de serveur ! 

En effet, tout va se passer dans le navigateur, on va donc coder directement des fichiers statiques. Retour en S2, en quelques sortes !

Petit rappel, pour ouvrir le site dans un navigateur, utlise la ligne de commande : 
- `google-chrome index.html`
- ou bien `chromium index.html`
- ou encore `firefox index.html`
- ou n'importe quel autre navigateur si ça te fait plaisir :wink:

## Prise en main du code

Commence par lire les fichiers fournis. L'intégration qui nous est proposée utilise le framework CSS Bulma. 

[Pour commencer, un petit tour sur la doc ne fait jamais de mal](https://bulma.io/) !

## Première interaction : ouvrir la modale

Tu as du remarquer le bouton "ajouter une liste". Mais ce bouton... ne fait rien !

Tu as du aussi remarquer la présence d'une `<div class="modal">` dans le code.

>Une modale est une fenêtre fictive qui s'ouvre dans le navigateur par dessus le contenu courant, à la manière d'une popup.

Il faut que lorsqu'on clique sur le bouton, la modale apparraise. À toi de jouer !

<details>
<summary>De l'aide.</summary>

- Commence par ajouter une méthode `addListenerToActions` dans l'objet app, puis appelle cette méthode dans `app.init`.
- Dans cette méthode, récupère le bouton grace à `document.getElementById`, et ajoute-lui un écouteur d'évènement, sur l'event "click", et qui déclenche `app.showAddListModal`.
- Il faut maintenant ajouter la méthode `showAddListModal` à l'obet app, et l'implémenter !
- Dans la méthode `showAddListModal` : 
    - Récupère la div modale, toujours grâce à `document.getElementById`
    - [La doc de Bulma](https://bulma.io/documentation/components/modal/) nous dit que pour afficher une modale, il faut lui ajouter la classe `is-active`.
</details>

## Deuxième interaction : fermer la modale

Repère les 2 boutons ayant la classe "close" dans la modale. En cliquant sur un de ces deux boutons, la modale doit disparaitre. A toi de jouer !

<details>
<summary>De l'aide.</summary>

Inpire toi de ce qui a été fait à l'étape précédente : 
- Dans la méthode `addListenerToActions`, récupère tous les boutons "close" (grace à `document.querySelectorAll`, par exemple), et ajoute leur un écouteur d'évenement qui déclenche `app.hideModals`.
- Il te reste alors à coder `hideModals`, qui doit enlever la classe "is-active" à toutes les modales (oui, c'est un poil bourrin, mais ça évitera d'avoir à le refaire pour chacune des modales qu'on va rajouter).

</details>

## Troisième interaction : valider le formulaire

Intercepte la soumission du formulaire "ajouter une carte". Empêche le fonctionnement par défaut de l'évènement, puis récupère les données du formulaire, et envoie les en paramètres à `app.makeListInDOM` (fonction codée à l'étape suivante).

<details>
<summary>De l'aide</summary>

- Toujours dans `addListenerToActions`, récupère le bon formulaire grâce à `document.querySelector` et à un ciblage malin. Ajoute lui un écouteur, sur l'event "submit", qui déclenche `app.handleAddListForm`.
- Code ensuite `app.handleAddListForm` : cette méthode doit attendre un paramètre `event`, pour y récupérer l'évenement déclencheur.
- Pour empêcher la page de se recharger : `event.preventDefault()`
- Pour récupérer les données du formualaire, regarde [la doc de FormData](https://developer.mozilla.org/fr/docs/Web/API/FormData/Utilisation_objets_FormData).

</details>

## Fabriquer une nouvelle liste

C'est le moment de coder la méthode `app.makeListInDOM`. Cette méthode doit créer de toute pièce une nouvelle liste dans le DOM.

On pourrait utiliser `document.createElement`, mais on va vite avoir un problème : on a un sacré paquet d'éléments à créer, ça va prendre un temps fou à écrire !

Heureusement, HTML nous propose un système pour pallier à ce souci : les [template](https://developer.mozilla.org/fr/docs/Web/HTML/Element/template).

Commence par créer un template dans le HTML, en copiant le contenu d'une des liste déjà présente, et donne lui un id explicite.

Dans la méthode `app.makeListInDOM`, il faut ensuite : 
- Récupérer le template, puis le cloner dans une variable (cf [cette doc](https://developer.mozilla.org/fr/docs/Web/HTML/Element/template) ).
- Grâce à `maListe.querySelector`, mettre à jour le nom de la liste.
- Insérer la nouvelle liste dans le DOM au bon endroit ! (sers toi par exemple de [la méthode before](https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/before) ).

*Note* : rien ne t'empêche de rajouter des class ou des id dans le HTML pour te faciliter la vie...

*Note 2* : à la fin de la méthode, on ferme toutes les modales !

## Fabriquer une nouvelle carte

#### préparer le terrain
- Crée une modale "addCardModal", en t'inspirant très largement de la modale déjà existante.
- Dans le formulaire contenu dans la modale, rajoute un input de type hidden, donc le nom est "list_id".
- Crée un template pour les cartes à créer, sur le même principe que pour les listes.

#### interactions

Cliquer sur un bouton "+" doit afficher la modale ET mettre à jour la valeur de l'input "list_id" dans le formulaire en fonction de la liste sur laquelle on a cliqué.

<details>
<summary>Help !</summary>

- Reprend le même principe que pour les interactions précédentes : cibler le bouton, lui ajouter un écouteru d'évèmenent, qui déclenche une méthode `app.showAddCardModal`.
- `app.showAddCardModal` doit attendre un paramètre `event`. `event.target` contiendra l'objet qui a été cliqué.
- Pour retrouver la liste, utilise `event.target.closest('.panel')`.
- Pour retrouver l'id de la liste depuis son l'élément HTML correspondant, utilise `element.getAttribute('list-id')`.

</details>

Ensuite, valider le formulaire doit ajouter une nouvelle carte dans le DOM.

<details>
<summary>Help encore !</summary>

- Cible le formulaire, ajoute lui un écouteur sur l'event "submit", qui lance `app.handleAddCardForm`.
- `app.handleAddCardForm` attend un paramètre event, et appelle `event.preventDefault()` en premier !
- Récupère les infos du formulaire, et passe les à la méthode `app.makeCardInDOM`.
- `app.makeCardInDOM` doit attendre 2 paramètres : le nom de la carte, et l'id de la liste qui doit contenir la carte !
- Même principe que pour les listes : récupérer le template, le cloner, changer les valeurs nécessaires, et ajouter la nouvelle carte au DOM
- Pour retrouver la bonne liste, utilise `document.querySelector('[list-id="X"]')` (en changeant X!)

</details>

#### petit souci de dynamisation

Tu as peut-être remarqué que si on crée une nouvelle liste, puis qu'on clique sur le "+", rien ne se passe : c'est normal, la liste a été créée _après_ que les écouteur aient été ajoutés.

Il faut donc modifier `app.makeListInDOM`, pour ajouter l'écouteur sur le bouton "+" directement au moment de la création de la nouvelle liste !

## Fin du jour 1 !
