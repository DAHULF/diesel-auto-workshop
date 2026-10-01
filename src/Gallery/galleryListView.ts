import { type Language } from "../languages";
import { type GetGalleryDataHook, type OnPhotoClickedHook } from "./galleryTypes";
import { GalleryView } from "./galleryView";

export class GalleryListView extends GalleryView {
    #listContent: HTMLDivElement;
    #maxImages: number = 4;

    #onPhotoClicked: OnPhotoClickedHook;

    #lang: Language = "ru";

    constructor(getGalleryData: GetGalleryDataHook, onPhotoClicked: OnPhotoClickedHook) {
        const element = document.createElement("div");
        element.classList.add("page__gallery-list");
        element.innerHTML = `
            <button type="button" class="swipe-btn swipe-left-btn" aria-label="Пролистать галерею влево">
                <i data-lucide="chevron-left" class="swipe-left-icon"></i>
            </button>

            <button type="button" class="swipe-btn swipe-right-btn" aria-label="Пролистать галерею вправо">
                <i data-lucide="chevron-right" class="swipe-right-icon"></i>
            </button>
            
            <div class="gallery-list__content scrollable"></div>`;

        super(element, getGalleryData);

        const listContent = element.querySelector<HTMLDivElement>(".gallery-list__content");
        if (listContent === null) {
            throw new Error("Error: gallery list container not found.");
        }

        this.#listContent = listContent;

        this.element.addEventListener("click", this.#clickHandler);
    
        this.#onPhotoClicked = onPhotoClicked;

        this.updateGalleryData();
    }

    updateView(): void {
        const emptyData = this.galleryData.length === 0;

        const slideButtons = this.element.querySelectorAll<HTMLButtonElement>(".swipe-btn");
        slideButtons.forEach(btn => btn.hidden = emptyData);

        if (emptyData) {
            const emptyParagraph = document.createElement("p");
            emptyParagraph.classList.add("gallery-list__empty");
            emptyParagraph.role = "status";
            emptyParagraph.textContent = 
                this.#lang === "ru" ? "Фотографии отсутствуют" : "No photos available";

            this.#listContent.replaceChildren(emptyParagraph);
        } else {
            let galleryImages = this.galleryData.map((item) => {
                const itemTitle = item.title?.[this.#lang] ?? (this.#lang === "ru" ? "Фото" : "Photo");

                const itemButton = document.createElement("button");
                itemButton.type = "button";
                itemButton.classList.add("photo-btn");
                itemButton.dataset.id = item.id.toString();
                itemButton.ariaHasPopup = "dialog";
                itemButton.ariaLabel = itemTitle;

                const image = document.createElement("img");
                image.src = item.imageSrc;
                image.alt = itemTitle;
                image.classList.add("gallery-photo");

                itemButton.append(image);
                return itemButton;
            });

            if (this.galleryData.length > this.#maxImages) {
                galleryImages = galleryImages.slice(0, this.#maxImages + 1);

                const blur = document.createElement("div");
                blur.classList.add("gallery-list__more");
                
                const leftNum = document.createElement("p");
                leftNum.textContent = `${this.galleryData.length - this.#maxImages}+`;

                blur.appendChild(leftNum);
                galleryImages[this.#maxImages]?.appendChild(blur);
            }

            this.#listContent.replaceChildren(...galleryImages);
        }
    }

    set maxImages(maxImages: number) {
        this.#maxImages = maxImages;
        this.updateView();
    }

    setLang(lang: Language): void {
        this.#lang = lang;

        const swipeLeftBtn = this.element.querySelector<HTMLButtonElement>(".swipe-left-btn");
        if (swipeLeftBtn !== null) {
            swipeLeftBtn.ariaLabel = this.#lang === "ru" ? "Пролистать галерею влево" : "Swipe the gallery to the left";
        }

        const swipeRightBtn = this.element.querySelector<HTMLButtonElement>(".swipe-right-btn");
        if (swipeRightBtn !== null) {
            swipeRightBtn.ariaLabel = this.#lang === "ru" ? "Пролистать галерею вправо" : "Swipe the gallery to the right";
        }
        
        this.updateView();
    }

    #clickHandler = (event: Event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest<HTMLButtonElement>("button");
        if (button === null) {
            return;
        }

        if (button.classList.contains("swipe-left-btn") || button.classList.contains("swipe-right-btn")) {
            let swipeDist = this.#listContent.querySelector<HTMLButtonElement>(".photo-btn")?.clientWidth;
            if (swipeDist === undefined) {
                return;
            }

            if (button.classList.contains("swipe-left-btn")) {
                swipeDist *= -1;
            }

            this.#listContent.scrollBy({
                left: swipeDist,
                behavior: "smooth"
            });
        } else if (button.classList.contains("photo-btn")) {
            const photoId = button.dataset.id;
            if (photoId === undefined) {
                return;
            }

            this.#onPhotoClicked(+photoId, this.currentServiceId ?? undefined);
        }
    }
}