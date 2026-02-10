"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserAuth = exports.onAppointmentUpdate = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = __importStar(require("firebase-admin"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const axios_1 = __importDefault(require("axios"));
(0, v2_1.setGlobalOptions)({ region: 'southamerica-east1' });
admin.initializeApp();
const SENDGRID_API_KEY = process.env.SENDGRID_KEY || '';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
if (SENDGRID_API_KEY) {
    mail_1.default.setApiKey(SENDGRID_API_KEY);
}
exports.onAppointmentUpdate = (0, firestore_1.onDocumentUpdated)('appointments/{appointmentId}', async (event) => {
    var _a, _b, _c;
    const newData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
    const oldData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.before.data();
    if (!newData || !oldData)
        return;
    if (newData.status === 'confirmed' && oldData.status !== 'confirmed') {
        const { clientName, clientId, date, time, services, totalValue } = newData;
        try {
            const clientDoc = await admin.firestore().collection('clients').doc(clientId).get();
            const clientData = clientDoc.data();
            if (!clientData)
                return;
            const clientEmail = clientData.email;
            const clientPhone = (_c = clientData.phone) === null || _c === void 0 ? void 0 : _c.replace(/\D/g, '');
            const dateFormatted = new Date(date).toLocaleDateString('pt-BR');
            if (clientEmail && SENDGRID_API_KEY) {
                const msg = {
                    to: clientEmail,
                    from: 'contato@julianamirandaconcept.com.br',
                    subject: 'Confirmação de Agendamento - Juliana Miranda Concept',
                    text: `Olá ${clientName}! Seu agendamento para o dia ${dateFormatted} às ${time} foi confirmado. Valor: R$ ${totalValue.toFixed(2)}. Te esperamos!`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #e91e63;">Olá ${clientName}! ✨</h2>
                            <p>Sua beleza tem hora marcada no <strong>Juliana Miranda Concept</strong>.</p>
                            <hr style="border: 0; border-top: 1px solid #eee;">
                            <p><strong>Data:</strong> ${dateFormatted}</p>
                            <p><strong>Horário:</strong> ${time}</p>
                            <p><strong>Serviços:</strong> ${services.map((s) => s.name).join(', ')}</p>
                            <p><strong>Total:</strong> R$ ${totalValue.toFixed(2)}</p>
                            <hr style="border: 0; border-top: 1px solid #eee;">
                            <p style="font-size: 12px; color: #888;">Este é um e-mail automático. Caso precise cancelar, entre em contato conosco.</p>
                        </div>
                    `,
                };
                await mail_1.default.send(msg);
                console.log(`Email enviado para ${clientEmail}`);
            }
            if (clientPhone && WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
                const waPhone = clientPhone.length === 11 || clientPhone.length === 10 ? `55${clientPhone}` : clientPhone;
                await axios_1.default.post(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                    messaging_product: 'whatsapp',
                    to: waPhone,
                    type: 'template',
                    template: {
                        name: 'confirmacao_agendamento',
                        language: { code: 'pt_BR' },
                        components: [
                            {
                                type: 'body',
                                parameters: [
                                    { type: 'text', text: clientName },
                                    { type: 'text', text: dateFormatted },
                                    { type: 'text', text: time }
                                ]
                            }
                        ]
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`WhatsApp enviado para ${waPhone}`);
            }
        }
        catch (error) {
            console.error('Erro ao processar notificações:', error);
        }
    }
});
exports.createUserAuth = (0, https_1.onCall)(async (request) => {
    const { data, auth } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'Apenas usuários autenticados podem criar outros usuários.');
    }
    const { email, password, name, role } = data;
    if (!email || !password || !name) {
        throw new https_1.HttpsError('invalid-argument', 'E-mail, senha e nome são obrigatórios.');
    }
    try {
        const requesterDoc = await admin.firestore().collection('users').doc(auth.uid).get();
        const requesterData = requesterDoc.data();
        if (!requesterData || requesterData.role !== 'admin') {
            throw new https_1.HttpsError('permission-denied', 'Apenas administradores podem criar novos usuários.');
        }
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            name,
            email,
            role: role || 'employee',
            active: true,
            createdAt: new Date().toISOString()
        });
        return { success: true, uid: userRecord.uid };
    }
    catch (error) {
        console.error('Erro ao criar usuário:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        throw new https_1.HttpsError('internal', error.message || 'Erro interno ao criar usuário');
    }
});
//# sourceMappingURL=index.js.map