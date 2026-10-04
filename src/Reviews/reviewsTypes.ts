import { type LangItem, type Language } from "../languages";

export type ReviewItem = {
    id: number;
    username: string;
    rating: number;
    serviceId: number;
    date: Date;
    review: string;
};

export type GetReviewsDataHook = (serviceId?: number) => ReviewItem[];

export type GetServiceNameHook = (serviceId: number) => LangItem;

export type OnReviewClickedHook = (reviewId: number, serviceId?: number) => void;

export interface ReviewsView {
    getElement(): HTMLElement;
    filterGalleryData(serviceId?: number): void;
    setLang(lang: Language): void;
}