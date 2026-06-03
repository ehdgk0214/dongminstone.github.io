(() => {
    const artworks = window.DONGMIN_ARTWORKS || [];
    const gallery = document.getElementById("gallery-grid");
    const modal = document.getElementById("artwork-modal");
    const modalImage = document.getElementById("modal-image");
    const modalTitle = document.getElementById("modal-title");
    const modalLocation = document.getElementById("modal-location");
    const modalDescription = document.getElementById("modal-description");
    const modalThumbnails = document.getElementById("modal-thumbnails");
    const modalCounter = document.getElementById("modal-counter");
    const siteNav = document.querySelector(".site-nav");
    const closeButton = modal.querySelector("[data-modal-close]");
    const previousButton = modal.querySelector("[data-modal-prev]");
    const nextButton = modal.querySelector("[data-modal-next]");

    let activeArtworkIndex = 0;
    let activeImageIndex = 0;
    let lastFocusedElement = null;
    let parallaxTicking = false;
    let modalCleanupTimer = null;
    let imageSwitchTimer = null;

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

        revealGalleryItems();
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
        modalCounter.textContent = `${activeImageIndex + 1} / ${images.length}`;
        modalImage.alt = "";
        modalImage.classList.add("is-switching");
        window.clearTimeout(imageSwitchTimer);

        const nextSrc = images[activeImageIndex];
        const preload = new Image();

        preload.onload = () => {
            window.clearTimeout(imageSwitchTimer);
            modalImage.src = nextSrc;
            modalImage.alt = artwork.title;
            window.requestAnimationFrame(() => {
                modalImage.classList.remove("is-switching");
            });
            preloadNeighborImages(images);
        };

        preload.onerror = () => {
            window.clearTimeout(imageSwitchTimer);
            modalImage.src = nextSrc;
            modalImage.alt = artwork.title;
            modalImage.classList.remove("is-switching");
        };

        imageSwitchTimer = window.setTimeout(() => {
            modalImage.src = nextSrc;
            modalImage.alt = artwork.title;
            modalImage.classList.remove("is-switching");
        }, 450);

        preload.src = nextSrc;

        modalThumbnails.querySelectorAll(".modal-thumbnail").forEach((thumbnail, thumbnailIndex) => {
            const isActive = thumbnailIndex === activeImageIndex;
            thumbnail.classList.toggle("is-active", isActive);
            thumbnail.setAttribute("aria-current", isActive ? "true" : "false");
        });
    }

    function preloadNeighborImages(images) {
        if (images.length < 2) return;

        const neighbors = [
            images[(activeImageIndex + 1) % images.length],
            images[(activeImageIndex - 1 + images.length) % images.length]
        ];

        neighbors.forEach((src) => {
            const image = new Image();
            image.src = src;
        });
    }

    function showPreviousImage() {
        selectImage(activeImageIndex - 1);
    }

    function showNextImage() {
        selectImage(activeImageIndex + 1);
    }

    function openModal(index) {
        const artwork = artworks[index];
        const images = getArtworkImages(artwork);
        if (!artwork || images.length === 0) return;

        window.clearTimeout(modalCleanupTimer);
        activeArtworkIndex = index;
        lastFocusedElement = document.activeElement;

        modalTitle.textContent = artwork.title;
        modalLocation.textContent = artwork.location;
        modalDescription.textContent = artwork.description;
        modal.classList.toggle("has-single-image", images.length < 2);
        renderThumbnails(images);
        selectImage(0);

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        closeButton.focus();
    }

    function closeModal() {
        window.clearTimeout(imageSwitchTimer);
        modalImage.classList.remove("is-switching");
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");

        modalCleanupTimer = window.setTimeout(() => {
            if (modal.classList.contains("is-open")) return;

            modalImage.removeAttribute("src");
            modalImage.removeAttribute("alt");
            modalCounter.textContent = "";
            modalThumbnails.innerHTML = "";
            modal.classList.remove("has-single-image");
        }, 260);

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
            showNextImage();
        }

        if (event.key === "ArrowLeft") {
            showPreviousImage();
        }
    }

    function updateHeroParallax() {
        const hero = document.querySelector(".hero");
        if (!hero) return;

        const heroHeight = hero.offsetHeight;
        const offset = Math.min(window.scrollY * 0.5, heroHeight * 0.55);
        document.documentElement.style.setProperty("--hero-parallax", `${offset}px`);
        parallaxTicking = false;
    }

    function requestHeroParallaxUpdate() {
        if (parallaxTicking) return;

        parallaxTicking = true;
        window.requestAnimationFrame(updateHeroParallax);
    }

    function updateNavState() {
        siteNav?.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    function revealGalleryItems() {
        const items = document.querySelectorAll(".gallery-item");

        if (!("IntersectionObserver" in window)) {
            items.forEach((item) => item.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver((entries, galleryObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                galleryObserver.unobserve(entry.target);
            });
        }, {
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.12
        });

        items.forEach((item, index) => {
            item.style.transitionDelay = `${Math.min(index, 5) * 45}ms`;
            observer.observe(item);
        });
    }

    closeButton.addEventListener("click", closeModal);
    previousButton.addEventListener("click", showPreviousImage);
    nextButton.addEventListener("click", showNextImage);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });
    window.addEventListener("keydown", handleModalKeys);
    window.addEventListener("scroll", () => {
        requestHeroParallaxUpdate();
        updateNavState();
    }, { passive: true });
    window.addEventListener("resize", requestHeroParallaxUpdate);

    renderGallery();
    updateHeroParallax();
    updateNavState();
})();
