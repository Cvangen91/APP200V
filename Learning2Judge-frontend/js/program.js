document.addEventListener("DOMContentLoaded", function () { // program.js - Håndterer oppgavevisning, scrolling og klikk til video.html
    const numBoxes = 10;       //  antall bokser
    const visibleBoxes = 3;    // Antall synlige bokser
    const scrollStep = 3;      // Hvor mange bokser som flyttes per klikk

    // Verifica se o usuário está autenticado e exibe o conteúdo correto
    const showContent = function() {
        const mainContent = document.getElementById('page-content');
        const authContent = document.getElementById('auth-required');
        
        // Para testes locais, sempre mostrar o conteúdo
        const forceShow = true; // Defina como false para produção
        
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

    showContent(); // Exibe o conteúdo da página

    function createBoxes(rowId) {
        const row = document.getElementById(rowId);
        
        if (!row) {
            console.warn(`Elemento com ID '${rowId}' não encontrado`);
            return;
        }

        for (let i = 0; i < numBoxes; i++) {
            const box = document.createElement("a"); 
            box.classList.add("task-box");
            box.href = `testing.html?program=${i + 1}`;  // Link para a página de teste
            
            // Placeholder para imagens em caso de falta
            const imgSrc = `images/program${i + 1}.jpg`;
            const fallbackSrc = i % 2 === 0 ? "images/bilde1.jpg" : "images/bilde2.jpg";
            
            const img = document.createElement("img");
            img.alt = `Program ${i + 1}`;
            
            // Tenta carregar a imagem, se falhar, usa fallback
            img.onerror = function() {
                this.src = fallbackSrc;
            };
            img.src = imgSrc;
            
            box.appendChild(img);
            row.appendChild(box);
        }
    }

    // Lager boksene for hver rad
    createBoxes("row1");
    createBoxes("row2");
    createBoxes("row3"); // Adicionado para a tredje linje

    function updateButtonState(rowId, currentScroll) {
        const prevButton = document.querySelector(`.prev-btn[data-row="${rowId}"]`);
        const nextButton = document.querySelector(`.next-btn[data-row="${rowId}"]`);

        if (!prevButton || !nextButton) {
            console.warn(`Botões para a linha '${rowId}' não encontrados`);
            return;
        }

        prevButton.disabled = currentScroll === 0;
        nextButton.disabled = currentScroll >= numBoxes - visibleBoxes;
    }

    // Event listeners para os botões
    document.querySelectorAll(".prev-btn, .next-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const rowId = this.dataset.row;
            const slider = document.getElementById(rowId);
            
            if (!slider) {
                console.warn(`Slider para '${rowId}' não encontrado`);
                return;
            }
            
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
    updateButtonState("row3", 0); // Adicionado para a tredje linje
});