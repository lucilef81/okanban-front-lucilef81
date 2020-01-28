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