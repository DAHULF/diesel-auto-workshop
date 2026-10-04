import { type LangItem } from "../languages";

export type GalleryItem = {
    id: number;
    imageSrc: string;
    serviceId: number;
    title?: LangItem;
};

export type GetGalleryDataHook = (serviceId?: number) => GalleryItem[];

export type OnPhotoClickedHook = (photoId: number, serviceId?: number) => void;