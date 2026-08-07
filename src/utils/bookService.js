import axios from 'axios';

const LIBRARY_KEY = 'learningjemz-library';
const PROGRESS_KEY = 'learningjemz-reading-progress';

// Helper to get raw storage data
const getStorageData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return {};
  }
};

const setStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
};

export const searchBooks = async (query) => {
  if (!query) return [];
  try {
    const response = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
    const docs = response.data.docs || [];
    return docs.map(doc => ({
      key: doc.key,
      title: doc.title,
      author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
      year: doc.first_publish_year,
      coverId: doc.cover_i,
      isbn: doc.isbn ? doc.isbn[0] : null
    }));
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

export const getBookDetails = async (key) => {
  try {
    const response = await axios.get(`https://openlibrary.org${key}.json`);
    return response.data;
  } catch (error) {
    console.error('Error getting book details:', error);
    return null;
  }
};

export const getBookContent = async (_key) => {
  // Internet Archive doesn't provide easy text extraction without authentication and specific formats.
  // We'll return null to use the fallback text in BookReader.
  return null;
};

export const getCoverUrl = (coverId, size = 'M') => {
  if (!coverId) return null; // Can use a placeholder in UI
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

export const getLibrary = () => {
  const library = getStorageData(LIBRARY_KEY);
  return Object.values(library);
};

export const saveToLibrary = (book) => {
  const library = getStorageData(LIBRARY_KEY);
  library[book.key] = book;
  setStorageData(LIBRARY_KEY, library);
};

export const removeFromLibrary = (key) => {
  const library = getStorageData(LIBRARY_KEY);
  delete library[key];
  setStorageData(LIBRARY_KEY, library);
};

export const updateReadingProgress = (key, progress) => {
  const allProgress = getStorageData(PROGRESS_KEY);
  allProgress[key] = progress;
  setStorageData(PROGRESS_KEY, allProgress);
};

export const getReadingProgress = (key) => {
  const allProgress = getStorageData(PROGRESS_KEY);
  return allProgress[key] || 0;
};
