export function decodeBody(body: string): string {
    try {
        return JSON.parse(body);
    } catch (e) {
        return body;
    }
}