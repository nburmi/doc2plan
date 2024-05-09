import { getToastStore } from '@skeletonlabs/skeleton';
import type { ToastSettings } from '@skeletonlabs/skeleton';

export const sendErrorToast = (message: string) => {
    const t: ToastSettings = {
        message: `Error: "${message}"`,
        classes: 'variant-filled-error'
    };

    getToastStore().trigger(t);
};