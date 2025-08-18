import "./index.css";
import {
  enableValidation,
  config,
  settings,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const initialCards = [
  {
    name: "Golden Gate Bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },

  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },

  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },

  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },

  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },

  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },

  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

let selectedCard = null;
let selectedCardId = null;

function renderUser({ name, about, avatar }) {
  profileNameEl.textContent = name;
  profileDescriptionEl.textContent = about;
  profileAvatarEl.src = avatar;
  profileAvatarEl.alt = `${name}'s avatar`;
}

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "79294459-27fc-4aa1-aa0b-1cdeed6275b2",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([user, cards]) => {
    renderUser(user);
    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

const editProfileButton = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton = editProfileModal.querySelector(
  ".modal__close-button"
);
const editAvatarButton = document.querySelector(".profile__avatar-btn");

const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const newPostButton = document.querySelector(".profile__new-post");
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");
const newPostSubmitButton = newPostModal.querySelector(".modal__save-button");
const newPostCloseButton = newPostModal.querySelector(".modal__close-button");
const newPostImageInput = newPostModal.querySelector("#card-image-input");
const newPostCaptionInput = newPostModal.querySelector("#card-caption-input");

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitButton = avatarModal.querySelector(".modal__save-button");
const avatarCloseButton = avatarModal.querySelector(".modal__close-button");
const avatarImageInput = avatarModal.querySelector("#profile-avatar-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector("#delete-form");
const deleteSubmitBtn = deleteForm.querySelector(".modal__save-button"); //  --delete variant
const deleteCancelBtn = deleteModal.querySelector(".modal__cancel-button");

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

const previewModal = document.querySelector("#preview-modal");
const previewImage = previewModal.querySelector(".modal__image");
const previewCaption = previewModal.querySelector(".modal__caption");
const previewCloseButton = previewModal.querySelector(
  ".modal__close-button_preview"
);

const cardsTemplate = document
  .querySelector("#cards-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

function getCardElement(data) {
  const cardElement = cardsTemplate.cloneNode(true);
  const cardTitle = cardElement.querySelector(".card__name");
  const cardImage = cardElement.querySelector(".card__image");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__delete-button");

  if (data._id) cardElement.dataset.cardId = data._id;

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  if (data.isLiked) {
    likeButton.classList.add("card__like-button_active");
  }

  likeButton.addEventListener("click", () => {
    const id = cardElement.dataset.cardId;
    const isActive = likeButton.classList.contains("card__like-button_active");
    const req = isActive ? api.removeLike(id) : api.addLike(id);

    req
      .then((updated) => {
        if (updated.isLiked) {
          likeButton.classList.add("card__like-button_active");
        } else {
          likeButton.classList.remove("card__like-button_active");
        }
      })
      .catch(console.error);
  });

  deleteButton.addEventListener("click", () => {
    handleDeleteCard(cardElement, data);
  });

  cardImage.addEventListener("click", () => {
    previewImage.src = data.link;
    previewImage.alt = data.name;
    previewCaption.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id || cardElement.dataset.cardId;
  openModal(deleteModal);
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const saveBtn = avatarForm.querySelector(".modal__save-button");
  const prev = saveBtn.textContent;
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;

  api
    .editAvatarInfo({ avatar: avatarImageInput.value })
    .then((data) => {
      profileAvatarEl.src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
    })
    .catch(console.error)
    .then(() => {
      saveBtn.textContent = prev;
      saveBtn.disabled = false;
    });
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscClose);
  modal.addEventListener("mousedown", handleOverlayClick);
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openModal = document.querySelector(".modal_is-opened");
    if (openModal) {
      closeModal(openModal);
    }
  }
}

function handleOverlayClick(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscClose);
  modal.removeEventListener("mousedown", handleOverlayClick);
}

editProfileButton.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  const form = editProfileModal.querySelector(".modal__form");
  resetValidation(form, config);
  openModal(editProfileModal);
});

editAvatarButton.addEventListener("click", function () {
  openModal(avatarModal);
});

avatarCloseButton.addEventListener("click", function () {
  closeModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

editProfileCloseButton.addEventListener("click", function () {
  closeModal(editProfileModal);
});

previewCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});

newPostButton.addEventListener("click", function () {
  newPostForm.reset();
  resetValidation(newPostForm, config);
  openModal(newPostModal);
});

newPostCloseButton.addEventListener("click", function () {
  closeModal(newPostModal);
});

function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const saveBtn = editProfileForm.querySelector(".modal__save-button");
  const prev = saveBtn.textContent;
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
      editProfileForm.reset();
    })
    .catch(console.error)
    .then(() => {
      saveBtn.textContent = prev;
      saveBtn.disabled = false;
    });
}

function handleNewPostSubmit(evt) {
  evt.preventDefault();

  const saveBtn = newPostForm.querySelector(".modal__save-button");
  const prev = saveBtn.textContent;
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true; // prevents double submits

  api
    .addCard({
      name: newPostCaptionInput.value,
      link: newPostImageInput.value,
    })
    .then((data) => {
      const newCardElement = getCardElement(data);
      cardsList.prepend(newCardElement);
      closeModal(newPostModal);
      newPostForm.reset();
    })
    .catch(console.error)
    .then(() => {
      saveBtn.textContent = prev;
      saveBtn.disabled = false; // let validation re-toggle if needed
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  if (!selectedCardId) {
    closeModal(deleteModal);
    return;
  }

  const prev = deleteSubmitBtn.textContent;
  deleteSubmitBtn.textContent = "Deleting...";
  deleteSubmitBtn.disabled = true;

  api
    .deleteCard(selectedCardId)
    .then(() => {
      if (selectedCard) selectedCard.remove();
      selectedCard = null;
      selectedCardId = null;
      closeModal(deleteModal);
    })
    .catch(console.error)
    .then(() => {
      deleteSubmitBtn.textContent = prev;
      deleteSubmitBtn.disabled = false;
    });
}

deleteForm.addEventListener("submit", handleDeleteSubmit);
deleteCancelBtn.addEventListener("click", () => {
  selectedCard = null;
  selectedCardId = null;
  closeModal(deleteModal);
});

editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", handleNewPostSubmit);

enableValidation(settings);
