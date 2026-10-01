import { type Language, isLanguage, type TextContentItem, translate } from "../languages";

import "./base.css";
import textContentMap from "./text-content-map.json";

declare const lucide: {
  createIcons: () => void;
}

interface Dialog {
    getElement(): HTMLDialogElement;
    showSection(section: HTMLElement): void;
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

            <div class="page__reviews-grid">
                <button type="button" class="review-btn">
                <h4 class="review__name">Данил ДанилДанилДанилДанил</h4>

                <div class="review__rating">
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star"></i>
                </div>

                <p class="review__metadata">
                    <span class="metadata__service">Покраска автомобиля</span> ·
                    <span class="metadata__date">16 сентября 2026</span>
                </p>

                <p class="review__text">
                    Провели консультацию, помогли с выбором подходящего цвета
                    расчитали приемлемую цену. Работу сделали быстро и без
                    изъянов. Всем рекомендую мастера.
                    Провели консультацию, помогли с выбором подходящего цвета
                    расчитали приемлемую цену. Работу сделали быстро и без
                    изъянов. Всем рекомендую мастера.
                    Провели консультацию, помогли с выбором подходящего цвета
                    расчитали приемлемую цену. Работу сделали быстро и без
                    изъянов. Всем рекомендую мастера.
                </p>
                </button>
            
                <button type="button" class="review-btn">
                <h4 class="review__name">Данил</h4>

                <div class="review__rating">
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star"></i>
                </div>

                <p class="review__metadata">
                    <span class="metadata__service">Покраска автомобиля</span> ·
                    <span class="metadata__date">16 сентября 2026</span>
                </p>

                <p class="review__text">
                    Провели консультацию, помогли с выбором подходящего цвета
                    расчитали приемлемую цену. Работу сделали быстро и без
                    изъянов. Всем рекомендую мастера.
                </p>
                </button>

                <button type="button" class="review-btn">
                <h4 class="review__name">Данил</h4>

                <div class="review__rating">
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star"></i>
                </div>

                <p class="review__metadata">
                    <span class="metadata__service">Покраска автомобиля</span> ·
                    <span class="metadata__date">16 сентября 2026</span>
                </p>

                <p class="review__text">
                    Провели консультацию, помогли с выбором подходящего цвета
                    расчитали приемлемую цену. Работу сделали быстро и без
                    изъянов. Всем рекомендую мастера.
                </p>
                </button>

                <button type="button" class="review-btn">
                <h4 class="review__name">Данил</h4>

                <div class="review__rating">
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star review__star--filled"></i>
                    <i data-lucide="star" class="review__star"></i>
                </div>

                <p class="review__metadata">
                    <span class="metadata__service">Покраска автомобиля</span> ·
                    <span class="metadata__date">16 сентября 2026</span>
                </p>

                <p class="review__text">
                    Провели консультацию, помогли с выбором подходящего цвета
                    расчитали приемлемую цену. Работу сделали быстро и без
                    изъянов. Всем рекомендую мастера.
                </p>
                </button>
            </div>

            <button type="button" class="more-btn all-reviews-btn">
                <span>Все отзывы</span>
            </button>
            </section>

            <section id="page__contacts" class="page__contacts page__section">
            <h2 class="section-title contacts__title">Как с нами связаться</h2>

            <div class="contacts__container">
                <div class="contacts__map">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d77518.48263723377!2d38.451424822483375!3d52.61566501403438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x413088481a62816b%3A0xbd76a1228ecacf1f!2z0JXQu9C10YYsINCb0LjQv9C10YbQutCw0Y8g0L7QsdC7Liwg0KDQvtGB0YHQuNGP!5e0!3m2!1sru!2sde!4v1789992194956!5m2!1sru!2sde" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
                </div>

                <div class="contacts__content">
                <div class="contact">
                    <div class="contact__icon">
                    <i data-lucide="phone"></i>
                    </div>

                    <label class="contact__field">
                    <span>+7 (000) 000-00 00</span>
                    
                    <button type="button" class="contact-btn contact-copy-btn" aria-label="Скопировать контакт">
                        <i data-lucide="copy"></i>
                    </button>
                    </label>

                    <a class="contact-btn contact-use-btn" href="tel:+70000000000" aria-label="Использовать контакт">
                    <i data-lucide="phone-outgoing"></i>
                    </a>
                </div>

                <div class="contact">
                    <div class="contact__icon">
                    <i data-lucide="mail"></i>
                    </div>

                    <label class="contact__field">
                    <span>email@some.some</span>
                    
                    <button type="button" class="contact-btn contact-copy-btn" aria-label="Скопировать контакт">
                        <i data-lucide="copy"></i>
                    </button>
                    </label>

                    <a class="contact-btn contact-use-btn" href="mailto:email@some.some" aria-label="Использовать контакт">
                    <i data-lucide="message-square-share"></i>
                    </a>
                </div>

                <div class="contact">
                    <div class="contact__icon">
                    <span data-messenger="whatsapp"></span>
                    </div>

                    <label class="contact__field">
                    <span>+7 (000) 000-00 00</span>
                    
                    <button type="button" class="contact-btn contact-copy-btn" aria-label="Скопировать контакт">
                        <i data-lucide="copy"></i>
                    </button>
                    </label>

                    <a class="contact-btn contact-use-btn" href="https://wa.me/70000000000" aria-label="Использовать контакт">
                    <i data-lucide="message-square-share"></i>
                    </a>
                </div>

                <div class="contact">
                    <div class="contact__icon">
                    <span data-messenger="telegram"></span>
                    </div>

                    <label class="contact__field">
                    <span>Username</span>
                    
                    <button type="button" class="contact-btn contact-copy-btn" aria-label="Скопировать контакт">
                        <i data-lucide="copy"></i>
                    </button>
                    </label>

                    <a class="contact-btn contact-use-btn" href="https://t.me/Username" aria-label="Использовать контакт">
                    <i data-lucide="message-square-share"></i>
                    </a>
                </div>

                <p class="contacts__text">
                    Уточнение графика и предварительное согласовение времени.
                </p>

                <button type="button" class="primary-btn submit-app-btn">Оставить заявку</button>
                </div>
            </div>
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
        this.#dialog.showSection(section);
        lucide?.createIcons?.();
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
            manageContainer.replaceChild(this.#headerNav, nav);
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
            footerNavContainer.replaceChild(this.#footerNav, nav);
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
            servicesSection.replaceChild(this.#servicesGrid, services);
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
            this.#galleryList.replaceChild(gallery, this.#galleryList);
        } else {
            const allPhotoBtn = this.#element.querySelector<HTMLButtonElement>(".all-photo-btn");
            if (allPhotoBtn === null) {
                throw new Error("Error: Show all photo button not found.");
            }

            gallerySection.insertBefore(gallery, allPhotoBtn);
        }
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
