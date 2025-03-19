document.addEventListener("DOMContentLoaded", function () { // program.js - Håndterer oppgavevisning, scrolling og klikk til video.html
    const numBoxes = 10;       //  antall bokser
    const visibleBoxes = 3;    // Antall synlige bokser
    const scrollStep = 3;      // Hvor mange bokser som flyttes per klikk

    function createBoxes(rowId) {
        const row = document.getElementById(rowId);
        for (let i = 0; i < numBoxes; i++) {
            const box = document.createElement("a"); 
            box.classList.add("task-box");
            box.href = `video.html?program=${i + 1}`;  // Link til neste side med program-nummer

            const img = document.createElement("img");
            img.src = `images/program${i + 1}.jpg`;  // Bilder må ligge i images-mappa
            img.alt = `Program ${i + 1}`;
            box.appendChild(img);
            
            row.appendChild(box);
        }
    }

    // Lager boksene for vær rad
    createBoxes("row1");
    createBoxes("row2");

    function updateButtonState(rowId, currentScroll) {
        const prevButton = document.querySelector(`.prev-btn[data-row="${rowId}"]`);
        const nextButton = document.querySelector(`.next-btn[data-row="${rowId}"]`);

        prevButton.disabled = currentScroll === 0;
        nextButton.disabled = currentScroll >= numBoxes - visibleBoxes;
    }

    // Event listeners på pilene
    document.querySelectorAll(".prev-btn, .next-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const rowId = this.dataset.row;
            const slider = document.getElementById(rowId);
            let currentScroll = parseInt(slider.dataset.scroll || "0");

            if (this.classList.contains("prev-btn") && currentScroll > 0) {
                currentScroll = Math.max(currentScroll - scrollStep, 0);
            } else if (this.classList.contains("next-btn") && currentScroll < numBoxes - visibleBoxes) {
                currentScroll = Math.min(currentScroll + scrollStep, numBoxes - visibleBoxes);
            }

            slider.style.transform = `translateX(-${currentScroll * 155}px)`;
            slider.dataset.scroll = currentScroll;

            // Oppdater pilenes utseende
            updateButtonState(rowId, currentScroll);
        });
    });

    // Starttilstand for pilene
    updateButtonState("row1", 0);
    updateButtonState("row2", 0);
});