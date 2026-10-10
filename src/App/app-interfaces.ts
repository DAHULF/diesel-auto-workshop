import { type Language, type LangItem } from "../languages";

export interface Page {
    getElement(): HTMLDivElement;
    setLang(lang: Language): void;
    setOnLangChanged(hook: (lang: Language) => void): void;
    getSections(): HTMLElement[];
    scrollToSection: (section: HTMLElement) => void;
    showDialogSection(section: HTMLElement): void

    setHeaderNavigation(nav: HTMLElement): void;
    setMenuSection(nav: HTMLElement): void;
    setFooterNavigation(nav: HTMLElement): void;

    setServicesGrid(services: HTMLElement): void;
    setGalleryList(gallery: HTMLElement): void;
    setReviewsGrid(reviews: HTMLElement): void;
    setContactsBlock(contactsBlock: HTMLElement): void;

    setOnSubmitApplication(hook: () => void): void;
    setOnShowAllPhoto(hook: () => void): void;
    setOnShowAllReviews(hook: () => void): void;
}

export interface Navigation {
    setSections(sections: HTMLElement[]): void;
    createNavigation(): HTMLElement;
    setLang(lang: Language): void;
    setOnElementSelected(callback: (element: HTMLElement) => void): void;
}

export type DialogShowType<TShowType> = {
    navigationMenu: TShowType;
    detailed: TShowType;
    gallery: TShowType;
    reviews: TShowType;
    applicationForm: TShowType;
    notifyer: TShowType;
};

export interface Dialog<TShowType> {
    addSection(section: HTMLElement, showType: TShowType): void;
}

export interface ServicesBaseData {
    id: number;
    name: LangItem;
}

export interface Services<TServicesData> {
    setLang(lang: Language): void;
    getElement(): HTMLElement;
    setOnServiceSelected(callback: (serviceId: number) => void): void;
    getServiceData(id: number): TServicesData | undefined;
    getServiceName(id: number): LangItem | undefined;
    servicesData: TServicesData[];
}

export interface GalleryList {
    getElement: () => HTMLElement;
    filterGalleryData(serviceId?: number): void;
}

export interface GallerySection extends GalleryList {
    displayMain(photoId: number, serviceId?: number): void;
    setServicesData(data: { id: number, name: LangItem }[]): void
}

export interface Gallery {
    createGalleryListView(onPhotoClicked: (photoId: number, serviceId?: number) => void): GalleryList;
    createGallerySectionView(): GallerySection;
    setLang(lang: Language): void;
}

export interface ReviewsGrid {
    getElement(): HTMLElement;
    filterGalleryData(serviceId?: number): void;
    displayReview(reviewId: number, serviceId?: number): void
}

export interface ReviewsSection extends ReviewsGrid {
    setServicesData(data: { id: number, name: LangItem }[]): void
}

export interface Reviews {
    setGetServiceName(getServiceName: (serviceId: number) => LangItem): void;
    createReviewsGrid(onReviewClicked: (reviewId: number, serviceId?: number) => void): ReviewsGrid;
    createReviewsSection(): ReviewsSection;
    setLang(lang: Language): void;
}

export interface Detailed<TDetailedData> {
    getElement(): HTMLElement;
    setLang(lang: Language): void;
    setServiceData(data: TDetailedData): void;
    setGalleryList(gallery: GalleryList): void;
    setReviewsGrid(reviews: ReviewsGrid): void;

    setOnSubmitApplication(hook: (serviceId: number) => void): void;
    setOnShowAllPhoto(hook: (serviceId: number) => void): void;
    setOnShowAllReviews(hook: (serviceId: number) => void): void;
}

export interface Contacts {
    getElement(): HTMLElement;
    setLang(lang: Language): void;
    setOnSubmitApplication(hook: () => void): void
}

export interface ApplicationForm<TAppFormData> {
    getElement(): HTMLElement;
    setLang(lang: Language): void;
    setServicesData(servicesData: TAppFormData[]): void;
    selectService(sergviceId: number): void;
    setBlocked(block: boolean): void;
    setOnSubmit(hook: (applicationData: FormData) => void): void;

    displayFieldErrors(errorsData: { name: string, errorMessage: LangItem }[]): void;
    displayGlobalError(errorMessage: LangItem): void;
    clearData(): void;
}

export interface Api {
    addApi(source: string): void;
    sendRequest(request: { source: string, data?: unknown }): Promise<unknown>;
}

export interface Notifyer {
    getElement(): HTMLElement;
    setLang(lang: Language): void;
    setNotifyData(data: { text: LangItem, icon: string }): void
}