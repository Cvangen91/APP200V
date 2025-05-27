document.addEventListener('DOMContentLoaded', function () {
  const numBoxes = 3; 
  const visibleBoxes = 3; 
  const scrollStep = 1; 



  const showContent = function () {
    const mainContent = document.getElementById('page-content');
    const authContent = document.getElementById('auth-required');

    const forceShow = true; // Set to false for production

    if (localStorage.getItem('access_token') === null && !forceShow) {
      if (mainContent) mainContent.style.display = 'none';
      if (authContent) authContent.style.display = 'block';
    } else {
      if (mainContent) mainContent.style.display = 'block';
      if (authContent) authContent.style.display = 'none';
    }
  };

  showContent();


  function createBoxes(rowId, imagePath, programId) {
  const row = document.getElementById(rowId);

  if (!row) {
    console.warn(`Element with ID '${rowId}' not found`);
    return;
  }

  for (let i = 0; i < numBoxes; i++) {
    const box = document.createElement('a');
    box.classList.add('task-box');
    box.href = `testing.html?programId=${programId}`;

    const img = document.createElement('img');
    img.alt = `Program ${programId}`;
    img.onerror = function () {
      this.src = 'images/fallback.jpg'; // Fallback-picture
    };
    img.src = imagePath;

    box.appendChild(img);
    row.appendChild(box);
  }
}

createBoxes('row1', 'images/programId1.jpg', 1);
createBoxes('row2', 'images/programId2.jpg', 2);
createBoxes('row3', 'images/programId3.jpg', 3);

  function updateButtonState(rowId, currentScroll) {
    const prevButton = document.querySelector(`.prev-btn[data-row="${rowId}"]`);
    const nextButton = document.querySelector(`.next-btn[data-row="${rowId}"]`);

    if (!prevButton || !nextButton) {
      console.warn(`Buttons for row '${rowId}' not found`);
      return;
    }

    prevButton.disabled = currentScroll === 0;
    nextButton.disabled = currentScroll >= numBoxes - visibleBoxes;
  }

  document.querySelectorAll('.prev-btn, .next-btn').forEach((button) => {
    button.addEventListener('click', function () {
      const rowId = this.dataset.row;
      const slider = document.getElementById(rowId);

      if (!slider) {
        console.warn(`Slider for '${rowId}' not found`);
        return;
      }

      let currentScroll = parseInt(slider.dataset.scroll || '0');

      if (this.classList.contains('prev-btn') && currentScroll > 0) {
        currentScroll = Math.max(currentScroll - scrollStep, 0);
      } else if (
        this.classList.contains('next-btn') &&
        currentScroll < numBoxes - visibleBoxes
      ) {
        currentScroll = Math.min(
          currentScroll + scrollStep,
          numBoxes - visibleBoxes
        );
      }

      slider.style.transform = `translateX(-${currentScroll * 155}px)`;
      slider.dataset.scroll = currentScroll;

      updateButtonState(rowId, currentScroll);
    });
  });

  updateButtonState('row1', 0);
  updateButtonState('row2', 0);
  updateButtonState('row3', 0);
});
