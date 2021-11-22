import './sass/main.scss';
import { Notify } from 'notiflix';
import 'notiflix/dist/notiflix-3.2.2.min.css';
import Simplelightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import BtnLoadMore from './js/load-more-btn.js';

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

  try {
    const collection = await fetchCollection(evt.currentTarget.elements.searchQuery.value);
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

async function fetchCollection(query = searchOptions.q) {
  searchOptions.q = `${query}`;
  searchOptions.page = searchOptions.page + 1;
  const searchParams = { params: searchOptions };
  const response = await axios.get(BASE_URL, searchParams);

  if (response.data.hits.length === 0) {
    throw new Error();
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
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
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
