import Token from '../../utils/interfaces/tokens/Token'

const loadTokensFromLocalStorage = (token_source: string): Token | null => {
    try {
        const data = localStorage.getItem(`${token_source}`);

        return data ? JSON.parse(data) as Token : null;
    } catch (error) {
        console.error("Error loading tokens from local storage:", error);
        return null;
    }
}

const saveTokensToLocalStorage = (token: Token): void => {
    localStorage.setItem(`${token.token_source}`, JSON.stringify(token));
}

export { loadTokensFromLocalStorage, saveTokensToLocalStorage };
