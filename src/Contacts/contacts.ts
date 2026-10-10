import "./contacts.css";
import contactsData from "./contacts-data.json";

import { type Language, type LangItem } from "../languages";
import { renderIcons } from "../icons";

import whatsappSVG from "../assets/whatsapp.svg?raw"
import telegramSVG from "../assets/telegram.svg?raw";

const CONTACT_TYPES = ["messenger", "other"] as const;
type ContactType = typeof CONTACT_TYPES[number];

function isContactType(value: string): value is ContactType {
    return CONTACT_TYPES.some((type) => type === value);
}

type Contact = {
    type: ContactType;
    contactIcon: string;
    contactValue: string;
    useContactHref: string;
    useContactAria: LangItem;
    useContactIcon: string;
};

const Messenger = ["whatsapp", "telegram"] as const;
type Messenger = typeof Messenger[number];

const parser = new DOMParser();

const messengersSVG: { [T in Messenger]: HTMLElement } = {
  whatsapp: parser.parseFromString(whatsappSVG, 'image/svg+xml').documentElement,
  telegram: parser.parseFromString(telegramSVG, 'image/svg+xml').documentElement
}

function isMessenger(value: string): value is Messenger {
  return Messenger.some(mes => mes === value);
}

export class Contacts {
    #contacts: Contact[] = [];

    #element: HTMLElement;

    #contactsContent: HTMLElement;
    #contactsText: HTMLElement;
    #submitAppBtn: HTMLButtonElement;

    #lang: Language = "ru";

    #isCopying: boolean = false;
    #COPY_AWAIT_TIMEOUT = 5000;
    #STATUS_RESTORE_TIMEOUT = 2000;

    #onSubmitApplication: (() => void) | null = null;

