/**
 * Admin toast vocabulary — client-only (keep out of `admin.js`, which is
 * also imported by server `load`/actions where component code can't run).
 *
 * One vocabulary for the whole console:
 * working = dark + long, success = royal purple, error = red.
 */
import { toast } from '$lib/components/svelte-toast';

/** Working toast; returns the id so callers can `toast.pop(id)` when done. */
export function notifyWorking(message) {
	return toast.push(message, {
		duration: 10000,
		theme: { '--toastBackground': '#333', '--toastColor': '#fff' }
	});
}

export function notifySuccess(message) {
	toast.push(message, {
		duration: 5000,
		theme: { '--toastBackground': '#5c00a6', '--toastColor': '#fff' }
	});
}

export function notifyError(message) {
	toast.push(message, {
		duration: 5000,
		theme: { '--toastBackground': '#f44336', '--toastColor': '#fff' }
	});
}
