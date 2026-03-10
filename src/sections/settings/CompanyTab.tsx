import { Building2, Loader2 } from 'lucide-react';
import { formatCNPJ, formatCPF } from '../../utils/format';
import type { CompanyData } from '../../contexts/SettingsContext';

interface CompanyTabProps {
    company: CompanyData;
    handleCompanyChange: (field: keyof CompanyData, value: string) => void;
    cepLoading: boolean;
}

export function CompanyTab({ company, handleCompanyChange, cepLoading }: CompanyTabProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                    <Building2 className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Dados da Empresa</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Informações que aparecem nas notas fiscais</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome / Razão Social
                    </label>
                    <input
                        id="company-name"
                        name="companyName"
                        type="text"
                        autoComplete="organization"
                        value={company.name}
                        onChange={(e) => handleCompanyChange('name', e.target.value)}
                        placeholder="Juliana Miranda concept"
                        className="input-professional"
                    />
                </div>

                <div>
                    <label htmlFor="company-cnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
                    <input
                        id="company-cnpj"
                        name="companyCnpj"
                        type="text"
                        value={company.cnpj ? formatCNPJ(company.cnpj) : ''}
                        onChange={(e) => handleCompanyChange('cnpj', e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="input-professional"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="company-inscricao-municipal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inscrição Municipal</label>
                        <input
                            id="company-inscricao-municipal"
                            name="inscricaoMunicipal"
                            type="text"
                            value={company.inscricaoMunicipal || ''}
                            onChange={(e) => handleCompanyChange('inscricaoMunicipal', e.target.value)}
                            placeholder="123456"
                            className="input-professional"
                        />
                    </div>

                    <div>
                        <label htmlFor="company-inscricao-estadual" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inscrição Estadual</label>
                        <input
                            id="company-inscricao-estadual"
                            name="inscricaoEstadual"
                            type="text"
                            value={company.inscricaoEstadual || ''}
                            onChange={(e) => handleCompanyChange('inscricaoEstadual', e.target.value)}
                            placeholder="12345678"
                            className="input-professional"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="company-cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPF (MEI)</label>
                    <input
                        id="company-cpf"
                        name="companyCpf"
                        type="text"
                        value={company.cpf ? formatCPF(company.cpf) : ''}
                        onChange={(e) => handleCompanyChange('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                        className="input-professional"
                    />
                </div>

                <div>
                    <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                    <input
                        id="company-phone"
                        name="companyPhone"
                        type="tel"
                        autoComplete="tel"
                        value={company.phone}
                        onChange={(e) => handleCompanyChange('phone', e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="input-professional"
                    />
                </div>

                <div>
                    <label htmlFor="company-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                    <input
                        id="company-email"
                        name="companyEmail"
                        type="email"
                        autoComplete="email"
                        value={company.email}
                        onChange={(e) => handleCompanyChange('email', e.target.value)}
                        placeholder="contato@email.com"
                        className="input-professional"
                    />
                </div>

                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço</label>
                        <input
                            id="company-address"
                            name="companyAddress"
                            type="text"
                            value={company.address}
                            onChange={(e) => handleCompanyChange('address', e.target.value)}
                            placeholder="Rua, complemento"
                            className="input-professional"
                        />
                    </div>
                    <div>
                        <label htmlFor="company-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
                        <input
                            id="company-number"
                            name="companyNumber"
                            type="text"
                            value={company.number}
                            onChange={(e) => handleCompanyChange('number', e.target.value)}
                            placeholder="123"
                            className="input-professional"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="company-neighborhood" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bairro</label>
                    <input
                        id="company-neighborhood"
                        name="companyNeighborhood"
                        type="text"
                        value={company.neighborhood}
                        onChange={(e) => handleCompanyChange('neighborhood', e.target.value)}
                        placeholder="Bairro"
                        className="input-professional"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="company-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade</label>
                        <input
                            id="company-city"
                            name="companyCity"
                            type="text"
                            value={company.city}
                            onChange={(e) => handleCompanyChange('city', e.target.value)}
                            placeholder="Cidade"
                            className="input-professional"
                        />
                    </div>

                    <div>
                        <label htmlFor="company-state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                        <input
                            id="company-state"
                            name="companyState"
                            type="text"
                            value={company.state}
                            onChange={(e) => handleCompanyChange('state', e.target.value)}
                            placeholder="BA"
                            maxLength={2}
                            className="input-professional"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="company-zipcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CEP</label>
                    <div className="relative">
                        <input
                            id="company-zipcode"
                            type="text"
                            autoComplete="postal-code"
                            value={company.zipCode}
                            onChange={(e) => handleCompanyChange('zipCode', e.target.value)}
                            placeholder="00000-000"
                            className="input-professional pr-10"
                        />
                        {cepLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500 animate-spin" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
