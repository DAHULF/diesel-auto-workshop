import { type Language, type LangItem } from "../languages";
import { type GetReviewsDataHook, type GetServiceNameHook } from "./reviewsTypes";
import { type ReviewsView } from "./reviewsTypes";

import { ReviewsGridView } from "./reviewsGridView";

type ServicesData = {
    id: number;
    name: LangItem;
}

export class ReviewsSectionView implements ReviewsView {
    #element: HTMLElement;
    #reviewsGrid: ReviewsGridView;

    #serviceTypeSelect: HTMLSelectElement;
    #servicesData: ServicesData[] = [];

    #lang: Language = "ru";

    constructor(getReviewsData: GetReviewsDataHook, getServiceName: GetServiceNameHook) {
        const element = document.createElement("section");
        element.classList.add("dialog__section-reviews");
        element.innerHTML = `
            <div class="reviews__manage">
                <button type="button" class="back-btn">
                    <span>Назад</span>
                </button>

                <select class="reviews__select-service" name="serviceType"></select>
            </div>
        `;
        this.#element = element;

        this.#reviewsGrid = new ReviewsGridView(getReviewsData, getServiceName, "div");
        this.#reviewsGrid.getElement().classList.add("dialog__reviews-grid", "scrollable");
        this.#element.appendChild(this.#reviewsGrid.getElement());

        const serviceSelect = element.querySelector<HTMLSelectElement>(".reviews__select-service");
        if (serviceSelect === null) {
            throw new Error("Error: Service type select not found.");
        }
        this.#serviceTypeSelect = serviceSelect;
        this.#serviceTypeSelect.addEventListener("change", this.#selectChangeHandler);

        this.setServicesData(this.#servicesData);
    }

    set maxReviews(maxReviews: number | "any") {
        this.#reviewsGrid.maxReviews = maxReviews;
    }

    getElement(): HTMLElement {
        return this.#element;
    }

    filterGalleryData(serviceId?: number): void {
        this.#serviceTypeSelect.value = serviceId?.toString() ?? "all";
        this.#reviewsGrid.filterGalleryData(serviceId);
    }

    setLang(lang: Language): void {
        this.#lang = lang;

        const backBtn = this.#element.querySelector<HTMLButtonElement>(".back-btn span");
        if (backBtn !== null) {
            backBtn.textContent = this.#lang === "ru" ? "Назад" : "Back";
        }

        this.setServicesData(this.#servicesData);

        this.#reviewsGrid.setLang(this.#lang);

        const submitReviewBtn = this.#element.querySelector<HTMLButtonElement>(".reviews-section__submit-review-btn");
        if (submitReviewBtn !== null) {
            submitReviewBtn.textContent = this.#lang === "ru"
                ? "Оставить отзыв"
                : "Submit review";
        }
    }

    setServicesData(data: ServicesData[]): void {
        this.#servicesData = data;

        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.selected = true;
        allOption.textContent = this.#lang === "ru" ? "Все отзывы" : "All reviews";

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

    displayReview(reviewId: number, serviceId?: number): void {
        this.#serviceTypeSelect.value = serviceId?.toString() ?? "all";
        this.#reviewsGrid.displayReview(reviewId, serviceId);
    }

    #selectChangeHandler = () => {
        const selectValue = this.#serviceTypeSelect.value;
        if (selectValue === "all") {
            this.filterGalleryData();
        } else {
            this.filterGalleryData(+selectValue);
        }
    };
}