export const showLoading = (isLoading) => {
  const loader = document.querySelector('.loader');
  if (isLoading) {
    loader.style.display = 'block';
  } else {
    loader.style.display = 'none';
  }
};
