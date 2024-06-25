export default interface Token {
	access_token: string;
	refresh_token?: string | undefined | null;
	token_source: string;
}

export const createToken = ({
	access_token = "",
	refresh_token = undefined,
	token_source = "default",
}: Partial<Token>): Token => ({
	access_token,
	refresh_token,
	token_source,
});
