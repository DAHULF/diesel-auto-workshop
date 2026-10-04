import { type Language, isLanguage, type TextContentItem, translate } from "../languages";

import "./page.css";
import textContentMap from "./text-content-map.json";

declare const lucide: {
  createIcons: () => void;
}

interface Dialog {
    getElement(): HTMLDialogElement;
    showSection(section: HTMLElement, onShown?: () => void): void;
    close(): void;
    isOpen(): boolean;
}

type OnLangChangedHook = (lang: Language) => void;

export class Page {
    #textContentMap: TextContentItem[];
    #element: HTMLDivElement;

    #headerNav: HTMLElement | null = null;
    #menuNavSection: HTMLElement | null = null;
    #footerNav: HTMLElement | null = null;

    #servicesGrid: HTMLElement | null = null;
    #galleryList: HTMLElement | null = null;
    #reviewsGrid: HTMLElement | null = null;
    #contactsBlock: HTMLElement | null = null;

    #dialog: Dialog;

    #header: HTMLDivElement;
    #menuBtn: HTMLButtonElement;
    #languageSwitch: HTMLInputElement;

    #onLangChanged: OnLangChangedHook | null = null;

    #COMPACT_HEADER_DIST = 20;

    constructor(dialog: Dialog) {
        this.#textContentMap = textContentMap;

        const divElement = document.createElement("div");
        divElement.classList.add("page");
        divElement.innerHTML = `
            <header id="page__header" class="page__header">
                <div class="header__title-container">
                    <img src="logo.png" alt="Логотип автомастерской" class="header__logo" />
                    <h1 class="header__title">ДИЗЕЛЬ</h1>
                </div>

                <div class="header__manage-container">
                    <div class="navigation-block">
                        <button type="button" class="navigation__menu-btn" aria-label="Открыть навигационное меню">
                            <i data-lucide="menu" class="navigation__menu-icon"></i>
                        </button>

                        <!-- Place for header navigation -->
                    </div>

                    <label class="header__lang-switch" aria-label="Переключить язык интерфейса">
                        <input type="checkbox" id="lang-checkbox" name="isEnglishLang" class="lang-checkbox">

                        <span class="switch-track">
                            <span class="switch-thumb"></span>

                            <span class="lang-item ru-lang-item">
                                RU
                            </span>

                            <span class="lang-item en-lang-item">
                                EN
                            </span>
                        </span>
                    </label>
                </div>
            </header>

            <section id="page__main-section" class="page__main-section">
                <div class="main-section__background"></div>

                <div class="main-section__foreground">
                    <div class="foreground__content">
                        <p class="eyebrow-paragraph">Автомастерская · Елец</p>

                        <h2 class="main-section__title">Покраска и ремонт автомобилей</h2>

                        <p class="main-section__description">
                            Осмотрим автомобиль, оценим объём работ и согласуем стоимость услуг.
                        </p>

                        <div class="main-section__manage-block">
                            <button type="button" class="primary-btn submit-app-btn"><span>Оставить заявку</span></button>
                            <button type="button" class="secondary-btn contacts-btn"><span>Все способы связи</span></button>
                        </div>
                    </div>

                    <div class="foreground__image"></div>
                </div>
            </section>

            <section id="page__services" class="page__section page__services">
                <h2 class="section-title services__title">Услуги</h2>

                <!-- Place for services container -->
            </section>

            <section id="page__gallery" class="page__section page__gallery">
                <h2 class="section-title gallery__title">Галерея работ</h2>

                <!-- Place for gallery list -->

                <button type="button" class="more-btn all-photo-btn">
                    <span>Все фотографии</span>
                </button>
            </section>

            <section id="page__reviews" class="page__reviews page__section">
                <h2 class="section-title reviews__title">Отзывы</h2>

                <!-- Place for reviews grid -->

                <button type="button" class="more-btn all-reviews-btn">
                    <span>Все отзывы</span>
                </button>
            </section>

            <section id="page__contacts" class="page__contacts page__section">
                <h2 class="section-title contacts__title">Как с нами связаться</h2>

                <!-- Place for contacts container -->
            </section>

            <footer id="page__footer" class="page__footer page__footer">
            <div class="footer__info">
                <div class="footer__nav-container footer__navigation-links">  
                    <h3>Разделы</h3>
   
                    <!-- Place for footer navigation -->
                </div>

                <div class="footer__nav-container footer__languages-links">
                    <h3>Языки</h3>
        
                    <nav class="langs__footer">
                        <a href="#" class="lang-link" data-lang="ru">Русский</a>
                        <a href="#" class="lang-link" data-lang="en">English</a>
                    </nav>
            </div>

            <p class="footer__text">
                Демонстрационный проект. Фотографии и отзывы могут быть вымышленными.
            </p>
            </footer>`;

        this.#element = divElement;

        this.#dialog = dialog;
        this.#element.appendChild(this.#dialog.getElement());

        const headerElement =
            this.#element.querySelector<HTMLDivElement>(".page__header");
        if (headerElement === null) {
            throw new Error("Error: Header element not found.");
        }
        this.#header = headerElement;

        const menuBtnElement = this.#element.querySelector<HTMLButtonElement>(
            ".navigation__menu-btn",
        );
        if (menuBtnElement === null) {
            throw new Error("Error: Menu button not found.");
        }
        this.#menuBtn = menuBtnElement;

