import i18n from "i18next";

import { messages } from "./languages";

i18n.init({
	debug: false,
	defaultNS: ["translations"],
	lng: "pt",
	fallbackLng: "pt",
	supportedLngs: ["pt"],
	ns: ["translations"],
	resources: messages,
});

export { i18n };
