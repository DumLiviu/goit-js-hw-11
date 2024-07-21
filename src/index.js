import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '45040049-69457e30cba55d5adb844da63';
const BASE_URL = 'https://pixabay.com/api/';
const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let currentPage = 1;
let currentQuery = '';

form.addEventListener('submit', async event => {
  event.preventDefault();
  currentQuery = event.currentTarget.searchQuery.value.trim();
  if (currentQuery === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }
  currentPage = 1;
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('hidden');
  await fetchImages();
  loadMoreBtn.classList.remove('hidden');
});

loadMoreBtn.addEventListener('click', fetchImages);

async function fetchImages() {
  const params = {
    key: API_KEY,
    q: currentQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: currentPage,
    per_page: 40,
  };

  try {
    const response = await axios.get(BASE_URL, { params });
    const data = response.data;

    if (data.hits.length === 0 && currentPage === 1) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.classList.add('hidden');
      return;
    }

    renderGallery(data.hits);

    if (currentPage === 1) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    if (data.totalHits <= currentPage * 40) {
      loadMoreBtn.classList.add('hidden');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }

    currentPage += 1;

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}

function renderGallery(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
            <div class="photo-card">
                <a href="${largeImageURL}">
                    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                </a>
                <div class="info">
                    <p class="info-item"><b>Likes</b>${likes}</p>
                    <p class="info-item"><b>Views</b>${views}</p>
                    <p class="info-item"><b>Comments</b>${comments}</p>
                    <p class="info-item"><b>Downloads</b>${downloads}</p>
                </div>
            </div>
        `;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);

  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}
