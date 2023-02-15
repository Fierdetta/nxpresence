import { storage } from "@vendetta/plugin";
import Settings from "./ui/pages/Settings";

export default {
    onLoad: () => {
        storage.presenceApiUrl ??= ""
        storage.automaticallyConnect ??= false

    },
    onUnload: () => {

    },
    settings: Settings,
}