
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

  handleAddListForm: async (event) => {
    // empêcher d'envoyer vraiment le formulaire (ça rechargerait la page)
    event.preventDefault();

    let data = new FormData(event.target);
    data.set('position', 99);

    // on utilise toujours fetch, quelle que soit la méthode
    let response = await fetch(app.baseUrl + '/lists', {
      method: 'POST', // par contre, si c'est autre chose que GET, on le précise
      body: data // et s'il y a des données à envoyer (cas d'une création ou d'une mise à jour), faut le préciser aussi
      // et c'est tout, on ne met pas d'options qui ne servent pas
    });

    // RAPPEL : fetch ne retourne pas les données, il retourne un objet Response
    // sur cet objet, on trouve les propriétés status et ok
    // ainsi que plusieurs méthodes pour accéder au corps de la réponse, dont .json() qu'on va privilégier ici
    if (response.status === 200) {
      // attention, .json() ne retourne pas les données directement, mais une promesse ;-)
      let list = await response.json(); // pas grave, on l'await
      app.makeListInDOM(list.name, list.id); // et puisque tout s'est bien passé et qu'on a nos données, on met à jour le DOM
    } else { // cas typique : statut 400, il manque des infos
      let errors = await response.json(); // l'API qu'on a codée retourne un tableau d'erreurs compréhensibles pour un humain
      for (let error of errors) {
        alert(error); // on s'embête pas, on lui affiche
      }
    }

    // c'est discutable de mettre ça ici, on pourrait ne cacher la modale que si tout s'est bien passé
    // faîtes comme vous voulez, c'est pas crucial non plus
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