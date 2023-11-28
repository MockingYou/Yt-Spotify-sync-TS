export default interface Token {
    access_token: string;
    refresh_token?: string;
    token_source: string;
}