
// on objet qui contient des fonctions
var app = {
  // l'url "de base" de notre api !
  base_url: "http://localhost:5050",

  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    listModule.setBaseUrl(app.base_url);
    cardModule.setBaseUrl(app.base_url);
    tagModule.setBaseUrl(app.base_url);

    //console.log('app.init !');
    app.addListenerToActions();

    // chargement depuis l'API
    app.getListsFromAPI();
  
  },

  // ajoute les écouteurs aux boutons statiques et aux formulaires
  addListenerToActions: () => {
    // bouton "ajouter une liste"
    let addListButton = document.getElementById('addListButton');
    addListButton.addEventListener('click', listModule.showAddModal );

    // boutons "fermer les modales"
    let closeModalButtons = document.querySelectorAll('.close');
    for (let button of closeModalButtons) {
      button.addEventListener('click', app.hideModals);
    }

    // formulaire "ajouter une liste"
    let addListForm = document.querySelector('#addListModal form');
    addListForm.addEventListener('submit', app.handleAddListForm);

    // boutons "ajouter une carte" => plus besoin, les écouteur sont créés directement dans le module

    // formulaire "ajouter une carte"
    let addCardForm = document.querySelector('#addCardModal form');
    addCardForm.addEventListener('submit', app.handleAddCardForm);

    // modale "gérer les tags"
    document.getElementById('editTagsButton').addEventListener('click', tagModule.showEditModal);

    // formulaire "nouveau tag"
    document.getElementById('newTagForm').addEventListener('submit', tagModule.handleNewTag);
  },

  // cache toutes les modales
  hideModals: () => {
    let modals = document.querySelectorAll('.modal');
    for (let modal of modals) {
      modal.classList.remove('is-active');
    }
  },

  // action formulaire : ajouter une liste
  handleAddListForm: async (event) => {
    event.preventDefault();
    await listModule.handleAddFormSubmit(event);
    // on ferme les modales !
    app.hideModals();
  },

  // action formulaire : ajouter une carte
  handleAddCardForm: async (event) => {
    // on empeche le rechargement de la page
    event.preventDefault();
    
    await cardModule.handleAddFormSubmit(event);

    // et on ferme les modales !
    app.hideModals();
  },

  /** Fonctions de récupération des données */
  getListsFromAPI: async () => {
    try {
      let response = await fetch(app.base_url+"/lists");
      // on teste le code HTTP
      if (response.status !== 200) {
        // si pas 200 => problème.
        // on récupère le corps de la réponse, et on le "throw" => il tombera dans le catch jsute après
        let error = await response.json();
        throw error;
      } else {
        // si tout c'est bien passé : on passe à la création des listes dans le DOM
        let lists = await response.json();
        // console.log(lists);
        for (let list of lists) {
          let listElement = listModule.makeListDOMObject(list.name, list.id);
          listModule.addListToDOM(listElement);

          // on a modifié la route de l'api pour inclure directement les cartes !
          for (let card of list.cards) {
            let cardElement = cardModule.makeCardDOMObject(card.title, card.id, card.color);
            cardModule.addCardToDOM(cardElement, list.id);

            // et on continue : on ajout les tags !
            for (let tag of card.tags) {
              let tagElement = tagModule.makeTagDOMObject(tag.title, tag.color, tag.id, card.id);
              tagModule.addTagToDOM(tagElement, card.id);
            }
          }
        }
      }
    } catch (error) {
      // en cas d'erreur, on affiche un message à l'utilisateur
      alert("Impossible de charger les listes depuis l'API.");
      // et on log l'erreur en console pour plus de détails
      console.error(error);
    }
  }
  
};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );