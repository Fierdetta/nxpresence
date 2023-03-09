import { logger } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showToast } from "@vendetta/ui/toasts";
import EventSource from "react-native-sse";
import { USER_AGENT, APPLICATION_ID } from "../constants";

const AssetManager = findByProps("getAssetIds");

type NxapiEvents = "friend" | "title";

interface Title {
    id: string;
    name: string;
    image_url: string;
    url: string;
    since: string;
};

export default new class NxapiStreamManager {
    eventSource?: EventSource<NxapiEvents>;

    start() {
        if (this.eventSource) {
            logger.info("Closing EventSource");
            this.eventSource.close();
        }

        logger.info("Opening EventSource");

        const eventSource = new EventSource<NxapiEvents>(`${storage.presenceApiUrl}/events`, { headers: { "User-Agent": USER_AGENT } });
        this.eventSource = eventSource;

        eventSource.addEventListener("open", (event) => {
            logger.info("EventSource opened");
        });

        eventSource.addEventListener("friend", (event) => {
            if (event.type !== "friend") return
            logger.verbose("Recieved friend event");

        });

        eventSource.addEventListener("title", (event) => {
            if (event.type !== "title") return
            logger.verbose("Recieved title event");
            const title = JSON.parse(event.data) as Title | null;

            // DEBUG: showToast(title.name, { uri: title.image_url } as any as number);
            this.updateActivity(title);
        });

        eventSource.addEventListener("close", (event) => {
            logger.info("EventSource closed");
        })

        eventSource.addEventListener("error", (event) => {
            if (event.type === "error") {
                if (event.xhrStatus === 200) {
                    logger.info("Connection to presence server was lost");
                } else {
                    logger.error(`xhrStatus ${event.xhrStatus} encountered:`, event.message);
                    showToast("Something went wrong with nxpresence, please check Debug Logs!", getAssetIDByName("Small"));
                }
            } else if (event.type === "exception") {
                logger.error("Exception:", event.message, event.error);
            }
        })
    }

    private async updateActivity(title: Title | null) {
        let activity = null;
    
        if (title) {
            activity = {
                name: title.name,
                flags: 0,
                type: 0,
                application_id: APPLICATION_ID,
                timestamps: {
                    start: new Date(title.since).getTime()
                },
                assets: {
                    large_image: (await AssetManager.getAssetIds(APPLICATION_ID, [title.image_url]))[0]
                }
            }
        }
        
        FluxDispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: activity
        });
    };

    stop() {
        this.eventSource?.close();
        this.eventSource = null;
    }
}
