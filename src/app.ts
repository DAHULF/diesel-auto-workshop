import { type Language, type LangItem } from "./languages";

interface PageInterface {
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
}

interface Navigation {
    setSections(sections: HTMLElement[]): void;
    createNavigation(): HTMLElement;
    setLang(lang: Language): void;
    setOnElementSelected(callback: (element: HTMLElement) => void): void;
}

interface Dialog {
    addSection(section: HTMLElement, showType: string): void;
}

interface Services<TServicesData> {
    setLang(lang: Language): void;
    getElement(): HTMLElement;
    setOnServiceSelected(callback: (serviceId: number) => void): void;
    getServiceData(id: number): TServicesData | undefined;
    servicesData: { id: number, name: LangItem }[];
}

interface GalleryList {
    getElement: () => HTMLElement;
    filterGalleryData(serviceId?: number): void;
}

interface GallerySection extends GalleryList {
    displayMain(photoId: number, serviceId?: number): void;
    setServicesData(data: { id: number, name: LangItem }[]): void
}

interface Gallery {
    createGalleryListView(onPhotoClicked: (photoId: number, serviceId?: number) => void): GalleryList;
    createGallerySectionView(): GallerySection;
    setLang(lang: Language): void;
}

interface ReviewsGrid {
    getElement(): HTMLElement;
    filterGalleryData(serviceId?: number): void;
    displayReview(reviewId: number, serviceId?: number): void
}

interface ReviewsSection extends ReviewsGrid {
    setServicesData(data: { id: number, name: LangItem }[]): void
}

interface Reviews {
    setGetServiceName(getServiceName: (serviceId: number) => LangItem): void;
    createReviewsGrid(onReviewClicked: (reviewId: number, serviceId?: number) => void): ReviewsGrid;
    createReviewsSection(): ReviewsSection;
    setLang(lang: Language): void;
}

interface Detailed<TDetailedData> {
    getElement(): HTMLElement;
    setLang(lang: Language): void;
    setServiceData(data: TDetailedData): void;
    setGalleryList(gallery: GalleryList): void;
    setReviewsGrid(reviews: ReviewsGrid): void
}

interface Contacts {
    getElement(): HTMLElement;
    setLang(lang: Language): void;
}

export class App<TDetailedData, TServicesData extends TDetailedData & { name: LangItem }> {
    #page: PageInterface;
    
    #navigation: Navigation;
    #dialog: Dialog;
    #services: Services<TServicesData>;
    #detailed: Detailed<TDetailedData>;

    #gallery: Gallery;
    #gallerySection: GallerySection;

    #reviews: Reviews;
    #reviewsSection: ReviewsSection;

    #contacts: Contacts;

    constructor(page: PageInterface, navigation: Navigation, dialog: Dialog, services: Services<TServicesData>, detailed: Detailed<TDetailedData>, gallery: Gallery, reviews: Reviews, contacts: Contacts) {
        // Setup main page
        // ===============
        this.#page = page;

        this.#page.setOnLangChanged(this.#onLangChanged);

        const app = document.querySelector<HTMLDivElement>("#app");

        if (app === null) {
            throw new Error("Error: div 'app' not found");
        }

        app.replaceChildren(this.#page.getElement());

        this.#dialog = dialog;

        // Setup page navigation
        // =====================
        this.#navigation = navigation;

        this.#navigation.setSections(this.#page.getSections());
        this.#navigation.setOnElementSelected(this.#page.scrollToSection);

        const navMenuSection = document.createElement("section");
        navMenuSection.classList.add("menu-section");
        
        navMenuSection.innerHTML = `<button type="button" class="back-btn">
            <i data-lucide="chevron-right"></i>
        </button>`;
        
        const menuNav = this.#navigation.createNavigation();
        menuNav.classList.add("navigation__menu");
        
        navMenuSection.appendChild(menuNav);
        this.#dialog.addSection(navMenuSection, "slideFromRight");

        this.#page.setHeaderNavigation(this.#navigation.createNavigation());
        this.#page.setMenuSection(navMenuSection);
        this.#page.setFooterNavigation(this.#navigation.createNavigation());

        // Setup services grid and detailed information
        // ============================================
        this.#services = services;
        this.#detailed = detailed;

        this.#page.setServicesGrid(this.#services.getElement());

        this.#services.setOnServiceSelected((serviceId: number): void => {
            const detailedData = this.#services.getServiceData(serviceId);
            if (detailedData === undefined) {
                return;
            }

            this.#detailed.setServiceData(detailedData);
            this.#page.showDialogSection(this.#detailed.getElement());
        });

        dialog.addSection(detailed.getElement(), "slideFromBottom");

        // Setup gallery
        // =============
        this.#gallery = gallery;

        this.#page.setGalleryList(this.#gallery.createGalleryListView(this.#onPhotoClicked).getElement());
        this.#detailed.setGalleryList(this.#gallery.createGalleryListView(this.#onPhotoClicked));

        this.#gallerySection = this.#gallery.createGallerySectionView();
        this.#gallerySection.setServicesData(this.#services.servicesData);
        this.#dialog.addSection(this.#gallerySection.getElement(), "scaling");

        // Setup reviews
        // =============
        this.#reviews = reviews;
        this.#reviews.setGetServiceName(this.#getServiceName);

        this.#page.setReviewsGrid(this.#reviews.createReviewsGrid(this.#onReviewClicked).getElement());
        this.#detailed.setReviewsGrid(this.#reviews.createReviewsGrid(this.#onReviewClicked));

        this.#reviewsSection = this.#reviews.createReviewsSection();
        this.#reviewsSection.setServicesData(this.#services.servicesData);
        this.#dialog.addSection(this.#reviewsSection.getElement(), "slideFromBottom");

        // Setup contacts
        // ==============
        this.#contacts = contacts;
        this.#page.setContactsBlock(this.#contacts.getElement());
    }

    #onLangChanged = (lang: Language) => {
        this.#navigation.setLang(lang);
        this.#services.setLang(lang);
        this.#detailed.setLang(lang);
        this.#gallery.setLang(lang);
        this.#reviews.setLang(lang);
        this.#contacts.setLang(lang);
    };

    #onPhotoClicked = (photoId: number, serviceId?: number) => {
        this.#gallerySection.displayMain(photoId, serviceId);
        this.#page.showDialogSection(this.#gallerySection.getElement());
    }

    #getServiceName = (serviceId: number) => {
        return this.#services.getServiceData(serviceId)?.name 
            ?? {
                "ru": "Неизвестная услуга",
                "en": "Unknown serivce"
            };
    }

    #onReviewClicked = (reviewId: number, serviceId?: number) => {
        this.#reviewsSection.displayReview(reviewId, serviceId);
        this.#page.showDialogSection(this.#reviewsSection.getElement());
    }
}