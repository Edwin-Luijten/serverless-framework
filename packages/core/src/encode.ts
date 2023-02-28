export function encodeBody(body: any): string {
    if (typeof body === 'object') {
        return JSON.stringify(body);
    }

    if (body !== null && typeof body?.toString === 'function') {
        return body.toString();
    }

    return '';
}