(() => {
    const artworks = window.DONGMIN_ARTWORKS || [];
    const gallery = document.getElementById("gallery-grid");
    const modal = document.getElementById("artwork-modal");
    const modalImage = document.getElementById("modal-image");
    const modalTitle = document.getElementById("modal-title");
    const modalLocation = document.getElementById("modal-location");
    const modalDescription = document.getElementById("modal-description");
    const modalThumbnails = document.getElementById("modal-thumbnails");
    const closeButton = modal.querySelector("[data-modal-close]");

    let activeArtworkIndex = 0;
    let activeImageIndex = 0;
    let lastFocusedElement = null;

    function createTextElement(tag, text, className) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        element.textContent = text;
        return element;
    }

    function getArtworkImages(artwork) {
        if (Array.isArray(artwork.images) && artwork.images.length > 0) {
            return artwork.images;
        }

        return artwork.coverImage ? [artwork.coverImage] : [];
    }

    function renderGallery() {
        gallery.innerHTML = "";

        artworks.forEach((artwork, index) => {
            const item = document.createElement("article");
            item.className = "gallery-item";
            item.tabIndex = 0;
            item.setAttribute("role", "button");
            item.setAttribute("aria-label", `${artwork.title} 자세히 보기`);

            const visual = document.createElement("div");
            visual.className = "gallery-visual";

            const image = document.createElement("img");
            image.src = artwork.coverImage;
            image.alt = artwork.title;
            image.loading = index < 2 ? "eager" : "lazy";
            image.decoding = "async";

            const info = document.createElement("div");
            info.className = "gallery-info";
            info.append(
                createTextElement("h3", artwork.title),
                createTextElement("p", artwork.location)
            );

            const count = getArtworkImages(artwork).length;
            if (count > 1) {
                info.append(createTextElement("span", `${count} photos`, "photo-count"));
            }

            visual.append(image);
            item.append(visual, info);
            item.addEventListener("click", () => openModal(index));
            item.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openModal(index);
                }
            });

            gallery.append(item);
        });
    }

    function renderThumbnails(images) {
        modalThumbnails.innerHTML = "";

        images.forEach((imageUrl, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "modal-thumbnail";
            button.setAttribute("aria-label", `${index + 1}번째 사진 보기`);

            const image = document.createElement("img");
            image.src = imageUrl;
            image.alt = "";
            image.loading = "lazy";
            image.decoding = "async";

            button.append(image);
            button.addEventListener("click", () => selectImage(index));
            modalThumbnails.append(button);
        });
    }

    function selectImage(index) {
        const artwork = artworks[activeArtworkIndex];
        const images = getArtworkImages(artwork);

        activeImageIndex = (index + images.length) % images.length;
        modalImage.src = images[activeImageIndex];
        modalImage.alt = artwork.title;

        modalThumbnails.querySelectorAll(".modal-thumbnail").forEach((thumbnail, thumbnailIndex) => {
            const isActive = thumbnailIndex === activeImageIndex;
            thumbnail.classList.toggle("is-active", isActive);
            thumbnail.setAttribute("aria-current", isActive ? "true" : "false");
        });
    }

    function openModal(index) {
        const artwork = artworks[index];
        const images = getArtworkImages(artwork);
        if (!artwork || images.length === 0) return;

        activeArtworkIndex = index;
        lastFocusedElement = document.activeElement;

        modalTitle.textContent = artwork.title;
        modalLocation.textContent = artwork.location;
        modalDescription.textContent = artwork.description;
        renderThumbnails(images);
        selectImage(0);

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        closeButton.focus();
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        modalImage.removeAttribute("src");

        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    function handleModalKeys(event) {
        if (!modal.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            closeModal();
        }

        if (event.key === "ArrowRight") {
            selectImage(activeImageIndex + 1);
        }

        if (event.key === "ArrowLeft") {
            selectImage(activeImageIndex - 1);
        }
    }

    closeButton.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });
    window.addEventListener("keydown", handleModalKeys);

    renderGallery();
})();
