declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			showLogin?: boolean;
			showSignup?: boolean;
			showReport?: boolean;
			reportStationId?: string;
		}
		// interface Platform {}
	}
}
