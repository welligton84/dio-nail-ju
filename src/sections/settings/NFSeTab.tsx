import { FileText, FileKey, CheckCircle2, Upload, Key, Settings as SettingsIcon } from 'lucide-react';
import type { NFSeConfig } from '../../contexts/SettingsContext';

interface NFSeTabProps {
    nfse: NFSeConfig;
    handleNFSeChange: (field: keyof NFSeConfig, value: string | boolean | null) => void;
    handleCertificateUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleRemoveCertificate: () => void;
}

export function NFSeTab({ nfse, handleNFSeChange, handleCertificateUpload, handleRemoveCertificate }: NFSeTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Configuração NFSe</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure a emissão automática de notas fiscais</p>
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Emitir NFSe automaticamente</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quando habilitado, notas fiscais serão emitidas automaticamente após o pagamento
                    </p>
                </div>
                <button
                    onClick={() => handleNFSeChange('enabled', !nfse.enabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${nfse.enabled ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${nfse.enabled ? 'left-7' : 'left-1'
                        }`} />
                </button>
            </div>

            {nfse.enabled && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Provedor de NFSe
                        </label>
                        <select
                            value={nfse.provider}
                            onChange={(e) => handleNFSeChange('provider', e.target.value)}
                            className="input-professional"
                        >
                            <option value="simplified">Modo Teste (Sem Certificado)</option>
                            <option value="national">Sistema Nacional NFS-e (Produção)</option>
                            <option value="national_homolog">Sistema Nacional NFS-e (Homologação)</option>
                            <option value="webiss_juazeiro">WebISS Juazeiro BA</option>
                            <option value="isss">ISSS Salvador</option>
                            <option value="focusnfe">Focus NFe (Pago)</option>
                            <option value="plugnotas">PlugNotas (TecnoSpeed)</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {nfse.provider === 'simplified' && 'Sem necessidade de certificado. Para testes.'}
                            {nfse.provider === 'national' && 'Requer certificado digital ICP-Brasil A1'}
                            {nfse.provider === 'national_homolog' && 'Ambiente de testes do gov.br - Requer certificado'}
                            {nfse.provider === 'webiss_juazeiro' && 'WebISS Juazeiro BA - Requer certificado'}
                            {nfse.provider === 'isss' && 'Requer certificado digital (Prefeitura de Salvador)'}
                            {nfse.provider === 'focusnfe' && 'Serviço pago - Requer token API (R$ 179/mês)'}
                            {nfse.provider === 'plugnotas' && 'API da TecnoSpeed - Requer API Key'}
                        </p>
                    </div>

                    {(nfse.provider === 'national' || nfse.provider === 'national_homolog' || nfse.provider === 'webiss_juazeiro' || nfse.provider === 'isss') && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <FileKey className="w-4 h-4 inline mr-2" />
                                Certificado Digital ICP-Brasil
                            </label>

                            {nfse.certificate ? (
                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                {nfse.certificateName}
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                Certificado carregado
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCertificate}
                                        className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                        Remover
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Clique para carregar</span> ou arraste o arquivo
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                Arquivos .pfx ou .p12 (até 10MB)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pfx,.p12"
                                            onChange={handleCertificateUpload}
                                        />
                                    </label>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                                        O certificado é armazenado localmente no navegador e enviado apenas para a API da prefeitura durante a emissão.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {(nfse.provider === 'national' || nfse.provider === 'national_homolog' || nfse.provider === 'webiss_juazeiro' || nfse.provider === 'isss') && nfse.certificate && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-medium">
                                <Key className="w-4 h-4 inline mr-2 text-purple-500" />
                                Senha do Certificado
                            </label>
                            <input
                                type="password"
                                value={nfse.certificatePassword || ''}
                                onChange={(e) => handleNFSeChange('certificatePassword', e.target.value)}
                                placeholder="Digite a senha do certificado .pfx"
                                className="input-professional"
                                autoComplete="new-password"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Necessária para extrair a chave privada e assinar digitalmente as notas.
                            </p>
                        </div>
                    )}

                    {nfse.provider === 'focusnfe' && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Key className="w-4 h-4 inline mr-2" />
                                    Token API Focus NFe
                                </label>
                                <input
                                    id="nfse-api-key"
                                    name="nfseApiKey"
                                    type="password"
                                    value={nfse.apiKey || ''}
                                    onChange={(e) => handleNFSeChange('apiKey', e.target.value)}
                                    placeholder="Cole seu token da Focus NFe"
                                    className="input-professional"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <SettingsIcon className="w-4 h-4 inline mr-2" />
                                    Ambiente
                                </label>
                                <select
                                    id="nfse-environment"
                                    name="nfseEnvironment"
                                    value={nfse.environment || 'producao'}
                                    onChange={(e) => handleNFSeChange('environment', e.target.value)}
                                    className="input-professional"
                                >
                                    <option value="producao">Produção</option>
                                    <option value="homologacao">Homologação (Testes)</option>
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Use Homologação para testar antes de emitir notas reais.
                                </p>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                O token pode ser gerado no painel da Focus NFe. Custa R$ 179/mês.
                            </p>
                        </div>
                    )}

                    {nfse.provider === 'plugnotas' && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Key className="w-4 h-4 inline mr-2" />
                                    API Key PlugNotas
                                </label>
                                <input
                                    id="nfse-plugnotas-api-key"
                                    name="nfsePlugnotasApiKey"
                                    type="password"
                                    value={nfse.apiKey || ''}
                                    onChange={(e) => handleNFSeChange('apiKey', e.target.value)}
                                    placeholder="Cole sua API Key do PlugNotas"
                                    className="input-professional"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <SettingsIcon className="w-4 h-4 inline mr-2" />
                                    Ambiente
                                </label>
                                <select
                                    id="nfse-plugnotas-environment"
                                    name="nfsePlugnotasEnvironment"
                                    value={nfse.environment || 'producao'}
                                    onChange={(e) => handleNFSeChange('environment', e.target.value)}
                                    className="input-professional"
                                >
                                    <option value="producao">Produção</option>
                                    <option value="homologacao">Homologação (Testes)</option>
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Use Homologação para testar antes de emitir notas reais.
                                </p>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                A API Key pode ser obtida no painel do PlugNotas. Consulte os planos em plugnotas.com.br.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nfse-city-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Código do Município (IBGE)
                            </label>
                            <input
                                id="nfse-city-code"
                                name="nfseCityCode"
                                type="text"
                                value={nfse.cityCode}
                                onChange={(e) => handleNFSeChange('cityCode', e.target.value)}
                                placeholder="2918407 (Juazeiro)"
                                className="input-professional"
                            />
                        </div>

                        <div>
                            <label htmlFor="nfse-service-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Código do Serviço (ISS)
                            </label>
                            <input
                                id="nfse-service-code"
                                name="nfseServiceCode"
                                type="text"
                                value={nfse.serviceCode}
                                onChange={(e) => handleNFSeChange('serviceCode', e.target.value)}
                                placeholder="0104"
                                className="input-professional"
                            />
                        </div>

                        <div>
                            <label htmlFor="nfse-cnae" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNAE</label>
                            <input
                                id="nfse-cnae"
                                name="nfseCnaeCode"
                                type="text"
                                value={nfse.cnaeCode}
                                onChange={(e) => handleNFSeChange('cnaeCode', e.target.value)}
                                placeholder="9602"
                                className="input-professional"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="nfse-aliq-iss" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aliquota ISS (%)</label>
                        <input
                            id="nfse-aliq-iss"
                            name="nfseAliqIss"
                            type="text"
                            value={nfse.aliqIss}
                            onChange={(e) => handleNFSeChange('aliqIss', e.target.value)}
                            placeholder="5"
                            className="input-professional"
                        />
                    </div>

                    <div className="md:col-span-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Nota:</strong> Para emitir NFS-e real, você precisará de um certificado digital ICP-Brasil (A1).
                            Configure o provedor adequado e adicione o certificado quando disponíveis.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
