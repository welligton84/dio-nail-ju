import { toast } from 'sonner';
import { functions } from '../lib/firebase';

export type NFSeProvider = 'national' | 'national_homolog' | 'isss' | 'webiss_juazeiro' | 'focusnfe' | 'simplified' | 'plugnotas';

export interface NFSeConfig {
    enabled: boolean;
    provider: NFSeProvider;
    environment?: 'homologacao' | 'producao';
    cityCode: string;
    serviceCode: string;
    cnaeCode: string;
    aliqIss: string;
    certificate: string | null;
    certificateName: string | null;
    certificatePassword?: string | null;
    apiKey: string | null;
}

export interface CompanyData {
    name: string;
    cnpj: string;
    cpf: string;
    phone: string;
    email: string;
    address: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    neighborhood: string;
    inscricaoMunicipal?: string;
    inscricaoEstadual?: string;
}

export interface NFSeClient {
    name: string;
    cpf?: string;
    cnpj?: string;
    email: string;
}

export interface NFSeServiceItem {
    code: string;
    description: string;
    value: number;
}

export interface NFSeData {
    issuer: {
        cnpj: string;
        name: string;
        address: string;
        number: string;
        city: string;
        state: string;
        inscricaoMunicipal?: string;
    };
    service: {
        code: string;
        cnae: string;
        aliqIss: string;
        description: string;
        items: NFSeServiceItem[];
    };
    client: NFSeClient;
    invoice: {
        value: number;
        paymentMethod: string;
        date: string;
        appointmentId: string;
    };
}

export interface NFSeResult {
    success: boolean;
    nfseNumber?: string;
    verificationCode?: string;
    pdfUrl?: string;
    xmlUrl?: string;
    error?: string;
    rawResponse?: unknown;
}

export const NFSE_PROVIDERS: Record<NFSeProvider, { name: string; baseUrl: string; nfseEndpoint: string; requiresCertificate: boolean; ambiente: 'producao' | 'homologacao'; type: 'rest' | 'soap' }> = {
    simplified: {
        name: 'Modo Teste (Sem Certificado)',
        baseUrl: '',
        nfseEndpoint: '',
        requiresCertificate: false,
        ambiente: 'producao',
        type: 'rest',
    },
    national: {
        name: 'Sistema Nacional NFS-e (Gratuito)',
        baseUrl: 'https://sefin.nfse.gov.br',
        nfseEndpoint: '/SefinNacional/api/v1/nfse',
        requiresCertificate: true,
        ambiente: 'producao',
        type: 'rest',
    },
    national_homolog: {
        name: 'Sistema Nacional NFS-e (Homologação)',
        baseUrl: 'https://sefin.producaorestrita.nfse.gov.br',
        nfseEndpoint: '/SefinNacional/api/v1/nfse',
        requiresCertificate: true,
        ambiente: 'homologacao',
        type: 'rest',
    },
    webiss_juazeiro: {
        name: 'WebISS Juazeiro BA (ABRASF)',
        baseUrl: 'http://juazeiroba.webiss.com.br',
        nfseEndpoint: '/ws/nfse.asmx',
        requiresCertificate: true,
        ambiente: 'producao',
        type: 'soap',
    },
    isss: {
        name: 'ISSS Salvador',
        baseUrl: 'https://isss.salvador.ba.gov.br',
        nfseEndpoint: '/api/nfse',
        requiresCertificate: false,
        ambiente: 'producao',
        type: 'rest',
    },
    focusnfe: {
        name: 'Focus NFe (Pago)',
        baseUrl: 'https://api.focusnfe.com.br',
        nfseEndpoint: '/v2/nfse',
        requiresCertificate: false,
        ambiente: 'producao',
        type: 'rest',
    },
    plugnotas: {
        name: 'PlugNotas (TecnoSpeed)',
        baseUrl: 'https://api.plugnotas.com.br',
        nfseEndpoint: '/nfse',
        requiresCertificate: false,
        ambiente: 'producao',
        type: 'rest',
    },
};

