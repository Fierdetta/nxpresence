import { ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { setupNxapiPresenceStream } from "./lib/nxapiPresenceStream";
import Settings from "./ui/pages/Settings";

let presenceStream;

export default {
    onLoad: () => {
        storage.presenceApiUrl ??= ""
        storage.automaticallyConnect ??= false

        if (storage.automaticallyConnect) {
            try {
                presenceStream = setupNxapiPresenceStream()
            } catch (e) { }
            if (ReactNative.Platform.OS == "ios") {
                // stop and start the stream when app state changes
                ReactNative.AppState.addEventListener("change", (state) => {
                    if (state === "background") {
                        if (presenceStream) {
                            presenceStream.close()
                            presenceStream = null
                        }
                    } else if (state === "active") {
                        try {
                            presenceStream = setupNxapiPresenceStream()
                        } catch (e) { }
                    }
                })
            }
        }

    },
    onUnload: () => {
        if (presenceStream) {
            presenceStream.close()
            presenceStream = null
        }
    },
    settings: Settings,
}