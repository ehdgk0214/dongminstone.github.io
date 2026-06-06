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
    const introScreen = document.getElementById("intro-screen");
    const introEnter = document.getElementById("intro-enter");
    const introReplay = document.querySelector("[data-intro-replay]");
    const themeToggle = document.getElementById("theme-toggle");
    const closeButton = modal.querySelector("[data-modal-close]");
    const previousButton = modal.querySelector("[data-modal-prev]");
    const nextButton = modal.querySelector("[data-modal-next]");
    const equipmentTriggers = document.querySelectorAll("[data-equipment-group]");
    const coverImageDimensions = {
        "image%20folder/thumb/dongmin_whale.webp": [909, 1200],
        "image%20folder/thumb/dongmin_busan.webp": [933, 1200],
        "image%20folder/thumb/dm_625.webp": [1031, 1200],
        "image%20folder/thumb/dongmin_namsa.webp": [1025, 1200],
        "image%20folder/thumb/dongmin_sanch.webp": [1125, 1200],
        "image%20folder/thumb/dongmin_block.webp": [1200, 969],
        "image%20folder/thumb/dongmin_budd.webp": [900, 1200],
        "image%20folder/thumb/dm_budd1.webp": [900, 1200]
    };
    const equipmentGroups = {
        cutting: {
            title: "주요 절삭기계",
            location: "대형 조형물을 위한 절삭·가공 설비",
            description: "대형 석재 절단과 형상 가공에 쓰이는 주요 절삭 설비입니다.",
            images: [
                "image%20folder/dm_100.jpg",
                "image%20folder/dm_50.jpg",
                "image%20folder/dm_40.jpg",
                "image%20folder/dm_wire.jpg",
                "image%20folder/dm_wire2.jpg"
            ]
        },
        heavy: {
            title: "주요 중장비",
            location: "작업장과 야적장 내 석재 운반",
            description: "대형 석재를 작업장과 야적장 사이에서 옮기고 제작 흐름을 보조하는 운반 장비 기록입니다.",
            images: [
                "image%20folder/dm_fork1.webp",
                "image%20folder/dm_fork2.webp",
                "image%20folder/dm_fork3.webp"
            ]
        }
    };

    let activeImageGroup = null;
    let activeImageIndex = 0;
    let lastFocusedElement = null;
    let parallaxTicking = false;
    let modalCleanupTimer = null;
    let imageSwitchTimer = null;
    let themeResetTimer = null;
    const INTRO_SEEN_KEY = "dongminIntroSeen";
    const THEME_OVERRIDE_KEY = "dongminThemeOverride";
    const THEME_OVERRIDE_DURATION = 10 * 60 * 1000;

    function createTextElement(tag, text, className) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        element.textContent = text;
        return element;
    }

    function getArtworkImages(artwork) {
        if (!artwork) return [];

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
            const dimensions = coverImageDimensions[artwork.coverImage] || [900, 1200];
            image.src = artwork.coverImage;
            image.alt = artwork.title;
            image.width = dimensions[0];
            image.height = dimensions[1];
            image.loading = "lazy";
            image.decoding = "async";
            image.fetchPriority = "low";

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
            image.width = 160;
            image.height = 160;
            image.loading = "lazy";
            image.decoding = "async";

            button.append(image);
            button.addEventListener("click", () => selectImage(index));
            modalThumbnails.append(button);
        });
    }

    function selectImage(index) {
        const imageGroup = activeImageGroup;
        const images = getArtworkImages(imageGroup);
        if (!imageGroup || images.length === 0) return;

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
            modalImage.alt = imageGroup.title;
            window.requestAnimationFrame(() => {
                modalImage.classList.remove("is-switching");
            });
            preloadNeighborImages(images);
        };

        preload.onerror = () => {
            window.clearTimeout(imageSwitchTimer);
            modalImage.src = nextSrc;
            modalImage.alt = imageGroup.title;
            modalImage.classList.remove("is-switching");
        };

        imageSwitchTimer = window.setTimeout(() => {
            modalImage.src = nextSrc;
            modalImage.alt = imageGroup.title;
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
        openImageGroup(artwork);
    }

    function openImageGroup(imageGroup, initialIndex = 0) {
        const images = getArtworkImages(imageGroup);
        if (!imageGroup || images.length === 0) return;

        window.clearTimeout(modalCleanupTimer);
        activeImageGroup = imageGroup;
        lastFocusedElement = document.activeElement;

        modalTitle.textContent = imageGroup.title;
        modalLocation.textContent = imageGroup.location || "";
        modalDescription.textContent = imageGroup.description || "";
        modal.classList.toggle("has-single-image", images.length < 2);
        renderThumbnails(images);
        selectImage(initialIndex);

        modal.removeAttribute("inert");
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
        modal.setAttribute("inert", "");
        document.body.classList.remove("modal-open");

        modalCleanupTimer = window.setTimeout(() => {
            if (modal.classList.contains("is-open")) return;

            modalImage.removeAttribute("src");
            modalImage.removeAttribute("alt");
            modalCounter.textContent = "";
            modalThumbnails.innerHTML = "";
            modal.classList.remove("has-single-image");
            activeImageGroup = null;
        }, 260);

        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    function handleModalKeys(event) {
        if (!modal.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeModal();
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            showNextImage();
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            showPreviousImage();
        }

        if (event.key === "Tab") {
            trapModalFocus(event);
        }
    }

    function getModalFocusableElements() {
        return Array.from(modal.querySelectorAll(
            "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )).filter((element) => {
            const style = window.getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden";
        });
    }

    function trapModalFocus(event) {
        const focusableElements = getModalFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
            return;
        }

        if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
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

    function updateThemeToggleState() {
        themeToggle?.setAttribute(
            "aria-pressed",
            document.documentElement.classList.contains("day-background") ? "true" : "false"
        );
    }

    function getTimeBasedTheme() {
        const hour = new Date().getHours();
        return hour >= 6 && hour < 18 ? "day" : "night";
    }

    function applyTheme(theme) {
        document.documentElement.classList.toggle("day-background", theme === "day");
    }

    function clearThemeOverride() {
        try {
            localStorage.removeItem(THEME_OVERRIDE_KEY);
        } catch {
            // Ignore storage access failures and fall back to time-based theme.
        }
    }

    function readThemeOverride() {
        try {
            const stored = JSON.parse(localStorage.getItem(THEME_OVERRIDE_KEY) || "null");
            if (stored?.expiresAt > Date.now() && (stored.theme === "day" || stored.theme === "night")) {
                return stored;
            }
        } catch {
            // Ignore invalid or unavailable storage.
        }

        clearThemeOverride();
        return null;
    }

    function scheduleThemeReset(expiresAt) {
        window.clearTimeout(themeResetTimer);
        const delay = expiresAt - Date.now();
        if (delay <= 0) {
            clearThemeOverride();
            applyTheme(getTimeBasedTheme());
            updateThemeToggleState();
            return;
        }

        themeResetTimer = window.setTimeout(() => {
            clearThemeOverride();
            applyTheme(getTimeBasedTheme());
            updateThemeToggleState();
        }, delay);
    }

    function saveTemporaryTheme(theme) {
        const expiresAt = Date.now() + THEME_OVERRIDE_DURATION;

        try {
            localStorage.setItem(THEME_OVERRIDE_KEY, JSON.stringify({ theme, expiresAt }));
            scheduleThemeReset(expiresAt);
        } catch {
            scheduleThemeReset(expiresAt);
        }
    }

    function initializeThemeOverride() {
        const stored = readThemeOverride();
        if (stored) {
            applyTheme(stored.theme);
            scheduleThemeReset(stored.expiresAt);
        }

        updateThemeToggleState();
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

    function enterSite({ remember = true } = {}) {
        if (!introScreen) return;

        if (remember) {
            sessionStorage.setItem(INTRO_SEEN_KEY, "true");
        }

        introScreen.classList.add("is-hidden");
        document.body.classList.remove("intro-active");
    }

    function showIntro() {
        if (!introScreen) return;

        window.scrollTo(0, 0);
        sessionStorage.removeItem(INTRO_SEEN_KEY);
        document.documentElement.classList.remove("intro-seen");
        introScreen.classList.remove("is-hidden");
        document.body.classList.add("intro-active");
        introEnter?.focus({ preventScroll: true });
    }

    function initializeIntro() {
        if (!introScreen) return;

        if (sessionStorage.getItem(INTRO_SEEN_KEY) === "true") {
            introScreen.classList.add("is-hidden");
            document.body.classList.remove("intro-active");
            return;
        }

        document.body.classList.add("intro-active");
    }

    introEnter?.addEventListener("click", () => enterSite());
    introReplay?.addEventListener("click", (event) => {
        event.preventDefault();
        showIntro();
    });
    themeToggle?.addEventListener("click", () => {
        const nextTheme = document.documentElement.classList.contains("day-background") ? "night" : "day";
        applyTheme(nextTheme);
        saveTemporaryTheme(nextTheme);
        updateThemeToggleState();
    });
    equipmentTriggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const imageGroup = equipmentGroups[trigger.dataset.equipmentGroup];
            const initialIndex = Number.parseInt(trigger.dataset.imageIndex, 10) || 0;
            openImageGroup(imageGroup, initialIndex);
        });
    });
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
    initializeIntro();
    initializeThemeOverride();
    updateHeroParallax();
    updateNavState();
})();
