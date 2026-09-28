import { Page } from "./Page/page";
import { App } from "./app";

import { Navigation } from "./Navigation/navigation";
import { Services } from "./Services/services";

import { Dialog } from "./dialog";

import { Detailed } from "./detailed";

const navigation = new Navigation();

const services = new Services();

const dialog = new Dialog();

const detailed = new Detailed();
dialog.addSection(detailed.getElement(), Dialog.SECTION_SHOW_TYPES.slideFromBottom);

const page = new Page(navigation, services, dialog, detailed, Dialog.SECTION_SHOW_TYPES.slideFromRight);
const app = new App(page);

import whatsappSVG from "./assets/whatsapp.svg?raw"
import telegramSVG from "./assets/telegram.svg?raw";

declare const lucide: {
  createIcons: () => void;
}

const Messenger = ["whatsapp", "telegram"] as const;
type Messenger = typeof Messenger[number];

const parser = new DOMParser();

const messengersSVG: { [T in Messenger]: HTMLElement } = {
  whatsapp: parser.parseFromString(whatsappSVG, 'image/svg+xml').documentElement,
  telegram: parser.parseFromString(telegramSVG, 'image/svg+xml').documentElement
}

createIcons();

function createIcons(): void {
  createMessengersIcons();
  lucide.createIcons();
}

function isMessenger(value: string): value is Messenger {
  return Messenger.some(mes => mes === value);
}

function createMessengersIcons(): void {

  document.querySelectorAll<HTMLElement>("span[data-messenger]").forEach(
    element => {
      const messenger = element.dataset.messenger;
      if (messenger === undefined || !isMessenger(messenger)) {
        return;
      }

      element.replaceWith(messengersSVG[messenger]);
    }
  );
}