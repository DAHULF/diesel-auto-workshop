import { type Language, type LangItem } from "../languages";
import { type GetGalleryDataHook } from "./galleryTypes";
import { GalleryView } from "./galleryView";

type ServicesData = {
    id: number;
    name: LangItem;
}

export class GallerySectionView extends GalleryView {
    #listContent: HTMLElement;
    #mainContent: HTMLElement;

    #serviceTypeSelect: HTMLSelectElement;

    #galleryTitle: HTMLHeadingElement;

    #currentDisplayedMainId: number | null = null;
    #displayMainLater: number | null = null;

    #servicesData: ServicesData[] = [];

    #lang: Language = "ru";

    constructor(getGalleryData: GetGalleryDataHook) {
        const element = document.createElement("section");
        element.classList.add("dialog__section-gallery");
        element.innerHTML = `
            <div class="gallery__manage">
                <button type="button" class="back-btn">
                    <span>Назад</span>
                </button>

                <select class="gallery__select-service" name="serviceType"></select>
            </div>

            <div class="gallery__main">
                <button type="button" class="swipe-btn swipe-left-btn" aria-label="Открыть предыдущую фотографию">
                    <i data-lucide="chevron-left" class="swipe-left-icon"></i>
                </button>

                <button type="button" class="swipe-btn swipe-right-btn" aria-label="Открыть следующую фотографию">
                    <i data-lucide="chevron-right" class="swipe-right-icon"></i>
                </button>

                <div class="main__content"></div>
            </div>

            <h3 class="gallery__section-title"></h3>

            <div class="gallery__section-list">
                <button type="button" class="swipe-btn swipe-left-btn" aria-label="Пролистать галерею влево">
                    <i data-lucide="chevron-left" class="swipe-left-icon"></i>
                </button>

                <button type="button" class="swipe-btn swipe-right-btn" aria-label="Пролистать галерею вправо">
                    <i data-lucide="chevron-right" class="swipe-right-icon"></i>
                </button>

                <div class="section-list__content scrollable"></div>
            </div>
        `;

        super(element, getGalleryData);

        const list = element.querySelector<HTMLDivElement>(".gallery__section-list");
        if (list === null) {
            throw new Error("Error: Gallery list not found.");
        }
        list.addEventListener("click", this.#listClickHandler);

        const listContent = element.querySelector<HTMLDivElement>(".section-list__content");
        if (listContent === null) {
            throw new Error("Error: gallery list container not found.");
        }
        this.#listContent = listContent;

        const main = element.querySelector<HTMLDivElement>(".gallery__main");
        if (main === null) {
            throw new Error("Error: Gallery main container not found.");
        }
        main.addEventListener("click", this.#mainClickHandler);

        const mainContent = element.querySelector<HTMLDivElement>(".main__content");
        if (mainContent === null) {
            throw new Error("Error: main image container not found.");
        }
        this.#mainContent = mainContent;

        const serviceSelect = element.querySelector<HTMLSelectElement>(".gallery__select-service");
        if (serviceSelect === null) {
            throw new Error("Error: Service type select not found.");
        }
        this.#serviceTypeSelect = serviceSelect;
        this.#serviceTypeSelect.addEventListener("change", this.#selectChangeHandler);

        const galleryTitle = element.querySelector<HTMLHeadingElement>(".gallery__section-title");
        if (galleryTitle === null) {
            throw new Error("Error: Gallery title not found.");
        }
        this.#galleryTitle = galleryTitle;

        this.setServicesData([]);
        this.updateGalleryData();
    }

    updateView(): void {
        this.#serviceTypeSelect.value = this.currentServiceId?.toString() ?? "all";

        const emptyData = this.galleryData.length === 0;

        if (emptyData) {
            const emptyParagraph = document.createElement("p");
            emptyParagraph.classList.add("gallery-list__empty");
            emptyParagraph.role = "status";
            emptyParagraph.textContent = 
                this.#lang === "ru" ? "Фотографии отсутствуют" : "No photos available";

            this.#mainContent.replaceChildren(emptyParagraph);
            this.#currentDisplayedMainId = null;
        } else {
            let galleryImages = this.galleryData.map((item) => {
                const itemTitle = item.title?.[this.#lang] ?? (this.#lang === "ru" ? "Фото" : "Photo");

                const itemButton = document.createElement("button");
                itemButton.type = "button";
                itemButton.classList.add("photo-btn");
                itemButton.dataset.id = item.id.toString();
                itemButton.ariaLabel = itemTitle;

                const image = document.createElement("img");
                image.src = item.imageSrc;
                image.alt = itemTitle;
                image.classList.add("gallery-photo");

                itemButton.append(image);
                return itemButton;
            });

            this.#listContent.replaceChildren(...galleryImages);

            this.displayMain(this.#displayMainLater ?? this.galleryData[0]!.id);
        }
    }

    displayMain(photoId: number, serviceId?: number): void {
        if (serviceId !== undefined) {
            this.filterGalleryData(serviceId);
            this.#displayMainLater = photoId;
            return;
        }

        if (this.galleryData.length === 0) {
            return;
        }

        let mainData = this.galleryData.find((data) => data.id === photoId);
        if (mainData === undefined) {
            mainData = this.galleryData[0]!;
        }

        const mainImage = document.createElement("img");
        mainImage.src = mainData.imageSrc;
        mainImage.alt = mainData.title?.[this.#lang] ?? (this.#lang === "ru" ? "Фото" : "Photo");

        this.#mainContent.replaceChildren(mainImage);
        this.#galleryTitle.textContent = mainData.title?.[this.#lang] ?? "";

        this.#currentDisplayedMainId = photoId;

        this.#listContent.querySelector(".photo-btn--current")?.classList.remove("photo-btn--current");
        this.#listContent.querySelector(`.photo-btn[data-id="${photoId}"]`)?.classList.add("photo-btn--current");
    }

    setServicesData(data: ServicesData[]): void {
        this.#servicesData = data;

        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.selected = true;
        allOption.textContent = this.#lang === "ru" ? "Все фото" : "All photo";

        const servicesOptions = [
            allOption,
            ...data.map((item) => {
                const option = document.createElement("option");
                option.value = item.id.toString();
                option.textContent = item.name[this.#lang];

                return option;
            })
        ];

        this.#serviceTypeSelect.replaceChildren(...servicesOptions);
    }

    setLang(lang: Language): void {
        this.#lang = lang;

        const backBtn = this.element.querySelector<HTMLButtonElement>(".back-btn span");
        if (backBtn !== null) {
            backBtn.textContent = this.#lang === "ru" ? "Назад" : "Back";
        }

        const nextBtn = this.element.querySelector<HTMLButtonElement>(".gallery__main .swipe-left-btn");
        if (nextBtn !== null) {
            nextBtn.ariaLabel = this.#lang === "ru" ? "Открыть предыдущую фотографию" : "Open the previous photo";
        }

        const prevBtn = this.element.querySelector<HTMLButtonElement>(".gallery__main .swipe-right-btn");
        if (prevBtn !== null) {
            prevBtn.ariaLabel = this.#lang === "ru" ? "Открыть следующую фотографию" : "Open the next photo";
        }

        const swipeLeftBtn = this.element.querySelector<HTMLButtonElement>(".gallery__section-list .swipe-left-btn");
        if (swipeLeftBtn !== null) {
            swipeLeftBtn.ariaLabel = this.#lang === "ru" ? "Пролистать галерею влево" : "Swipe the gallery to the left";
        }

        const swipeRightBtn = this.element.querySelector<HTMLButtonElement>(".gallery__section-list .swipe-right-btn");
        if (swipeRightBtn !== null) {
            swipeRightBtn.ariaLabel = this.#lang === "ru" ? "Пролистать галерею вправо" : "Swipe the gallery to the right";
        }

        this.setServicesData(this.#servicesData);
        
        this.updateView();
    };

    #listClickHandler = (event: Event) => {
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
                left: swipeDist * 2,
                behavior: "smooth"
            });
        } else if (button.classList.contains("photo-btn")) {
            const photoId = button.dataset.id;
            if (photoId === undefined) {
                return;
            }

            this.displayMain(+photoId);
        }
    };

    #mainClickHandler = (event: Event) => {
        if (this.#currentDisplayedMainId === null) {
            return;
        }

        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const button = target.closest<HTMLButtonElement>("button");
        if (button === null) {
            return;
        }

        const currentIndex = this.galleryData.findIndex((item) => item.id === this.#currentDisplayedMainId);
        if (currentIndex === -1) {
            return;
        }

        if (button.classList.contains("swipe-left-btn")) {
            if (currentIndex === 0) {
                return;
            }

            this.displayMain(this.galleryData[currentIndex - 1]!.id);
        } else if (button.classList.contains("swipe-right-btn")) {
            if (currentIndex === this.galleryData.length - 1) {
                return;
            }

            this.displayMain(this.galleryData[currentIndex + 1]!.id);
        }
    };

    #selectChangeHandler = () => {
        const selectValue = this.#serviceTypeSelect.value;
        if (selectValue === "all") {
            this.filterGalleryData();
        } else {
            this.filterGalleryData(+selectValue);
        }
    };
}