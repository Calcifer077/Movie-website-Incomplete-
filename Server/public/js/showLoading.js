export const showLoading = (isLoading) => {
  // const loaderParent = document.querySelector('.loader-parent');
  const loader = document.querySelector('.loader');
  if (isLoading) {
    // loaderParent.style.display = 'flex';
    loader.style.display = 'block';
  } else {
    // loaderParent.style.display = 'none';
    loader.style.display = 'none';
    console.log('did');
  }
};
