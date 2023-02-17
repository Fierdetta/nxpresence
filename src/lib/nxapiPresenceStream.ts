import { storage } from '@vendetta/plugin';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
import { setActivity, clearActivity } from './activity';
import { USER_AGENT } from './constants';

const EventSource = NativeEventSource || EventSourcePolyfill;

export function setupNxapiPresenceStream() {
	const headers = {
		"User-Agent": USER_AGENT
	}

	let presenceStream = new EventSource(storage.presenceApiUrl + "/events", { headers: headers })

	presenceStream.addEventListener('title', (event) => {
		const title = JSON.parse(event.data)
		
		if (!title) return clearActivity()

		const since = new Date(title.since).getTime()

		return setActivity({
			name: title.name,
			type: 0,
			created_at: since,
			timestamps: {
				start: since
			},
			assets: {
				large_image: title.image_url
			}
		})
	});

	presenceStream.addEventListener('close', (event) => {
		clearActivity()
	});

	return presenceStream;
}