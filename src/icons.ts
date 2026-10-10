import {
    createIcons,
    Check,
    ChevronLeft,
    ChevronRight,
    Copy,
    LoaderCircle,
    Mail,
    Menu,
    MessageSquareShare,
    Phone,
    PhoneOutgoing,
    Star,
    X
} from "lucide";

const icons = {
    Check,
    ChevronLeft,
    ChevronRight,
    Copy,
    LoaderCircle,
    Mail,
    Menu,
    MessageSquareShare,
    Phone,
    PhoneOutgoing,
    Star,
    X
};

export function renderIcons(): void {
    createIcons({ icons });
}