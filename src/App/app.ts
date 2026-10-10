import { type LangItem, type Language, isLangItem } from "../languages";

import type { Page, Navigation, DialogShowType, Dialog, ServicesBaseData, Services, GallerySection,
    Gallery, ReviewsSection, Reviews, Detailed, Contacts, ApplicationForm, Api, Notifyer } from "./app-interfaces";

export class App<
    TShowType,
    TDetailedData extends ServicesBaseData,
    TAppFormData extends ServicesBaseData,
    TServicesData extends TDetailedData & TAppFormData
> {
    #page: Page;

    #showTypeMap: DialogShowType<TShowType>;

    #navigation: Navigation;
    #dialog: Dialog<TShowType>;
    #services: Services<TServicesData>;
    #detailed: Detailed<TDetailedData>;

    #gallery: Gallery;
    #gallerySection: GallerySection;

    #reviews: Reviews;
    #reviewsSection: ReviewsSection;

    #contacts: Contacts;

    #appForm: ApplicationForm<TAppFormData>;
    #api: Api;

    #notifyer: Notifyer;

    constructor(page: Page, navigation: Navigation, showTypeMap: DialogShowType<TShowType>, dialog: Dialog<TShowType>, services: Services<TServicesData>, detailed: Detailed<TDetailedData>, gallery: Gallery, reviews: Reviews, contacts: Contacts, appForm: ApplicationForm<TAppFormData>, api: Api, notifyer: Notifyer) {
        // Setup main page
        // ===============
        this.#page = page;

        this.#page.setOnLangChanged(this.#onLangChanged);

        this.#page.setOnSubmitApplication(this.#onSubmitApplication);
        this.#page.setOnShowAllPhoto(this.#onShowAllPhoto);
        this.#page.setOnShowAllReviews(this.#onShowAllReviews);

        const app = document.querySelector<HTMLDivElement>("#app");

        if (app === null) {
            throw new Error("Error: div 'app' not found");
        }

        app.replaceChildren(this.#page.getElement());

        this.#showTypeMap = showTypeMap;
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
        this.#dialog.addSection(navMenuSection, this.#showTypeMap.navigationMenu);

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

        this.#detailed.setOnSubmitApplication(this.#onSubmitApplication);
        this.#detailed.setOnShowAllPhoto(this.#onShowAllPhoto);
        this.#detailed.setOnShowAllReviews(this.#onShowAllReviews);

        dialog.addSection(detailed.getElement(), this.#showTypeMap.detailed);

        // Setup gallery
        // =============
        this.#gallery = gallery;

        this.#page.setGalleryList(this.#gallery.createGalleryListView(this.#onPhotoClicked).getElement());
        this.#detailed.setGalleryList(this.#gallery.createGalleryListView(this.#onPhotoClicked));

        this.#gallerySection = this.#gallery.createGallerySectionView();
        this.#gallerySection.setServicesData(this.#services.servicesData);
        this.#dialog.addSection(this.#gallerySection.getElement(), this.#showTypeMap.gallery);

        // Setup reviews
        // =============
        this.#reviews = reviews;
        this.#reviews.setGetServiceName(this.#getServiceName);

        this.#page.setReviewsGrid(this.#reviews.createReviewsGrid(this.#onReviewClicked).getElement());
        this.#detailed.setReviewsGrid(this.#reviews.createReviewsGrid(this.#onReviewClicked));

        this.#reviewsSection = this.#reviews.createReviewsSection();
        this.#reviewsSection.setServicesData(this.#services.servicesData);
        this.#dialog.addSection(this.#reviewsSection.getElement(), this.#showTypeMap.reviews);

        // Setup contacts
        // ==============
        this.#contacts = contacts;
        this.#contacts.setOnSubmitApplication(this.#onSubmitApplication);
        this.#page.setContactsBlock(this.#contacts.getElement());

        // Setup application form
        // ======================
        this.#appForm = appForm;
        this.#appForm.setServicesData(this.#services.servicesData);
        this.#appForm.setOnSubmit(this.#submitApplicationHandler);

        this.#dialog.addSection(this.#appForm.getElement(), this.#showTypeMap.applicationForm);

        // Setup api
        // =========
        this.#api = api;
        this.#api.addApi("appForm");

        // Setup notifyer
        // ==============
        this.#notifyer = notifyer;
        this.#dialog.addSection(this.#notifyer.getElement(), this.#showTypeMap.notifyer);
    }

    #onLangChanged = (lang: Language) => {
        this.#navigation.setLang(lang);
        this.#services.setLang(lang);
        this.#detailed.setLang(lang);
        this.#gallery.setLang(lang);
        this.#reviews.setLang(lang);
        this.#contacts.setLang(lang);
        this.#appForm.setLang(lang);
    };

    #onSubmitApplication = (serviceId?: number) => {
        if (serviceId !== undefined) {
            this.#appForm.selectService(serviceId);
        }

        this.#page.showDialogSection(this.#appForm.getElement());
    };

    #submitApplicationHandler = async (applicationData: FormData) => {
        this.#appForm.setBlocked(true);

        try {
            const answer = await this.#api.sendRequest({
                source: "appForm",
                data: applicationData
            });

            if (answer === true) {
                this.#notifyer.setNotifyData({
                    text: {
                        ru: "Заявка успешно оформлена. Ждём Вас!",
                        en: "Your application has been successfully submitted. We look forward to seeing you!"
                    },
                    icon: "check"
                });
                this.#page.showDialogSection(this.#notifyer.getElement());

                this.#appForm.clearData();
            } else {
                throw new Error("Unknown application submit error.");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error: ${error.message}`);
            } else if (Array.isArray(error)) {
                function isFieldErrors(value: unknown[]): value is { name: string; errorMessage: LangItem }[] {
                    return value.every((item) => {
                        const isFieldError =
                            typeof item === "object" &&
                            item !== null &&
                            "name" in item &&
                            typeof item.name === "string" &&
                            "errorMessage" in item &&
                            isLangItem(item.errorMessage);

                        return isFieldError;
                    });
                }

                if (isFieldErrors(error)) {
                    this.#appForm.displayFieldErrors(error);
                } else {
                    throw new Error("Something gone wrong.");
                }
            } else if (
                typeof error === "object" &&
                error !== null &&
                "errorMessage" in error &&
                isLangItem(error.errorMessage))
            {
                this.#appForm.displayGlobalError(error.errorMessage);
            } else {
                throw new Error("Something gone wrong.");
            }
        } finally {
            this.#appForm.setBlocked(false);
        }
    };

    #onShowAllPhoto = (serviceId?: number) => {
        if (serviceId !== undefined) {
            this.#gallerySection.filterGalleryData(serviceId);
        }

        this.#page.showDialogSection(this.#gallerySection.getElement());
    };

    #onShowAllReviews = (serviceId?: number) => {
        if (serviceId !== undefined) {
            this.#reviewsSection.filterGalleryData(serviceId);
        }

        this.#page.showDialogSection(this.#reviewsSection.getElement());
    }

    #onPhotoClicked = (photoId: number, serviceId?: number) => {
        this.#gallerySection.displayMain(photoId, serviceId);
        this.#page.showDialogSection(this.#gallerySection.getElement());
    };

    #getServiceName = (serviceId: number) => {
        return this.#services.getServiceName(serviceId)
            ?? {
                "ru": "Неизвестная услуга",
                "en": "Unknown serivce"
            };
    };

    #onReviewClicked = (reviewId: number, serviceId?: number) => {
        this.#reviewsSection.displayReview(reviewId, serviceId);
        this.#page.showDialogSection(this.#reviewsSection.getElement());
    };
}