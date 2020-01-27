
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

    let listIdInput = modal.querySelector('input[name="listId"]');

    listIdInput.value = listId;

    modal.classList.add('is-active');
  },

  hideModals: () => {
    let modals = document.querySelectorAll('.modal');
    for (let modal of modals) {
      modal.classList.remove('is-active');
    }
  },

  // afficher le formulaire d'édition du nom d'une liste
  showEditListForm: (event) => {
    // récupérer tous les éléments (en partant du titre sur lequel on a double cliqué sinon, on est pas sûr.e d'avoir la bonne liste)
    let listElement = event.target.closest('.panel');
    let formElement = listElement.querySelector('form');

    // mettre la valeur existante dans l'input
    formElement.querySelector('input[name="name"]').value = event.target.textContent;

    // afficher/masquer
    event.target.classList.add('is-hidden');
    formElement.classList.remove('is-hidden');
    
  },

  // formulaire d'édition du nom d'une liste
  handleEditListForm: async (event) => {
    event.preventDefault();

    // récupérer les données
    let data = new FormData(event.target);

    console.table(Array.from(data));
    // récupérer l'id de la liste
    let listElement = event.target.closest('.panel');
    const listId = listElement.dataset.listId;
    //appeler l'API
    try {
      let response = await fetch(app.baseUrl+'/lists/'+listId,{
        method: "PATCH",
        body: data
      });
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        let list = await response.json();
        // on met à jour le h2
        listElement.querySelector('h2').textContent = list.name;
      }
    } catch (error) {
      alert("Impossible de modifier la liste");
      console.error(error);
    }
    // quoi qu'il se passe, on cache le formulaire
    event.target.classList.add('is-hidden');
    // et on réaffiche le <h2>
    listElement.querySelector('h2').classList.remove('is-hidden');
  },


  handleAddListForm: async (event) => {
    // empêcher d'envoyer vraiment le formulaire (ça rechargerait la page)
    event.preventDefault();

    let data = new FormData(event.target);
    data.set('position', 99); // position fictive, parce qu'il en faut une

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

  handleAddCardForm: async (event) => {
    event.preventDefault();

    let data = new FormData(event.target);
    data.set('position', 99); // pareil, faut une position, on en prend une arbitrairement

    // pour tester le contenu du FormData
    //console.table(Array.from(data));

    let response = await fetch(app.baseUrl + '/cards', {
      method: 'POST',
      body: data
    });

    if (response.ok) {
      let card = await response.json();
      // les infos envoyées et les infos véritablement enregistrées en BDD côté back peuvent être légèrement différentes
      // on va donc se baser sur les valeurs reçues en réponse
      app.makeCardInDOM(card.title, card.list_id, card.id, card.color);
    } else {
      let errors = await response.json();
      console.log(errors);
    }

    app.hideModals();
  },

  makeListInDOM: (listName, listId) => {
    // on va chercher notre template dans le DOM
    let template = document.querySelector('#tpl-list');
    // cette méthode permet de créer une copie du contenu du template
    let newList = document.importNode(template.content, true);

    newList.querySelector('h2').textContent = listName;

    newList.querySelector('.add-card-button').addEventListener('click', app.showAddCardModal);
    // 2 nouveaux écouteurs sur chaque liste
    // le double clic sur le nom, pour passer de l'affichage à l'édition
    // l'envoi du formulaire, pour repasser de l'édition à l'affichage
    newList.querySelector('h2').addEventListener('dblclick', app.showEditListForm);
    newList.querySelector('form').addEventListener('submit', app.handleEditListForm);

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