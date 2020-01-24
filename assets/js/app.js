
// on objet qui contient des fonctions
var app = {

  baseUrl: 'http://localhost:3000',

  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    app.addListenersToActions();

    app.getListsFromAPI();
  },

  getListsFromAPI: async () => {
    try {
      let response = await fetch(app.baseUrl + '/lists');
      let lists = await response.json();
      console.log(lists);
      for (let list of lists) {
        // chaque liste sera un objet JS avec un propriété name, une autre position, un id etc.
        app.makeListInDOM(list.name, list.id);

        for (let card of list.cards) {
          // makeCardInDOM accepte 4 paramètres, il faut donc lui passer 4 arguments
          app.makeCardInDOM(card.title, list.id, card.id, card.color);
        }
      }
    } catch (error) {
      console.error(error);
    }
  },

  addListenersToActions: () => {
    let addListButton = document.getElementById('addListButton');
    addListButton.addEventListener('click', app.showAddListModal);

    let closeModalButtons = document.querySelectorAll('.close');
    for (let button of closeModalButtons) {
      button.addEventListener('click', app.hideModals);
    }

    let addListForm = document.querySelector('#addListModal form');
    addListForm.addEventListener('submit', app.handleAddListForm);

    let addCardButtons = document.querySelectorAll('.add-card-button');
    for (let button of addCardButtons) {
      button.addEventListener('click', app.showAddCardModal);
    };

    let addCardForm = document.querySelector("#addCardModal form");
    addCardForm.addEventListener('submit', app.handleAddCardForm);
  },

  showAddListModal: () => {
    let modal = document.getElementById('addListModal');
    modal.classList.add('is-active');
  },

  showAddCardModal: (event) => {
    // on récupère le bouton cliqué
    let clickedButton = event.target;

    let modal = document.getElementById('addCardModal');

    // pour en déduire l'id de la liste à laquelle on ajoute une carte
    let listId = clickedButton.closest('.panel').dataset.listId;

    let listIdInput = modal.querySelector('input[name="list_id"]');

    listIdInput.value = listId;

    modal.classList.add('is-active');
  },

  hideModals: () => {
    let modals = document.querySelectorAll('.modal');
    for (let modal of modals) {
      modal.classList.remove('is-active');
    }
  },

  handleAddListForm: (event) => {
    // empêcher d'envoyer vraiment le formulaire (ça rechargerait la page)
    event.preventDefault();

    let data = new FormData(event.target);

    // ici, pour l'instant, on ne fait rien
    // mais bientôt, on appellera notre API pour enregistrer la nouvelle liste

    // on la codera plus tard mais on l'appelle tout de suite
    // cette méthode va créer une nouvelle liste
    // et pour pouvoir créer une nouvelle liste, il lui faut un nom
    // ça tombe bien, on vient d'en saisir un dans le formulaire
    app.makeListInDOM(data.get('name'));

    app.hideModals();
  },

  handleAddCardForm: (event) => {
    event.preventDefault();

    let data = new FormData(event.target);

    app.makeCardInDOM(data.get('title'), data.get('list_id'));

    app.hideModals();
  },

  makeListInDOM: (listName, listId) => {
    // on va chercher notre template dans le DOM
    let template = document.querySelector('#tpl-list');
    // cette méthode permet de créer une copie du contenu du template
    let newList = document.importNode(template.content, true);

    newList.querySelector('h2').textContent = listName;

    newList.querySelector('.add-card-button').addEventListener('click', app.showAddCardModal);

    // à terme, l'API se chargera d'attribuer un id à une nouvelle liste
    // pour l'instant, on va prendre une valeur aléatoire
    newList.querySelector('.panel').dataset.listId = listId;

    // insertion dans le document de cette nouvelle liste
    // 1. trouver un repère pour l'insertion
    let lastColumn = document.getElementById('addListButton').closest('.column');

    // 2. insérer le nouvel élément par rapport à ce repère
    lastColumn.before(newList);
  },

  makeCardInDOM: (cardTitle, listId, cardId, cardColor = null) => {
    // récupérer le template
    let template = document.getElementById('tpl-card');
    // créer une nouvelle copie
    let newCard = document.importNode(template.content, true);
    // changer les valeurs qui vont bien
    newCard.querySelector('.card-name').textContent = cardTitle;

    // les cartes auront maintenant un id
    newCard.querySelector('.box').dataset.cardId = cardId;

    // il faut aussi leur appliquer une couleur
    if (cardColor) {
      newCard.querySelector('.box').style.backgroundColor = `#${cardColor.toString(16)}`;
    }

    // insérer la nouvelle carte dans la bonne liste
    let theGoodList = document.querySelector(`[data-list-id="${listId}"]`);
    theGoodList.querySelector('.panel-block').appendChild(newCard);
  }

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );