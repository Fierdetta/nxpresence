import { findByProps } from "@vendetta/metro";

const { SET_ACTIVITY } = findByProps("SET_ACTIVITY")

export function setActivity(activity) {
	return SET_ACTIVITY.handler({
		isSocketConnected: () => true,
		socket: {
			id: 100,
			application: {
				id: "1004443008307044452",
				name: activity.name,
			},
			transport: 'ipc',
		},
		args: {
			pid: 14,
			activity: activity,
		},
	})
}

export function clearActivity() {
	return SET_ACTIVITY.handler({
		isSocketConnected: () => true,
		socket: {
			id: 100,
			application: {
				id: "1004443008307044452",
				name: "nxpresence",
			},
			transport: 'ipc',
		},
		args: {
			pid: 14,
			activity: undefined,
		},
	})
}