    constructor() {
        contactsData.forEach((contact) => {
            if (isContactType(contact.type)) {
                this.#contacts.push({
                    ...contact,
                    type: contact.type
                });
            }
        });

        this.#element = document.createElement("div");
        this.#element.classList.add("contacts__container");

        this.#element.innerHTML = `
            <div class="contacts__map">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d77518.48263723377!2d38.451424822483375!3d52.61566501403438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x413088481a62816b%3A0xbd76a1228ecacf1f!2z0JXQu9C10YYsINCb0LjQv9C10YbQutCw0Y8g0L7QsdC7Liwg0KDQvtGB0YHQuNGP!5e0!3m2!1sru!2sde!4v1789992194956!5m2!1sru!2sde" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
            </div>
        `;

        this.#contactsContent = document.createElement("div");
        this.#contactsContent.classList.add("contacts__content");
        this.#element.appendChild(this.#contactsContent);

        this.#contactsText = document.createElement("p");
        this.#contactsText.classList.add("contacts__text");
        this.#contactsText.textContent = this.#lang === "ru"
            ? "Уточнение графика и предварительное согласовение времени."
            : "Refining the schedule and tentatively agreeing on the time.";

        this.#submitAppBtn = document.createElement("button");
        this.#submitAppBtn.type = "button";
        this.#submitAppBtn.classList.add("primary-btn", "submit-app-btn");
        this.#submitAppBtn.textContent = this.#lang === "ru"
            ? "Оставить заявку"
            : "Submit application";

        this.#contactsContent.addEventListener("click", this.#clickHandler);

        this.#submitAppBtn.addEventListener("click", () => {
            if (this.#onSubmitApplication === null) {
                throw new Error(`Error: Set "onSubmitApplication()" hook first.`);
            }

            this.#onSubmitApplication();
        });

        this.renderContacts();
    }

    renderContacts(): void {
        const contactRows = this.#contacts.map((contact) => {
            const contactDiv = document.createElement("div");
            contactDiv.classList.add("contact");

            const contactIconContainer = document.createElement("div");
            contactIconContainer.classList.add("contact__icon");

            if (contact.type === "messenger") {
                const contactIcon = document.createElement("span");
                contactIcon.dataset.messenger = contact.contactIcon;
                contactIconContainer.appendChild(contactIcon);
            } else {
                const contactIcon = document.createElement("i");
                contactIcon.dataset.lucide = contact.contactIcon;
                contactIconContainer.appendChild(contactIcon);
            }

            const contactField = document.createElement("label");
            contactField.classList.add("contact__field");

            const contactValue = document.createElement("span");
            contactValue.textContent = contact.contactValue;
            contactField.appendChild(contactValue);

            const copyBtn = document.createElement("button");
            copyBtn.type = "button";
            copyBtn.classList.add("contact-btn", "contact-copy-btn");
            copyBtn.ariaLabel = this.#lang === "ru" ? "Скопировать контакт" : "Copy contact";

            const copyBtnIcon = document.createElement("i");
            copyBtnIcon.dataset.lucide = "copy";
            copyBtn.appendChild(copyBtnIcon);
            contactField.appendChild(copyBtn);

            const useContactBtn = document.createElement("a");
            useContactBtn.classList.add("contact-btn", "contact-use-btn");
            useContactBtn.href = contact.useContactHref;
            useContactBtn.ariaLabel = contact.useContactAria[this.#lang];

            const useContactIcon = document.createElement("i");
            useContactIcon.dataset.lucide = contact.useContactIcon;
            useContactBtn.appendChild(useContactIcon);

            contactDiv.appendChild(contactIconContainer);
            contactDiv.appendChild(contactField);
            contactDiv.appendChild(useContactBtn);

            return contactDiv;
        });

        this.#contactsContent.replaceChildren(...contactRows);
        this.#contactsContent.appendChild(this.#contactsText);
        this.#contactsContent.appendChild(this.#submitAppBtn);

        this.createMessengersIcons();
    }

    createMessengersIcons(): void {
        this.#element.querySelectorAll<HTMLElement>("span[data-messenger]").forEach(
            (element) => {
                const messenger = element.dataset.messenger;
                if (messenger === undefined || !isMessenger(messenger)) {
                    return;
                }

                element.replaceWith(messengersSVG[messenger]);
            }
        );
    }

    getElement(): HTMLElement {
        return this.#element;
    }

    setLang(lang: Language): void {
        this.#lang = lang;

        this.#contactsText.textContent = this.#lang === "ru"
            ? "Уточнение графика и предварительное согласовение времени."
            : "Refining the schedule and tentatively agreeing on the time.";

        this.#submitAppBtn.textContent = this.#lang === "ru"
            ? "Оставить заявку"
            : "Submit application";

        this.renderContacts();
    }

    setOnSubmitApplication(hook: () => void): void {
        this.#onSubmitApplication = hook;
    }

    async copyContact(contactField: HTMLElement): Promise<boolean> {
        if (this.#isCopying) {
            return false;
        }

        this.#isCopying = true;

        const contactValue = contactField.querySelector<HTMLSpanElement>("span")?.textContent?.trim();
        if (!contactValue) {
            this.#isCopying = false;
            return false;
        }

        const copyBtn = contactField.querySelector<HTMLButtonElement>(".contact-copy-btn");
        if (copyBtn === null) {
            this.#isCopying = false;
            return false;
        }

        const loadingContainer = document.createElement("div");
        loadingContainer.classList.add("contact-copy-status", "copy-loading");
        loadingContainer.innerHTML = `<i data-lucide="loader-circle"></i>`;

        contactField.replaceChild(loadingContainer, copyBtn);
        renderIcons();

        let success = false;
        let statusContainer = null;
        try {
            await Promise.race([
                new Promise<void>((res) => {
                    navigator.clipboard.writeText(contactValue);
                    res();
                }),
                new Promise<void>((_res, rej) => {
                    setTimeout(() => {
                        rej();
                    }, this.#COPY_AWAIT_TIMEOUT);
                })
            ])
            .catch(() => {
                throw new Error("Error: Copy operation timed out.");
            });

            statusContainer = document.createElement("div");
            statusContainer.classList.add("contact-copy-status", "copy-success");
            statusContainer.innerHTML = `<i data-lucide="check"></i>`;

            success = true;
        } catch (error) {
            statusContainer = document.createElement("div");
            statusContainer.classList.add("contact-copy-status", "copy-failure");
            statusContainer.innerHTML = `<i data-lucide="x"></i>`;
        }

        contactField.replaceChild(statusContainer, loadingContainer);
        renderIcons();

        setTimeout(() => {
            contactField.replaceChild(copyBtn, statusContainer);
            renderIcons();
        }, this.#STATUS_RESTORE_TIMEOUT);

        this.#isCopying = false;
        return success;
    }

    #clickHandler = (event: Event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const copyBtn = target.closest<HTMLButtonElement>(".contact-copy-btn");
        if (copyBtn === null) {
            return;
        }

        const contactField = target.closest<HTMLLabelElement>(".contact__field");
        if (contactField === null) {
            return;
        }

        // const contactValue = contactField.querySelector<HTMLSpanElement>("span")?.textContent;
        // if (contactValue === undefined) {
        //     return;
        // }

        this.copyContact(contactField);
    };
}