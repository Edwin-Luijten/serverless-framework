export function decodeBody(body: any): string {
    try {
        return JSON.parse(body);
    } catch (e) {
        return body;
    }
}