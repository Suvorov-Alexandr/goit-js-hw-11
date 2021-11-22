import './sass/main.scss';
import { Notify } from 'notiflix';
import 'notiflix/dist/notiflix-3.2.2.min.css';
import Simplelightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
// import BtnLoadMore from './js/load-more-btn.js';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.search-form__input'),
  loadMoreBtn: document.querySelector('.load-more'),
  galleryContainer: document.querySelector('.gallery'),
};

// const btnLoadMore = new BtnLoadMore({
//   selector: '[data-action="load-more"]',
//   hidden: true,
// });

const lightBoxOptions = {
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
  showCounter: true,
};

const BASE_URL = 'https://pixabay.com/api/';
const searchOptions = {
  key: '24406319-bf3b8b8cf58844aea35169848',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
  page: 1,
};

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onClickBtnLoadMore);

let gallery = new Simplelightbox('.gallery a', lightBoxOptions);

function onClick(evt) {
  evt.preventDefault();
  gallery.open('.gallery');
}

async function onFormSubmit(evt) {
  evt.preventDefault();
  searchOptions.page = 0;
  searchOptions.q = evt.currentTarget.elements.searchQuery.value;

  if (searchOptions.q === '') {
    showInfoNotification();
    clearPreviousRequest();
    return;
  }

  try {
    const collection = await fetchCollection();
    onSuccessfulExecution(collection);
  } catch (error) {
    showFailureNotification();
  }
  refs.form.reset();
}

function onSuccessfulExecution(answer) {
  clearPreviousRequest();
  renderMarkup(answer);
  refs.galleryContainer.addEventListener('click', onClick);
  gallery.refresh();
  showSuccessNotification(answer);
}

async function fetchCollection() {
  searchOptions.page += 1;
  const searchParams = { params: searchOptions };
  const response = await axios.get(BASE_URL, searchParams);

  if (response.data.hits.length === 0) {
    throw new Error('Whoops');
  }
  return response;
}

async function onClickBtnLoadMore() {
  try {
    const collection = await fetchCollection();
    renderMarkup(collection);
    gallery.refresh();
    smoothScrolling();
  } catch (error) {
    errorNotificationEndOfRequest();
    refs.loadMoreBtn.classList.add('visually-hidden');
  }
}

function clearPreviousRequest() {
  refs.galleryContainer.removeEventListener('click', onClick);
  refs.galleryContainer.innerHTML = '';
  refs.loadMoreBtn.classList.add('visually-hidden');
}

function smoothScrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function renderMarkup({ data }) {
  const markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
  <a href="${largeImageURL}" class="photo-link" >
    <img src="${webformatURL}" alt="${tags}" loading="lazy" class="photo-img"/>
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <i class="bi bi-heart"></i>
    <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
    </svg>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <i class="bi bi-eye"></i>
    <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <i class="bi bi-pencil"></i>
    <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
    </svg>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
    <i class="bi bi-download"></i>
    <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>
  </div>
</div>`,
    )
    .join('');

  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
  refs.loadMoreBtn.classList.remove('visually-hidden');
}

function errorNotificationEndOfRequest() {
  Notify.failure("We're sorry, but you've reached the end of search results.");
}

function showFailureNotification() {
  Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

function showSuccessNotification(answer) {
  Notify.success(`Hooray! We found ${answer.data.totalHits} images.`);
}

function showInfoNotification() {
  Notify.info("The search term couldn't be empty.");
}
