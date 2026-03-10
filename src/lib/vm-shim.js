/**
 * Shim para o módulo 'vm' do Node.js no navegador.
 * Evita o uso de 'eval' do vm-browserify que causa alertas de segurança e falhas de CSP.
 */
export const createContext = (ctx) => ctx;
export const runInContext = (code, ctx) => {
    console.warn('[VM-Shim] runInContext chamado mas não implementado. Isso pode afetar assinaturas digitais avançadas.');
    return null;
};
export const runInNewContext = (code, ctx) => {
    console.warn('[VM-Shim] runInNewContext chamado mas não implementado.');
    return null;
};
export const Script = class {
    constructor(code) {
        this.code = code;
    }
    runInContext(ctx) {
        console.warn('[VM-Shim] Script.runInContext chamado.');
        return null;
    }
};

export default {
    createContext,
    runInContext,
    runInNewContext,
    Script
};
