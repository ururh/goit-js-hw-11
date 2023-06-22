import './css/style.css';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';
import axios from "axios";

const BASE_URL = 'https://pixabay.com/api/';
const BASE_KEY = '37643637-de7a158f9839900d5901da2c4';
const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.load-more');
let page = 1;
let query = "";
let data = null;

buttonLoadMore.style.display = "none";

const gallerySimpleLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
});

async function fetchImg() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: BASE_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

function renderGallery(arr) {
  const cards = arr.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
    <div class="photo-card">
      <a href="${largeImageURL}" class="photo"><img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" height="250"/></a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>${likes}
        </p>
        <p class="info-item">
          <b>Views</b>${views}
        </p>
        <p class="info-item">
          <b>Comments</b>${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>${downloads}
        </p>
      </div>
    </div>
  `).join('');

  gallery.innerHTML = page === 1 ? cards : gallery.innerHTML + cards;
  buttonLoadMore.style.display = "block";
}

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  query = e.target.searchQuery.value.trim();
  page = 1;
  buttonLoadMore.style.display = "none";
  if (!query) {
    return;
  }
  data = await fetchImg();
  console.log(data);
  if (data.hits.length === 0) {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
  } else {
    renderGallery(data.hits);
    gallerySimpleLightbox.refresh();
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }
});

buttonLoadMore.addEventListener('click', handleLoadMore);

async function handleLoadMore() {
  const maxPages = Math.ceil(data.totalHits / 40);
  if (!data.totalHits) {
    infoNotify("We're sorry, but you've reached the end of search results.");
    return;
  }
  page += 1;
  const newData = await fetchImg();
  renderGallery(newData.hits);
  gallerySimpleLightbox.refresh();
  if (page >= maxPages) {
    infoNotify("We're sorry, but you've reached the end of search results.");
  }
}

function infoNotify(message) {
  buttonLoadMore.style.display = 'none';
  Notiflix.Notify.info(message);
}