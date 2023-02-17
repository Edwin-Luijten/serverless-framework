export function encodeBody(body: any): string {
    return typeof body === 'object'
        ? JSON.stringify(body)
        : body && typeof body !== 'string' ? body.toString()
            : body ? body : '';
}