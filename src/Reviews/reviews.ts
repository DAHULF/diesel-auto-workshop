import "./reviews.css";

import { type Language } from "../languages";
import { type ReviewItem, type GetReviewsDataHook, type ReviewsView, type OnReviewClickedHook, type GetServiceNameHook } from "./reviewsTypes";

import reviewsData from "./reviews-data.json";

import { ReviewsGridView } from "./reviewsGridView";
import { ReviewsSectionView } from "./reviewsSectionView";

export class Reviews {
    #reviewsData: ReviewItem[] = reviewsData.map((item) => ({ ...item, date: new Date(item.date) }));
    #views: ReviewsView[] = [];

    #getServiceName: GetServiceNameHook | null = null;

    setGetServiceName(getServiceName: GetServiceNameHook): void {
        this.#getServiceName = getServiceName;
    }

    createReviewsGrid(onReviewClicked: OnReviewClickedHook): ReviewsGridView {
        if (this.#getServiceName === null) {
            throw new Error(`Error: Set "getServiceName()" hook first.`);
        }

        const view = new ReviewsGridView(this.#getReviewsData, this.#getServiceName);
        view.setOnReviewClicked(onReviewClicked);
        view.getElement().classList.add("page__reviews-grid");
        this.#views.push(view);
        return view;
    }

    createReviewsSection(): ReviewsSectionView {
        if (this.#getServiceName === null) {
            throw new Error(`Error: Set "getServiceName()" hook first.`);
        }

        const view = new ReviewsSectionView(this.#getReviewsData, this.#getServiceName);
        view.maxReviews = "any";
        this.#views.push(view);
        return view;
    }

    setLang(lang: Language): void {
        this.#views.forEach((view) => view.setLang(lang));
    }

    #getReviewsData: GetReviewsDataHook = (serviceId) => {
        if (serviceId === undefined) {
            return this.#reviewsData;
        }

        return this.#reviewsData.filter((item) => item.serviceId === serviceId);
    }
}