export const BRAZILIAN_CITIES: Record<string, { name: string; state: string; ibgeCode: string }> = {
    '2918407': { name: 'Juazeiro', state: 'BA', ibgeCode: '2918407' },
    '2927408': { name: 'Salvador', state: 'BA', ibgeCode: '2927408' },
    '3550308': { name: 'São Paulo', state: 'SP', ibgeCode: '3550308' },
    '3304557': { name: 'Rio de Janeiro', state: 'RJ', ibgeCode: '3304557' },
    '3106200': { name: 'Belo Horizonte', state: 'MG', ibgeCode: '3106200' },
    '5300108': { name: 'Brasília', state: 'DF', ibgeCode: '5300108' },
    '2611606': { name: 'Recife', state: 'PE', ibgeCode: '2611606' },
    '2304400': { name: 'Fortaleza', state: 'CE', ibgeCode: '2304400' },
    '2408102': { name: 'Natal', state: 'RN', ibgeCode: '2408102' },
    '4314902': { name: 'Porto Alegre', state: 'RS', ibgeCode: '4314902' },
    '4205407': { name: 'Florianópolis', state: 'SC', ibgeCode: '4205407' },
};

export class NFSeService {
    private config: NFSeConfig;
    private company: CompanyData;
    private provider: NFSeProvider;

    constructor(config: NFSeConfig, company: CompanyData) {
        this.config = config;
        this.company = company;
        this.provider = config.provider || 'simplified';
    }

    getProviderConfig() {
        const config = { ...NFSE_PROVIDERS[this.provider] };

        if (this.provider === 'focusnfe' && this.config.environment === 'homologacao') {
            config.baseUrl = 'https://homologacao.focusnfe.com.br';
            config.ambiente = 'homologacao';
        }

        return config;
    }

    isConfigured(): { valid: boolean; error?: string } {
        if (!this.config.enabled) {
            return { valid: false, error: 'NFSe está desabilitada' };
        }

        if (!this.company.cnpj && !this.company.cpf) {
            return { valid: false, error: 'Empresa precisa de CNPJ ou CPF' };
        }

        if (!this.config.cityCode) {
            return { valid: false, error: 'Código do município não configurado' };
        }

        if (!this.config.serviceCode) {
            return { valid: false, error: 'Código do serviço não configurado' };
        }

        const providerConfig = this.getProviderConfig();
        if (providerConfig.requiresCertificate && !this.config.certificate) {
            return { valid: false, error: 'Certificado digital é necessário para este provedor' };
        }

        if (this.provider === 'focusnfe' && !this.config.apiKey) {
            return { valid: false, error: 'Token API Focus NFe é necessário' };
        }

        if (this.provider === 'plugnotas' && !this.config.apiKey) {
            return { valid: false, error: 'API Key do PlugNotas é necessária' };
        }

        return { valid: true };
    }

