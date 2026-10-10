import { Page } from "./Page/page";
import { App } from "./App/app";

import { Navigation } from "./Navigation/navigation";
import { Services } from "./Services/services";
import { Gallery } from "./Gallery/gallery";
import { Reviews } from "./Reviews/reviews";
import { Contacts } from "./Contacts/contacts";

import { type DialogShowType } from "./App/app-interfaces";
import { type ShowType, Dialog } from "./Dialog/dialog";

import { Detailed } from "./Detailed/detailed";

import { ApplicationForm } from "./ApplicationForm/applicationForm";
import { Api } from "./api";

import { Notifyer } from "./Notifyer/notifyer";

const dialog = new Dialog();

const navigation = new Navigation();
const services = new Services();
const gallery = new Gallery();
const reviews = new Reviews();
const contacts = new Contacts();

const detailed = new Detailed();

const appForm = new ApplicationForm();
const api = new Api();

const notifyer = new Notifyer();

const DIALOG_SHOW_MAP: DialogShowType<ShowType> = {
    navigationMenu: Dialog.SECTION_SHOW_TYPES.slideFromRight,
    detailed: Dialog.SECTION_SHOW_TYPES.slideFromBottom,
    gallery: Dialog.SECTION_SHOW_TYPES.scaling,
    reviews: Dialog.SECTION_SHOW_TYPES.slideFromBottom,
    applicationForm: Dialog.SECTION_SHOW_TYPES.slideFromBottom,
    notifyer: Dialog.SECTION_SHOW_TYPES.scaling
};

const page = new Page(dialog);
const app = new App(page, navigation, DIALOG_SHOW_MAP, dialog, services, detailed, gallery, reviews, contacts, appForm, api, notifyer);
void app;