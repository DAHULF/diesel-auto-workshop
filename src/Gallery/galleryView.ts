import type { Language } from "../languages";
import { type GalleryItem, type GetGalleryDataHook } from "./galleryTypes";


export abstract class GalleryView {
    protected element: HTMLElement;

    protected galleryData: GalleryItem[] = [];
    protected getGalleryData: GetGalleryDataHook;

    protected currentServiceId: number | null = null;

    constructor(element: HTMLElement, getGalleryData: GetGalleryDataHook) {
        this.element = element;
        this.getGalleryData = getGalleryData;
    }

    filterGalleryData(serviceId?: number): void {
        this.currentServiceId = serviceId ?? null;
        this.updateGalleryData();
    }

    getElement(): HTMLElement {
        return this.element;
    }

    abstract updateView(): void;

    abstract setLang(lang: Language): void;

    protected updateGalleryData(): void {
        this.galleryData = this.getGalleryData(this.currentServiceId ?? undefined);
        this.updateView();
    }
}