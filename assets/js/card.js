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