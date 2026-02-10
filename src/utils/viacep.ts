export interface ViaCEPResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
}

/**
 * Fetches address data from Viacep API with local cache
 * @param cep The 8-digit zip code (digits only)
 */
export async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
    const cleanCEP = cep.replace(/\D/g, '');

    if (cleanCEP.length !== 8) return null;

    // Check cache first
    const cacheKey = `cep_cache_${cleanCEP}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        try {
            return JSON.parse(cachedData);
        } catch (e) {
            console.error('Error parsing cached CEP data:', e);
            localStorage.removeItem(cacheKey);
        }
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data: ViaCEPResponse = await response.json();

        if (data.erro) {
            return null;
        }

        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(data));

        return data;
    } catch (error) {
        console.error('Error fetching CEP:', error);
        return null;
    }
}
