import crypto from "crypto";
import {PRIVATE_KEY_CONVERTER} from "$env/static/private";

export const generateToken = () => {
    const data = `${Date.now()}`;
    const hmac = crypto.createHmac('sha256', PRIVATE_KEY_CONVERTER);
    hmac.update(data);
    const hmacDigest = hmac.digest('hex');
    return `${hmacDigest}.${data}`;
}

export const validateToken = (token) => {
    try {
        if (!token || typeof token !== 'string') return false;
        const [receivedHmac, receivedData] = token.split('.');
        if (!receivedHmac || !receivedData) {
            return false;
        }

        // Check if token has expired (1 hour)
        const tokenTimestamp = parseInt(receivedData, 10);
        if (isNaN(tokenTimestamp) || Date.now() - tokenTimestamp > 3600000) {
            return false;
        }

        const hmac = crypto.createHmac('sha256', PRIVATE_KEY_CONVERTER);
        hmac.update(receivedData);
        const expectedHmac = hmac.digest('hex');

        const a = Buffer.from(receivedHmac, 'hex');
        const b = Buffer.from(expectedHmac, 'hex');
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch {
        return false;
    }
}