    buildDPS(data: NFSeData): string {
        const cnpjEmitente = (this.company.cnpj || this.company.cpf || '').replace(/\D/g, '');
        const dCompet = data.invoice.date.substring(0, 10);

        const aliqIss = parseFloat(data.service.aliqIss) || 5;
        const vServ = data.invoice.value;
        const vIss = (vServ * (aliqIss / 100));

        const dps = `<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.nfe.gov.br/schemas/nfse" versao="1.00">
    <infDPS Id="DPS${cnpjEmitente}${new Date().getTime()}" versao="1.00">
        <tpAmb>2</tpAmb>
        <verAplic>NL-NFSe-BR</verAplic>
        <tpEmis>1</tpEmis>
        <idEmissorOrg>${cnpjEmitente}</idEmissorOrg>
        <dhEmi>${new Date().toISOString()}</dhEmi>
        <dCompet>${dCompet}</dCompet>
        <naturezaOperacao>1</naturezaOperacao>
        <regimeTributario>1</regimeTributario>
        <simplesNacional>2</simplesNacional>
        <prest>
            <infPrest>
                <cpfCnpj>
                    <cpf>${this.company.cpf ? this.company.cpf.replace(/\D/g, '') : ''}</cpf>
                    <cnpj>${this.company.cnpj ? this.company.cnpj.replace(/\D/g, '') : ''}</cnpj>
                </cpfCnpj>
                <razaoSocial>${this.escapeXml(this.company.name)}</razaoSocial>
                <nomeFantasia></nomeFantasia>
                <endereco>
                    <endereco>${this.escapeXml(this.company.address)}</endereco>
                    <numero>${this.escapeXml(this.company.number)}</numero>
                    <complemento></complemento>
                    <bairro>${this.escapeXml(this.company.neighborhood || '')}</bairro>
                    <cidade>${this.config.cityCode}</cidade>
                    <UF>${this.company.state}</UF>
                    <CEP>${(this.company.zipCode || '').replace(/\D/g, '')}</CEP>
                </endereco>
                <contato>
                    <telefone>${(this.company.phone || '').replace(/\D/g, '')}</telefone>
                    <email>${this.escapeXml(this.company.email || '')}</email>
                </contato>
            </infPrest>
        </prest>
        <serv>
            <infServ>
                <cTribNac>${data.service.cnae}</cTribNac>
                <cTribMun>${data.service.code}</cTribMun>
                <cnae>${data.service.cnae}</cnae>
                <descricao>${this.escapeXml(data.service.description)}</descricao>
                <codigoMunicipio>${this.config.cityCode}</codigoMunicipio>
                <valores>
                    <vServ>${vServ.toFixed(2)}</vServ>
                    <vDesc>0.00</vDesc>
                    <vRec>${vServ.toFixed(2)}</vRec>
                    <vServPresta>${vServ.toFixed(2)}</vServPresta>
                    <trib>
                        <tribMun>${(aliqIss / 100).toFixed(4)}</tribMun>
                        <vISS>${vIss.toFixed(2)}</vISS>
                        <vISSRet>0.00</vISSRet>
                        <regimeTributario>1</regimeTributario>
                        <tpRetISS>1</tpRetISS>
                    </trib>
                </valores>
            </infServ>
        </serv>
        <tomador>
            <infTomador>
                <cpfCnpj>
                    <cpf>${data.client.cpf ? data.client.cpf.replace(/\D/g, '') : ''}</cpf>
                    <cnpj>${data.client.cnpj ? data.client.cnpj.replace(/\D/g, '') : ''}</cnpj>
                </cpfCnpj>
                <razaoSocial>${this.escapeXml(data.client.name)}</razaoSocial>
                <endereco>
                    <endereco></endereco>
                    <numero></numero>
                    <complemento></complemento>
                    <bairro></bairro>
                    <cidade></cidade>
                    <UF></UF>
                    <CEP></CEP>
                </endereco>
                <contato>
                    <telefone></telefone>
                    <email>${this.escapeXml(data.client.email || '')}</email>
                </contato>
            </infTomador>
        </tomador>
        <intermediario>
            <infIntermediario>
                <cpfCnpj>
                    <cpf></cpf>
                    <cnpj></cnpj>
                </cpfCnpj>
                <razaoSocial></razaoSocial>
            </infIntermediario>
        </intermediario>
        <obra>
            <codigoObra></codigoObra>
            <codigoArt></codigoArt>
        </obra>
    </infDPS>
</DPS>`;

        return dps;
    }

