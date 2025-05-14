document.addEventListener('DOMContentLoaded', function () {
  // program.js - Håndterer oppgavevisning, scrolling og klikk til video.html
  const numBoxes = 3; //  antall bokser
  const visibleBoxes = 3; // Antall synlige bokser
  const scrollStep = 3; // Hvor mange bokser som flyttes per klikk

  // Check if user is authenticated and display appropriate content
  const showContent = function () {
    const mainContent = document.getElementById('page-content');
    const authContent = document.getElementById('auth-required');

    // For local testing, always show content
    const forceShow = true; // Set to false for production

    if (localStorage.getItem('access_token') === null && !forceShow) {
      // Not logged in, show auth required message
      if (mainContent) mainContent.style.display = 'none';
      if (authContent) authContent.style.display = 'block';
    } else {
      // Logged in or force show is true, show content
      if (mainContent) mainContent.style.display = 'block';
      if (authContent) authContent.style.display = 'none';
    }
  };

  showContent();

  function createBoxes(rowId) {
    const row = document.getElementById(rowId);

    if (!row) {
      console.warn(`Element with ID '${rowId}' not found`);
      return;
    }

    for (let i = 0; i < numBoxes; i++) {
      const box = document.createElement('a');
      box.classList.add('task-box');
      box.href = `testing.html?programId=${i + 1}`; // Link to test page

      // Placeholder for images in case of missing
      const imgSrc = `images/programId${i + 1}.jpg`;
      const fallbackSrc =
        i % 2 === 0 ? 'images/bilde1.jpg' : 'images/bilde2.jpg';

      const img = document.createElement('img');
      img.alt = `Program ${i + 1}`;

      // Try to load image, use fallback if failed
      img.onerror = function () {
        this.src = fallbackSrc;
      };
      img.src = imgSrc;

      box.appendChild(img);
      row.appendChild(box);
    }
  }

  // Create boxes for each row
  createBoxes('row1');
  createBoxes('row2');
  createBoxes('row3');

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

  // Event listeners for buttons
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

      // Update button appearance
      updateButtonState(rowId, currentScroll);
    });
  });

  // Initial state for buttons
  updateButtonState('row1', 0);
  updateButtonState('row2', 0);
  updateButtonState('row3', 0);
});
