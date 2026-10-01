import "./gallery.css";

import { type Language } from "../languages";
import { type GalleryItem, type GetGalleryDataHook, type OnPhotoClickedHook } from "./galleryTypes";

import galleryData from "./gallery-data.json";

import { GalleryView } from "./galleryView";
import { GalleryListView } from "./galleryListView";
import { GallerySectionView } from "./gallerySectionView";

export class Gallery {
    #galleryData: GalleryItem[] = galleryData;
    #views: GalleryView[] = [];

    createGalleryListView(onPhotoClicked: OnPhotoClickedHook): GalleryView {
        const view = new GalleryListView(this.#getGalleryData, onPhotoClicked);
        this.#views.push(view);
        return view;
    }

    createGallerySectionView(): GallerySectionView {
        const view = new GallerySectionView(this.#getGalleryData);
        this.#views.push(view);
        return view;
    }

    setLang(lang: Language): void {
        this.#views.forEach((view) => view.setLang(lang));
    }

    #getGalleryData: GetGalleryDataHook = (serviceId) => {
        if (serviceId === undefined) {
            return this.#galleryData;
        }

        return this.#galleryData.filter((item) => item.serviceId === serviceId);
    };
}