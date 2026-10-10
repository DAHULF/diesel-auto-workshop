import { type Language } from "../languages";
import { renderIcons } from "../icons";

import { type GetReviewsDataHook, type OnReviewClickedHook, type GetServiceNameHook, type ReviewItem, type ReviewsView } from "./reviewsTypes";

type ReviewsElement = "button" | "div";

export class ReviewsGridView implements ReviewsView {
    #element: HTMLElement;

    #reviewsData: ReviewItem[] = [];
    #getReviewsData: GetReviewsDataHook;
    #reviewsElement: ReviewsElement;

    #currentServiceId: number | null = null;

    #maxReviews: number | "any" = 4;

    #getServiceName: GetServiceNameHook;
    #onReviewClicked: OnReviewClickedHook | null = null;

    #lang: Language = "ru";

    constructor(getReviewsData: GetReviewsDataHook, getServiceName: GetServiceNameHook, reviewsElement: ReviewsElement = "button") {
        const element = document.createElement("div");
        element.classList.add("reviews-grid");
        this.#element = element;

        this.#getReviewsData = getReviewsData;

        this.#getServiceName = getServiceName;

        this.#reviewsElement = reviewsElement;

        this.#updateReviewsData();
    }

    getElement(): HTMLElement {
        return this.#element;
    }

    filterGalleryData(serviceId?: number): void {
        this.#currentServiceId = serviceId ?? null;
        this.#updateReviewsData();
    }

    updateView(): void {
        if (this.#reviewsData.length === 0) {
            const emptyParagraph = document.createElement("p");
            emptyParagraph.classList.add("reviews-grid__empty");
            emptyParagraph.role = "status";
            emptyParagraph.textContent =
                this.#lang === "ru" ? "Отзывы отсутствуют" : "No reviews available";

            this.#element.replaceChildren(emptyParagraph);
        } else {
            let reviewsData = this.#reviewsData;
            if (this.#maxReviews !== "any") {
                reviewsData = reviewsData.slice(0, this.#maxReviews);
            }

            const reviewsButtons = reviewsData.map((item) => {
                const reviewBtn = document.createElement(this.#reviewsElement);
                if (reviewBtn instanceof HTMLButtonElement) {
                    reviewBtn.type = "button";
                }
                reviewBtn.dataset.id = item.id.toString();
                reviewBtn.classList.add("review-card");

                const username = document.createElement("h4");
                username.classList.add("review__name");
                username.textContent = item.username;
                reviewBtn.append(username);

                const reviewRating = document.createElement("div");
                reviewRating.classList.add("review__rating");

                item.rating = Math.max(item.rating, 1);
                for(let i = 0, j = item.rating; i < 5; i++, j--) {
                    const star = document.createElement("i");
                    star.dataset.lucide = "star";
                    star.classList.add("review__star");
                    star.classList.toggle("review__star--filled", j > 0);
                    reviewRating.append(star);
                }

                reviewBtn.append(reviewRating);

                const reviewMetadata = document.createElement("p");
                reviewMetadata.classList.add("review__metadata");

                const metadataService = document.createElement("span");
                metadataService.classList.add("metadata__service");
                metadataService.textContent = this.#getServiceName(item.serviceId)[this.#lang];
                reviewMetadata.append(metadataService);

                const metadataDate = document.createElement("span");
                metadataDate.classList.add("metadata__date");
                metadataDate.textContent = item.date.toLocaleDateString(
                    this.#lang === "ru" ? "ru-RU" : "en-US",
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }
                );
                reviewMetadata.appendChild(metadataDate);

                reviewBtn.append(reviewMetadata);

                const reviewText = document.createElement("p");
                reviewText.classList.add("review__text");
                reviewText.textContent = item.review;
                reviewBtn.appendChild(reviewText);

                return reviewBtn;
            });

            this.#element.replaceChildren(...reviewsButtons);
            this.#element.scrollTo({ top: 0 });
            renderIcons();
        }
    }

    set maxReviews(maxReviews: number | "any") {
        this.#maxReviews = maxReviews;
        this.updateView();
    }

    setLang(lang: Language): void {
        this.#lang = lang;
        this.updateView();
    }

    setOnReviewClicked(callback: OnReviewClickedHook): void {
        if (this.#onReviewClicked === null) {
            this.#element.addEventListener("click", this.#clickHandler);
        }

        this.#onReviewClicked = callback;
    }

    displayReview(reviewId: number, serviceId?: number): void {
        this.filterGalleryData(serviceId);

        if (this.#reviewsData.length === 0) {
            return;
        }

        const review = [...this.#element.querySelectorAll<HTMLElement>(".review-card")].find((child) => {
            const id = child.dataset.id;
            if (id === undefined) {
                return false;
            }

            return +id === reviewId;
        });

        if (review === undefined) {
            return;
        }

        review.classList.add("review-card--displaying");

        review.addEventListener("animationstart", () => {
            review.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        });

        review.addEventListener("animationend", () => {
            review.classList.remove("review-card--displaying");
        });
    }

    #updateReviewsData(): void {
        this.#reviewsData = this.#getReviewsData(this.#currentServiceId ?? undefined);
        this.updateView();
    }

    #clickHandler = (event: Event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const reviewBtn = target.closest<HTMLButtonElement>(".review-card");
        if (reviewBtn === null) {
            return;
        }

        const reviewId = reviewBtn.dataset.id;
        if (reviewId === undefined) {
            return;
        }

        this.#onReviewClicked?.(+reviewId, this.#currentServiceId ?? undefined);
    };
}