        const langSwitchElement =
            this.#element.querySelector<HTMLInputElement>(".lang-checkbox");
        if (langSwitchElement === null) {
            throw new Error("Error: Language switch not found.");
        }
        this.#languageSwitch = langSwitchElement;

        this.#initHeader();
        this.#initFooter();
    }

    destroy(): void {
        window.removeEventListener("scroll", this.#pageScrollHandler);
    }

    getElement(): HTMLDivElement {
        return this.#element;
    }

    setLang(lang: Language): void {
        const checkSwitch = lang === "en";
        this.#languageSwitch.checked = checkSwitch;

        document.documentElement.lang = lang;

        translate(document, this.#textContentMap, lang);

        this.#onLangChanged?.(lang);
        lucide?.createIcons?.();
    }

    setOnLangChanged(hook: OnLangChangedHook): void {
        this.#onLangChanged = hook;
    }

    getSections(): HTMLElement[] {
        return [...this.#element.querySelectorAll<HTMLElement>("section")];
    }

    scrollToSection = (section: HTMLElement) => {
        if (this.#dialog.isOpen()) {
            this.#dialog.close();
        }

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    showDialogSection(section: HTMLElement): void {
        this.#dialog.showSection(section, () => {
            lucide?.createIcons?.();
        });
    }

    setHeaderNavigation(nav: HTMLElement): void {
        const manageContainer = this.#element.querySelector<HTMLDivElement>(
            ".header__manage-container",
        );
        if (manageContainer === null) {
            throw new Error("Error: Header manage container not found.");
        }

        nav.classList.add("navigation__header");

        if (this.#headerNav !== null) {
            manageContainer.replaceChild(nav, this.#headerNav);
            this.#headerNav.classList.remove("navigation__header");
        } else {
            manageContainer.appendChild(nav);
        }

        this.#headerNav = nav;
    }

    setMenuSection(nav: HTMLElement): void {
        this.#menuNavSection = nav;
    }

    setFooterNavigation(nav: HTMLElement): void {
        const footerNavContainer = this.#element.querySelector<HTMLDivElement>(
            ".footer__navigation-links",
        );
        if (footerNavContainer === null) {
            throw new Error("Error: Footer navigation container not found.");
        }

        nav.classList.add("navigation__footer");

        if (this.#footerNav !== null) {
            footerNavContainer.replaceChild(nav, this.#footerNav);
            this.#footerNav.classList.remove("navigation__footer");
        } else {
            footerNavContainer.appendChild(nav);
        }

        this.#footerNav = nav;
    }

    setServicesGrid(services: HTMLElement): void {
        const servicesSection = this.#element.querySelector<HTMLElement>(".page__services");
        if (servicesSection === null) {
            throw new Error("Error: Services section not found.");
        }

        if (this.#servicesGrid !== null) {
            servicesSection.replaceChild(services, this.#servicesGrid);
        } else {
            servicesSection.appendChild(services);
        }

        this.#servicesGrid = services;
    }

    setGalleryList(gallery: HTMLElement): void {
        const gallerySection = this.#element.querySelector<HTMLElement>(".page__gallery");
        if (gallerySection === null) {
            throw new Error("Error: Gallery list section not found.");
        }

        if (this.#galleryList !== null) {
            gallerySection.replaceChild(gallery, this.#galleryList);
        } else {
            const allPhotoBtn = this.#element.querySelector<HTMLButtonElement>(".all-photo-btn");
            if (allPhotoBtn === null) {
                throw new Error("Error: Show all photo button not found.");
            }

            gallerySection.insertBefore(gallery, allPhotoBtn);
        }

        this.#galleryList = gallery;
    }

    setReviewsGrid(reviews: HTMLElement): void {
        const reviewsSection = this.#element.querySelector<HTMLElement>(".page__reviews");
        if (reviewsSection === null) {
            throw new Error("Error: Reviews grid section not found.");
        }

        if (this.#reviewsGrid !== null) {
            reviewsSection.replaceChild(reviews, this.#reviewsGrid);
        } else {
            const allReviewsBtn = this.#element.querySelector<HTMLButtonElement>(".all-reviews-btn");
            if (allReviewsBtn === null) {
                throw new Error("Error: Show all reviews button not found.");
            }

            reviewsSection.insertBefore(reviews, allReviewsBtn);
        }

        this.#reviewsGrid = reviews;
    }

    setContactsBlock(contactsBlock: HTMLElement): void {
        const contactsSection = this.#element.querySelector<HTMLElement>(".page__contacts");
        if (contactsSection === null) {
            throw new Error("Error: Contacts section not found.");
        }

        if (this.#contactsBlock !== null) {
            contactsSection.replaceChild(contactsBlock, this.#contactsBlock);
        } else {
            contactsSection.appendChild(contactsBlock);
        }

        this.#contactsBlock = contactsBlock;
        lucide?.createIcons?.();
    }

    #initHeader(): void {
        this.#header.style.setProperty(
            "--header-nav-shift",
            `${this.#COMPACT_HEADER_DIST}px`,
        );

        window.addEventListener("scroll", this.#pageScrollHandler);

        this.#languageSwitch.addEventListener(
            "change",
            this.#languageSwitchHandler,
        );


        const menuBtn = this.#element.querySelector<HTMLButtonElement>(".navigation__menu-btn");
        if (menuBtn === null) {
            throw new Error("Error: Menu navigation button not found.");
        }

        menuBtn.addEventListener("click", () => {
            if (this.#menuNavSection) {
                this.showDialogSection(this.#menuNavSection);
            }
        });
    }

    #initFooter(): void {
        const langsFooter = this.#element.querySelector<HTMLElement>(".langs__footer");
        if (langsFooter === null) {
            throw new Error("Error: Footer langs links container not found.");
        }

        langsFooter.onclick = (event) => {
            event.preventDefault();

            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            const link = target.closest("a");
            if (link === null) {
                return;
            }

            const lang = link.dataset.lang;
            if (lang === undefined || !isLanguage(lang)) {
                return;
            }

            this.setLang(lang);
        }
    }

    #pageScrollHandler = () => {
        this.#header.classList.toggle(
            "page__header--compact",
            window.scrollY > this.#COMPACT_HEADER_DIST,
        );

        const compactMenuBtn = window.scrollY >= this.#header.clientHeight;
        this.#menuBtn.classList.toggle(
            "navigation__menu-btn--compacted",
            compactMenuBtn,
        );
    };

    #languageSwitchHandler = () => {
        this.setLang(this.#languageSwitch.checked ? "en" : "ru");
    };
}
