import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};
refs.loadMore.style.display = 'none';
let alreadyShown = 0;
let page = 1;

refs.form.addEventListener('submit', onFormSubmit);

refs.loadMore.addEventListener('click', onLoadMoreClick);

function onLoadMoreClick() {
  refs.loadMore.style.display = 'none';
  page += 1;
  const name = refs.form.querySelector('input').value.trim();
  loadFromAPI(name, page);
  refs.loadMore.style.display = 'flex';
}

refs.form.querySelector('input');
function onFormSubmit(e) {
  e.preventDefault();
  alreadyShown = 0;
  refs.gallery.innerHTML = '';

  const name = refs.form.querySelector('input').value.trim();

  if (name !== '') {
    loadFromAPI(name);
  } else {
    refs.loadMore.style.display = 'none';
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

// ----------------------------loadFromAPI;
async function loadFromAPI(name, page) {
  const BASE_URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '31311372-7a32d736a6b9fd9c5281051f5',
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 10,
    },
  };

  try {
    const response = await axios.get(BASE_URL, options);
    alreadyShown += response.data.hits.length;
    console.log('🚀 ~ alreadyShown', alreadyShown);
    message(
      response.data.hits.length,
      alreadyShown,
      options.params.per_page,
      response.data.total
    );

    renderGallery(response.data);
  } catch (error) {
    console.log(error);
  }
}
function renderGallery(picture) {
  const markup = picture.hits
    .map(hit => {
      return `<a class="gallery__link" href="${hit.largeImageURL}">
        <div class="photo-card">
    <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${hit.likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${hit.views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${hit.comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${hit.downloads}
      </p>
    </div>
  </div>
  </a>`;
    })
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
function message(length, alreadyShown, per_page, total) {
  if (!length) {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  if (alreadyShown === per_page) {
    Notify.info(`Hooray! We found ${total} images.`);
    refs.loadMore.style.display = 'flex';
  }
  if (alreadyShown > total) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadMore.style.display = 'none';
  }
}
