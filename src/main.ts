import { Page } from "./Page/page";
import { App } from "./app";

import { Navigation } from "./Navigation/navigation";
import { Services } from "./Services/services";
import { Gallery } from "./Gallery/gallery";
import { Reviews } from "./Reviews/reviews";
import { Contacts } from "./Contacts/contacts";

import { Dialog } from "./Dialog/dialog";

import { Detailed } from "./Detailed/detailed";

const dialog = new Dialog();

const navigation = new Navigation();
const services = new Services();
const gallery = new Gallery();
const reviews = new Reviews();
const contacts = new Contacts();

const detailed = new Detailed();

const page = new Page(dialog);
const app = new App(page, navigation, dialog, services, detailed, gallery, reviews, contacts);