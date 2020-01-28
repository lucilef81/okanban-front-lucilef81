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