    buildXMLABRASF(data: NFSeData): string {
        const cnpjEmitente = (this.company.cnpj || '').replace(/\D/g, '');
        const cpfTomador = (data.client.cpf || '').replace(/\D/g, '');
        const numeroRps = Date.now().toString().slice(-15);
        const serieRps = '1';

        const aliqIss = parseFloat(data.service.aliqIss) || 5;
        const vServ = data.invoice.value;
        const vIss = vServ * (aliqIss / 100);
        const vDesc = 0;

        const competencia = data.invoice.date.substring(0, 10);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PedidoEnvioRPS xmlns="http://www.abrasf.org.br/nfse.xsd" xmlns:ns1="http://www.abrasf.org.br/nfse_tipos.xsd">
    <ns1:EnviarLoteRpsEnvio>
        <ns1:LoteRps Id="L${numeroRps}" versao="2.01">
            <ns1:NumeroLote>${numeroRps}</ns1:NumeroLote>
            <ns1:Cnpj>${cnpjEmitente}</ns1:Cnpj>
            <ns1:InscricaoMunicipal></ns1:InscricaoMunicipal>
            <ns1:QuantidadeRps>1</ns1:QuantidadeRps>
            <ns1:ListaRps>
                <ns1:Rps>
                    <ns1:InfRps Id="R${numeroRps}">
                        <ns1:IdentificacaoRps>
                            <ns1:Numero>${numeroRps}</ns1:Numero>
                            <ns1:Serie>${serieRps}</ns1:Serie>
                            <ns1:Tipo>1</ns1:Tipo>
                        </ns1:IdentificacaoRps>
                        <ns1:DataEmissao>${competencia}</ns1:DataEmissao>
                        <ns1:NaturezaOperacao>1</ns1:NaturezaOperacao>
                        <ns1:RegimeEspecialTributacao>1</ns1:RegimeEspecialTributacao>
                        <ns1:OptanteSimplesNacional>2</ns1:OptanteSimplesNacional>
                        <ns1:IncentivadorCultural>2</ns1:IncentivadorCultural>
                        <ns1:Status>1</ns1:Status>
                        <ns1:Servico>
                            <ns1:Valores>
                                <ns1:ValorServicos>${vServ.toFixed(2)}</ns1:ValorServicos>
                                <ns1:ValorDeducoes>${vDesc.toFixed(2)}</ns1:ValorDeducoes>
                                <ns1:ValorPis>0.00</ns1:ValorPis>
                                <ns1:ValorCofins>0.00</ns1:ValorCofins>
                                <ns1:ValorInss>0.00</ns1:ValorInss>
                                <ns1:ValorIr>0.00</ns1:ValorIr>
                                <ns1:ValorCsll>0.00</ns1:ValorCsll>
                                <ns1:IssRetido>2</ns1:IssRetido>
                                <ns1:ValorIss>${vIss.toFixed(2)}</ns1:ValorIss>
                                <ns1:BaseCalculo>${vServ.toFixed(2)}</ns1:BaseCalculo>
                                <ns1:Aliquota>${(aliqIss / 100).toFixed(4)}</ns1:Aliquota>
                                <ns1:ValorLiquidoNfse>${(vServ - vDesc).toFixed(2)}</ns1:ValorLiquidoNfse>
                            </ns1:Valores>
                            <ns1:ItemListaServico>${data.service.code}</ns1:ItemListaServico>
                            <ns1:CodigoTributacaoMunicipio></ns1:CodigoTributacaoMunicipio>
                            <ns1:Discriminacao>${this.escapeXml(data.service.description)}</ns1:Discriminacao>
                            <ns1:CodigoMunicipio>${this.config.cityCode}</ns1:CodigoMunicipio>
                        </ns1:Servico>
                        <ns1:Prestador>
                            <ns1:CpfCnpj>
                                <ns1:Cnpj>${cnpjEmitente}</ns1:Cnpj>
                            </ns1:CpfCnpj>
                        </ns1:Prestador>
                        <ns1:Tomador>
                            <ns1:IdentificacaoTomador>
                                <ns1:CpfCnpj>
                                    <ns1:Cpf>${cpfTomador}</ns1:Cpf>
                                </ns1:CpfCnpj>
                            </ns1:IdentificacaoTomador>
                            <ns1:RazaoSocial>${this.escapeXml(data.client.name)}</ns1:RazaoSocial>
                            <ns1:Endereco>
                                <ns1:Endereco></ns1:Endereco>
                                <ns1:Numero></ns1:Numero>
                                <ns1:Complemento></ns1:Complemento>
                                <ns1:Bairro></ns1:Bairro>
                                <ns1:CodigoMunicipio></ns1:CodigoMunicipio>
                                <ns1:Uf></ns1:Uf>
                                <ns1:Cep></ns1:Cep>
                            </ns1:Endereco>
                            <ns1:Contato>
                                <ns1:Email>${data.client.email || ''}</ns1:Email>
                            </ns1:Contato>
                        </ns1:Tomador>
                    </ns1:InfRps>
                </ns1:Rps>
            </ns1:ListaRps>
        </ns1:LoteRps>
    </ns1:EnviarLoteRpsEnvio>
</PedidoEnvioRPS>`;

        return xml;
    }

    private escapeXml(text: string): string {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    async signXML(xml: string): Promise<string> {
        if (this.provider === 'simplified') {
            return xml;
        }

        const providerConfig = this.getProviderConfig();
        if (!providerConfig.requiresCertificate) {
            return xml;
        }

        if (!this.config.certificate) {
            throw new Error('Certificado digital não configurado');
        }

        try {
            const { SignedXml } = await import('xml-crypto');
            const { DOMParser, XMLSerializer } = await import('@xmldom/xmldom');
            const forge = await import('node-forge');

            if (!this.config.certificatePassword) {
                throw new Error('Senha do certificado não informada. Configure a senha nas configurações de NFSe.');
            }

            // 1. Decifrar o PFX/P12 usando a senha
            const p12Der = forge.util.decode64(this.config.certificate);
            const p12Asn1 = forge.asn1.fromDer(p12Der);
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, this.config.certificatePassword);

            // 2. Extrair a chave privada
            const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
            const bag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

            if (!bag || !bag.key) {
                throw new Error('Não foi possível encontrar a chave privada no arquivo do certificado.');
            }

            const privateKeyPem = forge.pki.privateKeyToPem(bag.key);

            // 3. Assinar o XML
            const doc = new DOMParser().parseFromString(xml, 'text/xml');
            const sig = new SignedXml();

            // Determinar o ID ou tag para assinar (DPS ou RPS)
            const isRps = xml.includes('InfRps');
            const xpath = isRps ? "//*[local-name(.)='InfRps']" : "//*[local-name(.)='infDPS']";

            sig.addReference({
                xpath,
                transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", "http://www.w3.org/2001/10/xml-exc-c14n#"],
                digestAlgorithm: "http://www.w3.org/2000/09/xmldsig#sha1"
            });

            sig.signatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sig as any).signingKey = privateKeyPem;

            sig.computeSignature(new XMLSerializer().serializeToString(doc));

            return sig.getSignedXml();
        } catch (error) {
            console.error('Erro ao assinar XML:', error);
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            throw new Error(`Falha ao assinar digitalmente: ${msg}. Verifique a senha e o arquivo do certificado.`);
        }
    }

    async compressAndEncode(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(data);

        const cs = new CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        writer.write(uint8Array);
        writer.close();

        const compressed = await cs.readable.getReader().read();
        const buffer = compressed.value as Uint8Array;

        let binary = '';
        for (let i = 0; i < buffer.byteLength; i++) {
            binary += String.fromCharCode(buffer[i]);
        }

        return btoa(binary);
    }

    async emit(data: NFSeData): Promise<NFSeResult> {
        const check = this.isConfigured();
        if (!check.valid) {
            return { success: false, error: check.error };
        }

        try {
            let payload: string;
            let encodedData: string;

            if (this.provider === 'webiss_juazeiro') {
                const xmlAbraso = this.buildXMLABRASF(data);
                payload = xmlAbraso;
                encodedData = btoa(xmlAbraso);
            } else {
                const dps = this.buildDPS(data);
                const signedDPS = await this.signXML(dps);
                encodedData = await this.compressAndEncode(signedDPS);
                payload = dps;
            }

            if (this.provider === 'simplified') {
                console.log('NFSe (modo teste):', { payload, data });
                toast.success('NFSe registrada em modo de teste');

                return {
                    success: true,
                    nfseNumber: `TESTE-${Date.now().toString().slice(-8)}`,
                    verificationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
                    pdfUrl: '',
                    xmlUrl: '',
                };
            }

            const response = await this.sendToAPI(encodedData, payload, data);

            toast.success('NFSe emitida com sucesso!');

            return {
                success: true,
                nfseNumber: response.numeroNFSe,
                verificationCode: response.codigoVerificacao,
                pdfUrl: response.urlPDF,
                xmlUrl: response.urlXML,
                rawResponse: response,
            };
        } catch (error) {
            console.error('Erro ao emitir NFSe:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            };
        }
    }

    private async sendToAPI(encodedData: string, payload: string, data: NFSeData): Promise<{
        numeroNFSe: string;
        codigoVerificacao: string;
        urlPDF: string;
        urlXML: string;
    }> {
        const providerConfig = this.getProviderConfig();

        if (this.provider === 'webiss_juazeiro') {
            return this.sendToSOAP(payload);
        }

        if (this.provider === 'focusnfe') {
            return this.sendToFocusNFe(encodedData, data);
        }

        if (this.provider === 'plugnotas') {
            return this.sendToPlugNotas(data);
        }

        const endpoint = `${providerConfig.baseUrl}${providerConfig.nfseEndpoint}`;

        console.log('Enviando NFSe para:', endpoint);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                dps: encodedData,
                municipio: this.config.cityCode,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }

        return response.json();
    }

    private async sendToFocusNFe(_encodedData: string, data: NFSeData): Promise<{
        numeroNFSe: string;
        codigoVerificacao: string;
        urlPDF: string;
        urlXML: string;
    }> {
        const apiKey = this.config.apiKey || '';
        const providerConfig = this.getProviderConfig();

        const ref = `NFSE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const endpoint = `${providerConfig.baseUrl}${providerConfig.nfseEndpoint}?ref=${ref}`;

        console.log('Enviando NFSe para Focus NFe:', endpoint);

        const focusPayload = {
            data_emissao: new Date().toISOString(),
            data_competencia: new Date().toISOString().substring(0, 10),
            codigo_municipio_emissora: parseInt(this.config.cityCode),
            prestador: {
                cnpj: (this.company.cnpj || this.company.cpf || '').replace(/\D/g, ''),
                inscricao_municipal: this.company.inscricaoMunicipal || '',
                razao_social: this.company.name,
                nome_fantasia: this.company.name,
                codigo_municipio: parseInt(this.config.cityCode),
                endereco: {
                    tipo_logradouro: 'R',
                    logradouro: this.company.address || '',
                    numero: this.company.number || 'S/N',
                    complemento: '',
                    bairro: this.company.neighborhood || '',
                    cep: (this.company.zipCode || '').replace(/\D/g, ''),
                    uf: this.company.state || 'BA',
                }
            },
            tomador: {
                cpf_cnpj: data.client?.cpf || data.client?.cnpj || '',
                razao_social: data.client?.name || 'CONSUMIDOR',
                email: data.client?.email || '',
                telefone: '',
                endereco: {
                    codigo_municipio: parseInt(this.config.cityCode),
                }
            },
            servico: {
                codigo_municipio_prestacao: parseInt(this.config.cityCode),
                codigo_tributacao_nacional_iss: this.config.serviceCode || '0104',
                descricao: data.service?.description || 'Serviço de beleza e cuidados pessoais',
                valor_servico: data.invoice?.value || 0,
            }
        };

        console.log('FocusNFe payload:', JSON.stringify(focusPayload, null, 2));

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(apiKey + ':')}`,
            },
            body: JSON.stringify(focusPayload),
        });

        const responseText = await response.text();
        console.log('FocusNFe response status:', response.status);
        console.log('FocusNFe response body (first 500 chars):', responseText.substring(0, 500));

        if (!responseText || responseText.trim() === '') {
            console.error('FocusNFe resposta vazia - headers:', Object.fromEntries(response.headers.entries()));
            throw new Error(`Erro na Focus NFe: Resposta vazia (Status ${response.status}). Verifique a API key e tente novamente.`);
        }

        const trimmedResponse = responseText.trim();
        if (trimmedResponse.startsWith('<') || trimmedResponse.toLowerCase().includes('<html')) {
            console.error('FocusNFe retornou HTML (possível erro de CORS ou API):', trimmedResponse.substring(0, 500));
            throw new Error(`Erro na Focus NFe: Servidor retornou erro HTML. Status ${response.status}. Verifique a API key e se o ambiente está correto.`);
        }

        if (!response.ok) {
            let errorMessage = `Erro na Focus NFe: ${response.status}`;
            try {
                const errorJson = JSON.parse(responseText.trim());
                errorMessage = errorJson.mensagem || errorJson.erro || errorMessage;
            } catch {
                errorMessage += ` - ${responseText.substring(0, 200)}`;
            }
            throw new Error(errorMessage);
        }

        let result;
        try {
            result = JSON.parse(responseText.trim());
        } catch {
            console.error('FocusNFe resposta inválida:', responseText.substring(0, 500));
            throw new Error(`Erro ao processar resposta da Focus NFe: resposta inválida. Status ${response.status}. Verifique a API key e o ambiente.`);
        }

        if (response.status === 201 || result.codigo_status === 201 || result.status === 'processando') {
            console.log('NFSe aceita para processamento (status 201), verificando status...');
            console.log('Resultado retornado pela API:', result);
            // Usar o ref retornado pela API se disponível, ou o ref local
            const apiRef = result.ref || ref;
            return this.waitForNFSe(apiKey, apiRef);
        }

        if (result.codigo_status === 200 || result.codigo_status === 200) {
            console.log('NFSe processada imediatamente (status 200):', result);
            return {
                numeroNFSe: result.numero || result.nfse?.numero || `FOCUS-${Date.now()}`,
                codigoVerificacao: result.codigo_verificacao || result.nfse?.codigo_verificacao || Math.random().toString(36).substring(2, 10).toUpperCase(),
                urlPDF: result.url_danfse || result.nfse?.url_danfse || '',
                urlXML: result.url_nfse_xml || result.nfse?.url_nfse_xml || '',
            };
        }

        throw new Error(result.mensagem || result.erro || 'Erro ao emitir NFSe');
    }

    private async waitForNFSe(apiKey: string, ref: string, attempts = 0): Promise<{
        numeroNFSe: string;
        codigoVerificacao: string;
        urlPDF: string;
        urlXML: string;
    }> {
        const providerConfig = this.getProviderConfig();
        const endpoint = `${providerConfig.baseUrl}${providerConfig.nfseEndpoint}/${ref}`;

        console.log(`Consultando NFSe status (tentativa ${attempts + 1}):`, endpoint);

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${btoa(apiKey + ':')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ao consultar NFSe: ${response.status}`);
        }

        const result = await response.json();
        console.log(`NFSe status response (tentativa ${attempts + 1}):`, result);
        console.log('NFSe status code:', result.codigo_status);
        console.log('NFSe status text:', result.status);

        if (result.status === 'processando' || result.codigo_status === 201) {
            if (attempts >= 10) {
                throw new Error('Tempo limite excedido ao processar NFSe. Tente novamente mais tarde.');
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.waitForNFSe(apiKey, ref, attempts + 1);
        }

        if (result.status === 'autorizada' || result.codigo_status === 200) {
            return {
                numeroNFSe: result.numero || result.nfse?.numero || `FOCUS-${Date.now()}`,
                codigoVerificacao: result.codigo_verificacao || result.nfse?.codigo_verificacao || Math.random().toString(36).substring(2, 10).toUpperCase(),
                urlPDF: result.url_danfse || result.nfse?.url_danfse || '',
                urlXML: result.url_nfse_xml || result.nfse?.url_nfse_xml || '',
            };
        }

        throw new Error(result.mensagem || result.erro || 'NFSe não autorizada');
    }

    private async sendToSOAP(xmlPayload: string): Promise<{
        numeroNFSe: string;
        codigoVerificacao: string;
        urlPDF: string;
        urlXML: string;
    }> {
        const providerConfig = this.getProviderConfig();
        const endpoint = `${providerConfig.baseUrl}${providerConfig.nfseEndpoint}`;

        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://nfse.abrasf.org.br">
    <soap:Header/>
    <soap:Body>
        <tns:GerarNfseRequest>
            <nfseCabecMsg><![CDATA[<?xml version="1.0" encoding="UTF-8"?><cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="2.01"><versaoDados>2.01</versaoDados></cabecalho>]]></nfseCabecMsg>
            <nfseDadosMsg><![CDATA[${xmlPayload}]]></nfseDadosMsg>
        </tns:GerarNfseRequest>
    </soap:Body>
</soap:Envelope>`;

        console.log('Enviando NFSe via SOAP para:', endpoint);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://nfse.abrasf.org.br/GerarNfse',
            },
            body: soapEnvelope,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API SOAP: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        console.log('Resposta SOAP:', responseText);

        const numeroMatch = responseText.match(/<Numero>(\d+)<\/Numero>/);
        const codigoMatch = responseText.match(/<CodigoVerificacao>(\w+)<\/CodigoVerificacao>/);

        return {
            numeroNFSe: numeroMatch ? numeroMatch[1] : `NFSE-${Date.now()}`,
            codigoVerificacao: codigoMatch ? codigoMatch[1] : Math.random().toString(36).substring(2, 10).toUpperCase(),
            urlPDF: '',
            urlXML: '',
        };
    }

    private async sendToPlugNotas(data: NFSeData): Promise<{
        numeroNFSe: string;
        codigoVerificacao: string;
        urlPDF: string;
        urlXML: string;
    }> {
        const apiKey = this.config.apiKey || '';
        
        if (!apiKey) {
            throw new Error('API Key do PlugNotas é necessária');
        }

        const ambiente = this.config.environment === 'homologacao' ? 'homologacao' : 'producao';
        
        const cnpjCpf = (this.company.cnpj || this.company.cpf || '').replace(/\D/g, '');
        const inscricaoMunicipal = this.company.inscricaoMunicipal || '';

        const aliqIss = parseFloat(this.config.aliqIss) || 5;
        const valorServico = data.invoice?.value || 0;
        const valorIss = valorServico * (aliqIss / 100);

        const idIntegracao = `NFSE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const tomadorCpfCnpj = (data.client?.cpf || data.client?.cnpj || '').replace(/\D/g, '');
        
        const plugNotasPayload = {
            idIntegracao: idIntegracao,
            naturezaTributacao: 1,
            prestador: {
                cpfCnpj: cnpjCpf,
                inscricaoMunicipal: inscricaoMunicipal,
            },
            tomador: {
                cpfCnpj: tomadorCpfCnpj,
                razaoSocial: data.client?.name || 'CONSUMIDOR',
                email: data.client?.email || '',
                telefone: {
                    ddd: '',
                    numero: '',
                },
                endereco: {
                    tipoLogradouro: '',
                    logradouro: this.company.address || '',
                    numero: this.company.number || 'S/N',
                    complemento: '',
                    tipoBairro: '',
                    bairro: this.company.neighborhood || '',
                    codigoPais: '1058',
                    descricaoPais: 'Brasil',
                    codigoCidade: this.config.cityCode,
                    descricaoCidade: '',
                    estado: this.company.state || 'BA',
                    cep: (this.company.zipCode || '').replace(/\D/g, ''),
                },
            },
            servico: [
                {
                    codigo: this.config.serviceCode || '0104',
                    discriminacao: data.service?.description || 'Serviço de beleza e cuidados pessoais',
                    iss: {
                        tipoTributacao: 3,
                        exigibilidade: 1,
                        retido: false,
                        aliquota: aliqIss,
                        valor: valorIss,
                        valorRetido: 0,
                    },
                    valor: {
                        servico: valorServico,
                        baseCalculo: valorServico,
                        deducoes: 0,
                        descontoCondicionado: 0,
                        descontoIncondicionado: 0,
                        liquido: valorServico,
                    },
                },
            ],
            cidadePrestacao: {
                codigo: this.config.cityCode,
            },
        };

        console.log('PlugNotas payload:', JSON.stringify(plugNotasPayload, null, 2));

        if (!functions) {
            throw new Error('Firebase Functions não está disponível');
        }

        try {
            const functionUrl = `https://southamerica-east1-julianamirandaconcept.cloudfunctions.net/emitNFSe`;
            
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider: 'plugnotas',
                    payload: plugNotasPayload,
                    apiKey,
                    environment: ambiente,
                    cityCode: this.config.cityCode,
                    serviceCode: this.config.serviceCode || '0104',
                    aliqIss: this.config.aliqIss || '5',
                }),
            });

            const result = await response.json();
            console.log('NFSe response:', result);

            if (result.success) {
                return {
                    numeroNFSe: result.numeroNFSe,
                    codigoVerificacao: result.codigoVerificacao,
                    urlPDF: result.urlPDF,
                    urlXML: result.urlXML,
                };
            }

            throw new Error(result.error || 'Erro ao emitir NFSe via Cloud Function');
        } catch (error) {
            console.error('PlugNotas error:', error);
            throw error instanceof Error ? error : new Error('Erro desconhecido no PlugNotas');
        }
    }

    async cancel(nfseNumber: string, reason: string): Promise<NFSeResult> {
        console.log('Cancelando NFSe:', nfseNumber, 'Motivo:', reason);

        if (this.provider === 'simplified') {
            return { success: true, nfseNumber };
        }

        return { success: false, error: 'Cancelamento em desenvolvimento' };
    }

    async consult(nfseNumber: string): Promise<NFSeResult> {
        console.log('Consultando NFSe:', nfseNumber);
        return { success: false, error: 'Consulta em desenvolvimento' };
    }
}

export function createNFSeService(config: NFSeConfig, company: CompanyData): NFSeService | null {
    if (!config.enabled) return null;
    return new NFSeService(config, company);
}

export function processCertificateFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
        };

        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
    });
}

export function validateCertificateFile(file: File): { valid: boolean; error?: string } {
    const allowedExtensions = ['.pfx', '.p12'];

    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(extension)) {
        return { valid: false, error: 'Arquivo deve ser .pfx ou .p12' };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return { valid: false, error: 'Arquivo deve ter menos de 10MB' };
    }

    return { valid: true };
}
