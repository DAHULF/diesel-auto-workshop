import "./detailed.css";
import textContentMap from "./text-content-map.json";

import { type Language, type LangItem, type TextContentItem, translate } from "../languages";

type ServiceData = {
    id: number;
    name: LangItem;
    priceFrom: LangItem;
    icon: string;
    background: string;
    detailedInfo: LangItem;
    detailedPrice: LangItem;
};

interface GalleryList {
    getElement: () => HTMLElement;
    filterGalleryData(serviceId?: number): void;
}

interface ReviewsGrid {
    getElement: () => HTMLElement;
    filterGalleryData(serviceId?: number): void;
}

type ButtonClickCallback = (serviceId: number) => void;

export class Detailed {
    #textContentMap: TextContentItem[];
    #element: HTMLElement;

    #galleryList: GalleryList | null = null;
    #reviewsGrid: ReviewsGrid | null = null;

    #lang: Language = "ru";

    #currentServiceId = -1;

    #onSubmitApplication: ButtonClickCallback | null = null;
    #onShowAllPhoto: ButtonClickCallback | null = null;
    #onShowAllReviews: ButtonClickCallback | null = null;

    constructor() {
        this.#textContentMap = textContentMap;

        this.#element = document.createElement("section");
        this.#element.classList.add("dialog__section-detailed");

        this.#element.innerHTML = `
            <div class="detailed-inner scrollable">
                <div class="detailed__main-info">
                    <div class="main-info__background"></div>

                    <div class="main-info__foreground">
                        <div class="foreground__inner">
                            <button type="button" class="back-btn">
                                <span>Назад</span>
                            </button>

                            <img class="main-info__icon" />

                            <div class="main-info__content">
                                <h2 class="service-title"></h2>
                                <p class="service-info"></p>
                                <p class="service-price"></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="detailed__gallery">
                    <h2 class="section-title gallery__title">Галерея работ</h2>

                    <!-- Place for gallery list -->

                    <button type="button" class="more-btn all-photo-btn">
                        <span>Все фотографии</span>
                    </button>
                </div>

                <div class="detailed__reviews">
                    <h2 class="section-title reviews__title">Отзывы</h2>

                    <!-- Place for reviews grid -->

                    <button type="button" class="more-btn all-reviews-btn">
                        <span>Все отзывы</span>
                    </button>
                </div>

                <button type="button" class="primary-btn submit-app-btn">
                    <span>Оставить заявку</span>
                </button>
            </div>
        `;

        this.#initButtons();
    }

    getElement(): HTMLElement {
        return this.#element;
    }

    setLang(lang: Language): void {
        this.#lang = lang;
        translate(this.#element, this.#textContentMap, this.#lang);
    }

    setOnSubmitApplication(hook: ButtonClickCallback): void {
        this.#onSubmitApplication = hook;
    }

    setOnShowAllPhoto(hook: ButtonClickCallback): void {
        this.#onShowAllPhoto = hook;
    }

    setOnShowAllReviews(hook: ButtonClickCallback): void {
        this.#onShowAllReviews = hook;
    }

    setServiceData(data: ServiceData): void {
        const background = this.#element.querySelector<HTMLDivElement>(".main-info__background");
        if (background === null) {
            throw new Error("Error: Detailed background div not found.");
        }

        background.style.setProperty(
            "--service-background",
            `url("${import.meta.env.BASE_URL}${data.background}")`
        );

        const icon = this.#element.querySelector<HTMLImageElement>(".main-info__icon");
        if (icon === null) {
            throw new Error("Error: Service icon not found.");
        }

        icon.src = data.icon;
        icon.alt = data.name[this.#lang];

        const title = this.#element.querySelector<HTMLHeadingElement>(".service-title");
        if (title === null) {
            throw new Error("Error: Service title not found.");
        }

        title.textContent = data.name[this.#lang];

        const info = this.#element.querySelector<HTMLParagraphElement>(".service-info");
        if (info === null) {
            throw new Error("Error: Service info paragraph not found.");
        }

        info.textContent = data.detailedInfo[this.#lang];

        const price = this.#element.querySelector<HTMLParagraphElement>(".service-price");
        if (price === null) {
            throw new Error("Error: Service price paragraph not found.");
        }

        price.textContent = `${data.priceFrom[this.#lang]} - ${data.detailedPrice[this.#lang]}`;

        if (this.#galleryList !== null) {
            this.#galleryList.filterGalleryData(data.id);
        }

        if (this.#reviewsGrid !== null) {
            this.#reviewsGrid.filterGalleryData(data.id);
        }

        this.#currentServiceId = data.id;
    }

    setGalleryList(gallery: GalleryList): void {
        const gallerySection = this.#element.querySelector<HTMLElement>(".detailed__gallery");
        if (gallerySection === null) {
            throw new Error("Error: Detailed gallery list section not found.");
        }

        if (this.#galleryList !== null) {
            gallerySection.replaceChild(gallery.getElement(), this.#galleryList.getElement());
        } else {
            const allPhotoBtn = this.#element.querySelector<HTMLButtonElement>(".all-photo-btn");
            if (allPhotoBtn === null) {
                throw new Error("Error: Show all photo button in detailed not found.");
            }

            gallerySection.insertBefore(gallery.getElement(), allPhotoBtn);
        }

        this.#galleryList = gallery;
    }

    setReviewsGrid(reviews: ReviewsGrid): void {
        const reviewsSection = this.#element.querySelector<HTMLElement>(".detailed__reviews");
        if (reviewsSection === null) {
            throw new Error("Error: Reviews grid section not found.");
        }

        if (this.#reviewsGrid !== null) {
            reviewsSection.replaceChild(reviews.getElement(), this.#reviewsGrid.getElement());
        } else {
            const allReviewsBtn = this.#element.querySelector<HTMLElement>(".all-reviews-btn");
            if (allReviewsBtn === null) {
                throw new Error("Error: Show all reviews button not found.");
            }

            reviewsSection.insertBefore(reviews.getElement(), allReviewsBtn);
        }

        this.#reviewsGrid = reviews;
    }

    #initButtons(): void {
        const submitAppBtn = this.#element.querySelector<HTMLButtonElement>(".submit-app-btn");
        if (submitAppBtn === null) {
            throw new Error("Error: Main section submit app button not found.");
        }

        submitAppBtn.addEventListener("click", () => {
            if (this.#onSubmitApplication === null) {
                throw new Error(`Error: set "onSubmitApplication()" hook first.`);
            }

            this.#onSubmitApplication?.(this.#currentServiceId);
         });

        const allPhotoBtn = this.#element.querySelector<HTMLButtonElement>(".all-photo-btn");
        if (allPhotoBtn === null) {
            throw new Error("Error: Show all photo button not found.");
        }

        allPhotoBtn.addEventListener("click", () => {
            if (this.#onSubmitApplication === null) {
                throw new Error(`Error: set "onShowAllPhoto()" hook first.`);
            }

            this.#onShowAllPhoto?.(this.#currentServiceId);
        });

        const allReviewsBtn = this.#element.querySelector<HTMLButtonElement>(".all-reviews-btn");
        if (allReviewsBtn === null) {
            throw new Error("Error: All reviews button not found.");
        }

        allReviewsBtn.addEventListener("click", () => {
            if (this.#onSubmitApplication === null) {
                throw new Error(`Error: set "onShowAllReviews()" hook first.`);
            }

            this.#onShowAllReviews?.(this.#currentServiceId);
        });
    }
}