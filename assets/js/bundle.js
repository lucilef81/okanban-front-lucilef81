(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const listModule = require('./list');
const cardModule = require('./card');
const tagModule = require('./tag');
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
},{"./card":2,"./list":3,"./tag":4}],2:[function(require,module,exports){
const tagModule = require('./tag');

const cardModule = {
  base_url: null,

  setBaseUrl: (url) => {
    cardModule.base_url = url+'/cards';
  },

  showAddModal: (event) => {
    // event.target contient la cible du click
    let listElement = event.target.closest('.panel');
    // on récupère l'id de la liste cible
    const listId = listElement.getAttribute('list-id');
    
    let modal = document.getElementById('addCardModal');
    // on récupère l'input 
    let input = modal.querySelector('input[name="list_id"]');
    // on change sa valeur
    input.value = listId;
    // on a plus qu'à afficher la modale
    modal.classList.add('is-active');
  },

  handleAddFormSubmit: async (event) => {
    // on récupère les infos dur form
    let data = new FormData(event.target);

    try {
      let response = await fetch(cardModule.base_url,{
        method: "POST",
        body: data
      });
      if (response.status != 200) {
        let error = await response.json();
        throw error;
      } else {
        let card = await response.json();
        // et on les passe à la bonne méthode
        let newCardElement = cardModule.makeCardDOMObject(card.title, card.id, card.color);
        cardModule.addCardToDOM(newCardElement, card.list_id);
      }
    } catch (error) {
      alert("Impossible de créer une carte");
      console.error(error);
    }
  },

  showEditForm: (event) => {
    // récupérer tous les éléments
    let cardElement = event.target.closest('.box');
    let formElement = cardElement.querySelector('form');
    let titleElement = cardElement.querySelector('.card-name');

    // mettre la valeur existante dans l'input
    formElement.querySelector('input[name="title"]').value = titleElement.textContent;
    // petit souci : element.style.backgroundColor renvoie une couleur au format rbg
    // alors que input.value attend la couleur au format hexa
    // il faut donc transformer du RBG en hexa => on google le truc, et on copie-colle une fonction dans le module.
    formElement.querySelector('input[name="color"]').value = cardModule.rgb2hex( cardElement.style.backgroundColor );

    // afficher/masquer
    titleElement.classList.add('is-hidden');
    formElement.classList.remove('is-hidden');
  },

  handleEditCardForm: async (event) => {
    event.preventDefault();

    // récupérer les données
    let data = new FormData(event.target);
    // récupérer l'id de la liste
    let cardElement = event.target.closest('.box');
    const cardId = cardElement.getAttribute('card-id');
    //appeler l'API
    try {
      let response = await fetch(cardModule.base_url+'/'+cardId,{
        method: "PATCH",
        body: data
      });
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        let card = await response.json();
        // on met à jour le h2
        cardElement.querySelector('.card-name').textContent = card.title;
        // et la couleur
        cardElement.style.backgroundColor = card.color;
      }
    } catch (error) {
      alert("Impossible de modifier la carte");
      console.error(error);
    }
    // quoi qu'il se passe, on cache le formulaire
    event.target.classList.add('is-hidden');
    // et on réaffiche le title
    cardElement.querySelector('.card-name').classList.remove('is-hidden');
  },

  makeCardDOMObject: (cardTitle, cardId, cardColor) => {
    // récupérer le template
    let template = document.getElementById('template-card');
    // créer une nouvelle copie
    let newCard = document.importNode(template.content, true);
    // changer les valeurs qui vont bien
    newCard.querySelector('.card-name').textContent = cardTitle;
    let box = newCard.querySelector('.box');
    box.setAttribute('card-id', cardId);
    box.setAttribute('style', 'background-color: '+cardColor);
    // ajouter les eventListener
    newCard.querySelector('.button--edit-card').addEventListener('click', cardModule.showEditForm);
    newCard.querySelector('form').addEventListener('submit', cardModule.handleEditCardForm);
    newCard.querySelector('.button--delete-card').addEventListener('click', cardModule.deleteCard);
    newCard.querySelector('.button--add-tag').addEventListener('click', tagModule.showAssociateModal);

    return newCard;
  },

  addCardToDOM: (newCard, listId) => {
    // insérer la nouvelle carte dans la bonne liste
    let theGoodList = document.querySelector(`[list-id="${listId}"]`);
    theGoodList.querySelector('.panel-block').appendChild(newCard);
  },

  deleteCard: async (event) => {
    // confirmation utilisateur
    if (!confirm("Supprimer cette carte ?")) {
      return;
    }
    let cardElement = event.target.closest('.box');
    const cardId = cardElement.getAttribute('card-id');
    try {
      let response = await fetch(cardModule.base_url+'/'+cardId,{
        method: "DELETE"
      });
      if (response.ok) {
        cardElement.remove();
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de supprimer la carte");
      console.error(error);
    }
  },


  rgb2hex: (color) => {
    if (color.charAt(0) === '#') {
      return color;
    }
    let rgb = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }

};

module.exports = cardModule;
},{"./tag":4}],3:[function(require,module,exports){
const cardModule = require('./card');

const listModule = {
  base_url: null,

  setBaseUrl: (url) => {
    listModule.base_url = url+'/lists';
  },

  showAddModal: () => {
    let modal = document.getElementById('addListModal');
    modal.classList.add('is-active');
  },

  handleAddFormSubmit: async (event) => {
    // event.target contiendra toujours le formulaire
    let data = new FormData(event.target);
    
    // pour éviter "page_order can not be empty"
    let nbListes = document.querySelectorAll('.panel').length;
    data.set('page_order', nbListes);

    try {
      let response = await fetch(listModule.base_url, {
        method: "POST",
        body: data
      }); 
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        const list = await response.json();
        // on appelle la méthode de création avec les bons paramètres.
        let newList = listModule.makeListDOMObject(list.name, list.id);
        listModule.addListToDOM(newList);
      }
    } catch (error) {
      alert("Impossible de créer une liste");
      console.error(error);
    }
  },

  showEditForm: (event) => {
    // récupérer tous les éléments
    let listElement = event.target.closest('.panel');
    let formElement = listElement.querySelector('form');

    // mettre la valeur existante dans l'input
    formElement.querySelector('input[name="name"]').value = event.target.textContent;

    // afficher/masquer
    event.target.classList.add('is-hidden');
    formElement.classList.remove('is-hidden');
  },

  handleEditListForm: async (event) => {
    event.preventDefault();

    // récupérer les données
    let data = new FormData(event.target);
    // récupérer l'id de la liste
    let listElement = event.target.closest('.panel');
    const listId = listElement.getAttribute('list-id');
    //appeler l'API
    try {
      let response = await fetch(listModule.base_url+'/'+listId,{
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

  makeListDOMObject: (listName, listId) => {
    // récupérer le template
    let template = document.getElementById('template-list');
    // créer une nouvelle copie
    let newList = document.importNode(template.content, true);
    // changer les valeurs qui vont bien
    newList.querySelector('h2').textContent = listName;
    newList.querySelector('.panel').setAttribute('list-id', listId);
    // ajouter les event Listener !
    newList.querySelector('.button--add-card').addEventListener('click', cardModule.showAddModal);
    newList.querySelector('h2').addEventListener('dblclick', listModule.showEditForm);
    newList.querySelector('form').addEventListener('submit', listModule.handleEditListForm);
    newList.querySelector('.button--delete-list').addEventListener('click', listModule.deleteList);

    // on appelle le plugin SortableJS !
    let container = newList.querySelector('.panel-block');
    new Sortable(container, {
      group: "list",
      draggable: ".box",
      onEnd: listModule.handleDropCard
    });


    return newList;
  },

  addListToDOM: (newList) => {
    // insérer la nouvelle liste, juste avant le bouton "ajouter une liste"
    let lastColumn = document.getElementById('addListButton').closest('.column');
    lastColumn.before(newList);
  },

  deleteList: async (event) => {
    let listElement = event.target.closest('.panel');
    const listId = listElement.getAttribute('list-id');
    // premier test, la liste est-elle vide?
    if (listElement.querySelectorAll('.box').length) {
      alert("Impossible de supprimer une liste non vide");
      return;
    }
    // ensuite, confirmation utilisateur
    if (!confirm("Supprimer cette liste ?")) {
      return;
    }
    // on appelle l'API
    try {
      let response = await fetch(listModule.base_url+'/'+listId, {
        method: "DELETE"
      });
      if (response.ok) {
        listElement.remove();
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de supprimer la liste.");
      console.log(error);
    }
  },

  updateAllCards: (cards, listId) => {
    cards.forEach( (card, position) => {
      const cardId = card.getAttribute('card-id');
      let data = new FormData();
      data.set('position', position);
      data.set('list_id', listId);
      fetch( cardModule.base_url+'/'+cardId, {
        method: "PATCH",
        body: data
      });
    });
  },

  handleDropCard: (event) => {
    let cardElement = event.item;
    let originList = event.from;
    let targetList = event.to;

    // on fait les bourrins : on va re-parcourir les 2 listes, pour mettre à jour chacune des cartes !
    let cards = originList.querySelectorAll('.box');
    let listId = originList.closest('.panel').getAttribute('list-id');
    listModule.updateAllCards(cards, listId);

    if (originList !== targetList) {
      cards = targetList.querySelectorAll('.box')
      listId = targetList.closest('.panel').getAttribute('list-id');
      listModule.updateAllCards(cards, listId);
    }
  }

};


module.exports = listModule;
},{"./card":2}],4:[function(require,module,exports){
const tagModule = {
  base_url: null,

  setBaseUrl: (url) => {
    tagModule.base_url = url;
  },

  makeTagDOMObject: (tagTitle, tagColor, tagId, cardId) => {
    let newTag = document.createElement('div');
    newTag.classList.add('tag');
    newTag.style.backgroundColor = tagColor;
    newTag.textContent = tagTitle;
    newTag.setAttribute('tag-id', tagId);
    newTag.setAttribute('card-id', cardId);

    newTag.addEventListener('dblclick', tagModule.disassociateTag);

    return newTag;
  },

  addTagToDOM: (tagElement, cardId) => {
    let cardTagsElement = document.querySelector(`[card-id="${cardId}"] .tags`);
    cardTagsElement.appendChild(tagElement);
  },

  showAssociateModal: async (event) => {
    const cardId = event.target.closest('.box').getAttribute('card-id');
    const modal = document.getElementById('associateTagModal');
    // on appelle l'api pour avoir la liste des Tags
    try {
      let response = await fetch(tagModule.base_url+'/tags');
      if (response.ok) {
        let tags = await response.json();
        let container = document.createElement('section');
        container.classList.add('modal-card-body');
        for (let tag of tags) {
          let tagElement = tagModule.makeTagDOMObject(tag.title, tag.color, tag.id, cardId);
          tagElement.addEventListener('click', tagModule.handleAssociateTag);

          container.appendChild(tagElement);
        }
        modal.querySelector('.modal-card-body').replaceWith(container);
        modal.classList.add("is-active");

      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de récupérer les tags");
      console.error(error);
    }  

  },

  handleAssociateTag: async (event) => {
    const tagId = event.target.getAttribute('tag-id');
    const cardId = event.target.getAttribute('card-id');
    try {
      let data = new FormData();
      data.set('tag_id', tagId);
      let response = await fetch(tagModule.base_url+`/cards/${cardId}/tags`, {
        method: "POST",
        body: data
      });
      if (response.ok) {
        // on recrée tous les tags de la carte, pour s'assurer "facilement" de pas créer de doublons
        let card = await response.json();
        // 1 : supprimer les "vieux" tags 
        let oldTags = document.querySelectorAll(`[card-id="${card.id}"] .tag`);
        for (let tag of oldTags) {
          tag.remove();
        }
        // 2 : créer les nouveaux!
        let container = document.querySelector(`[card-id="${card.id}"] .tags`);
        for (let tag of card.tags) {
          let tagElement = tagModule.makeTagDOMObject(tag.title, tag.color, tag.id, card.id);
          container.appendChild(tagElement);
        }

      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible d'associer le tag");
      console.error(error);
    }
    const modal = document.getElementById('associateTagModal');
    modal.classList.remove('is-active');
  },

  disassociateTag: async (event) => {
    const tagId = event.target.getAttribute('tag-id');
    const cardId = event.target.getAttribute('card-id');
    try {
      let response = await fetch(tagModule.base_url+`/cards/${cardId}/tags/${tagId}`,{
        method: "DELETE"
      });
      if (response.ok) {
        // on a rien à faire, sauf supprimer le tag !
        event.target.remove();
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert('Impossible de désassocier le tag'),
      console.error(error);
    }
  },

  makeEditTagForm: (tag) => {
    let orignalForm = document.getElementById('newTagForm');
    let newForm = document.importNode(orignalForm, true);
    // on enlève l'id
    newForm.setAttribute('id', null);
    // on ajoute une classe
    newForm.classList.add('editTagForm');
    // on regle les input
    newForm.querySelector('[name="title"]').value = tag.title;
    newForm.querySelector('[name="color"]').value = tag.color;
    // on rajoute un attribut pour l'id du tag
    newForm.setAttribute('tag-id', tag.id);
    // et un event listener pour le submit
    newForm.addEventListener('submit', tagModule.handleEditTag);
    // on rajoute un bouton "supprimer"
    let deleteButton = document.createElement('div');
    deleteButton.classList.add("button", "is-small", "is-danger");
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener('click', tagModule.handleDeleteTag);

    newForm.querySelector(".field").appendChild(deleteButton);

    return newForm;
  },

  showEditModal: async () => {
    // on récupère les tags depuis l'API
    try {
      let response = await fetch(tagModule.base_url+'/tags');
      if (response.ok) {
        const modal = document.getElementById('addAndEditTagModal');

        let tags = await response.json();
        let container = document.createElement('div');
        container.classList.add('editTagForms');
        for (let tag of tags) {
          let editFormElement = tagModule.makeEditTagForm(tag);
          container.appendChild(editFormElement);
        }
        modal.querySelector('.editTagForms').replaceWith(container);
        
        modal.classList.add('is-active');
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de récupérer les tags");
      console.error(error);
    }
  },

  handleNewTag: async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    try {
      let response = await fetch(tagModule.base_url+'/tags',{
        method: "POST",
        body: data
      });
      if (response.ok) {
        // ba rien! y'a rien à faire.
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de créer le tag");
      console.error(error);
    }
    // on ferme la modale
    document.getElementById('addAndEditTagModal').classList.remove('is-active');
  },

  handleEditTag: async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);

    let tagId = event.target.getAttribute('tag-id');
    try {
      let response = await fetch(tagModule.base_url+'/tags/'+tagId,{
        method: "PATCH",
        body: data
      });
      if (response.ok) {
        let tag = await response.json();
        // on récupère toutes les occurences existantes du tag
        let existingOccurences = document.querySelectorAll(`[tag-id="${tag.id}"]`);
        for (let occurence of existingOccurences) {
          // et on les met à jour
          occurence.textContent = tag.title;
          occurence.style.backgroundColor = tag.color;
        }

      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert('Impossible de mettre le tag à jour');
      console.error(error);
    }
    // on ferme la modale
    document.getElementById('addAndEditTagModal').classList.remove('is-active');
  },

  handleDeleteTag: async (event) => {
    const tagId = event.target.closest('form').getAttribute('tag-id');
    try {
      let response = await fetch(tagModule.base_url+'/tags/'+tagId, {
        method: "DELETE"
      });
      if (response.ok) {
        // on récupère toutes les occurences du tag
        let existingOccurences = document.querySelectorAll(`[tag-id="${tagId}"]`);
        // et on les supprime !
        for (let occurence of existingOccurences) {
          occurence.remove();
        }
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de supprimer le tag");
      console.error(error);
    }
    // on ferme la modale
    document.getElementById('addAndEditTagModal').classList.remove('is-active');
  }
};

module.exports = tagModule;
},{}]},{},[1]);
