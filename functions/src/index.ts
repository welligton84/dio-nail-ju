import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';
import axios from 'axios';
import cors from 'cors';

interface ServiceData {
    name: string;
}

interface RoleData {
    name: string;
    permissions: string[];
}

// Configurações globais
setGlobalOptions({ region: 'southamerica-east1' });

admin.initializeApp();

// Configurações das APIs (Devem ser configuradas no Firebase Console)
// Nota: Em v2, recomenda-se o uso de Secrets Manager para chaves de API
const SENDGRID_API_KEY = process.env.SENDGRID_KEY || '';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Notificação de confirmação de agendamento
 */
export const onAppointmentUpdate = onDocumentUpdated('appointments/{appointmentId}', async (event) => {
    const newData = event.data?.after.data();
    const oldData = event.data?.before.data();

    if (!newData || !oldData) return;

    // Só envia se o status mudou para 'confirmed'
    if (newData.status === 'confirmed' && oldData.status !== 'confirmed') {
        const { clientName, clientId, date, time, services, totalValue } = newData;

        try {
            // 1. Buscar telefone e email do cliente no Firestore
            const clientDoc = await admin.firestore().collection('clients').doc(clientId).get();
            const clientData = clientDoc.data();

            if (!clientData) return;

            const clientEmail = clientData.email;
            const clientPhone = clientData.phone?.replace(/\D/g, '');
            const dateFormatted = new Date(date).toLocaleDateString('pt-BR');

            // --- LOGICA DE E-MAIL (SENDGRID) ---
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
                            <p><strong>Serviços:</strong> ${services.map((s: ServiceData) => s.name).join(', ')}</p>
                            <p><strong>Total:</strong> R$ ${totalValue.toFixed(2)}</p>
                            <hr style="border: 0; border-top: 1px solid #eee;">
                            <p style="font-size: 12px; color: #888;">Este é um e-mail automático. Caso precise cancelar, entre em contato conosco.</p>
                        </div>
                    `,
                };
                await sgMail.send(msg);
                console.log(`Email enviado para ${clientEmail}`);
            }

            // --- LOGICA DE WHATSAPP (CLOUD API) ---
            if (clientPhone && WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
                const waPhone = clientPhone.length === 11 || clientPhone.length === 10 ? `55${clientPhone}` : clientPhone;

                await axios.post(
                    `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
                    {
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
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`WhatsApp enviado para ${waPhone}`);
            }

        } catch (error) {
            console.error('Erro ao processar notificações:', error);
        }
    }
});

/**
 * Criação de usuário administrativo
 */
export const createUserAuth = onCall(async (request) => {
    const { data, auth } = request;

    if (!auth) {
        throw new HttpsError('unauthenticated', 'Apenas usuários autenticados podem criar outros usuários.');
    }

    const { email, password, name, role } = data;

    if (!email || !password || !name) {
        throw new HttpsError('invalid-argument', 'E-mail, senha e nome são obrigatórios.');
    }

    try {
        // 1. Check if the requester is admin
        const requesterDoc = await admin.firestore().collection('users').doc(auth.uid).get();
        const requesterData = requesterDoc.data();

        // Allow if role is 'admin' OR if role has 'all' permission (custom admin roles)
        const isAdminRole = requesterData?.role === 'admin';
        const hasAllPermission = requesterData?.role && (
            requesterData.role === 'admin' || 
            requesterData.role.toLowerCase().includes('admin') ||
            requesterData.role === 'Administrador'
        );
        
        // Also check in settings if the role has 'all' permission
        let hasFullAccess = isAdminRole || hasAllPermission;
        if (!hasFullAccess) {
            try {
                const settingsDoc = await admin.firestore().collection('settings').doc('general').get();
                const settingsData = settingsDoc.data();
                const roles = settingsData?.roles || [];
                const userRole = roles.find((r: RoleData) => r.name.toLowerCase() === (requesterData?.role || '').toLowerCase());
                if (userRole?.permissions?.includes('all')) {
                    hasFullAccess = true;
                }
            } catch {
                // If settings doesn't exist, fallback to role check
            }
        }

        if (!hasFullAccess) {
            throw new HttpsError('permission-denied', 'Apenas administradores podem criar novos usuários.');
        }

        // 2. Create the user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
        });

        // 3. Create the profile in Firestore
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            name,
            email,
            role: role || 'employee',
            active: true,
            createdAt: new Date().toISOString()
        });

        return { success: true, uid: userRecord.uid };
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        if (error instanceof HttpsError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : 'Erro interno ao criar usuário';
        throw new HttpsError('internal', errorMessage);
    }
});

/**
 * Emissão de NFSe via PlugNotas (resolves CORS)
 */
const corsHandler = cors({ origin: true });

export const emitNFSe = onRequest(async (req, res) => {
    await corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        const { provider, payload, apiKey, environment } = req.body?.data || req.body || {};

        console.log('Provider:', provider);
        console.log('Has payload:', !!payload);
        console.log('Payload keys:', payload ? Object.keys(payload) : 'none');

        if (!provider || !payload) {
            console.log('Validation failed: provider or payload missing');
            console.log('req.body:', JSON.stringify(req.body));
            res.status(400).json({ error: 'Provider e payload são obrigatórios.', received: req.body });
            return;
        }

        if (provider !== 'plugnotas') {
            console.log('Validation failed: wrong provider');
            res.status(400).json({ error: 'Apenas PlugNotas é suportado.' });
            return;
        }

        if (!apiKey) {
            console.log('Validation failed: API key missing');
            res.status(400).json({ error: 'API Key é obrigatória.' });
            return;
        }

        const ambiente = environment === 'homologacao' ? 'sandbox' : 'producao';
        const baseUrl = ambiente === 'sandbox' ? 'https://api.sandbox.plugnotas.com.br' : 'https://api.plugnotas.com.br';
        const endpoint = `${baseUrl}/nfse`;

        console.log('Emitindo NFSe via Cloud Function:', endpoint, 'Ambiente:', ambiente);

        try {
            // PlugNotas expects an array of documents
            const documents = [payload];
            
            const response = await axios.post(endpoint, documents, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-KEY': apiKey,
                },
                timeout: 60000,
            });

            console.log('PlugNotas response:', response.status, JSON.stringify(response.data));

            if (response.data.sucesso || response.data.status === 'autorizado') {
                res.json({
                    success: true,
                    numeroNFSe: response.data.numero || response.data.numeroNfse || `NFSE-${Date.now()}`,
                    codigoVerificacao: response.data.codigoVerificacao || Math.random().toString(36).substring(2, 10).toUpperCase(),
                    urlPDF: response.data.urlDanfe || response.data.urlPdf || '',
                    urlXML: response.data.urlXml || response.data.xml || '',
                });
            } else {
                res.status(400).json({ error: response.data.mensagem || response.data.erro || 'Erro desconhecido' });
            }
        } catch (error: unknown) {
            console.error('Erro ao emitir NFSe:', error);
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const responseData = error.response?.data;
                const msg = responseData?.error || responseData?.mensagem || responseData?.erro || error.message;
                console.log('PlugNotas error response:', JSON.stringify(responseData));
                res.status(500).json({ 
                    error: `Erro ${status}: ${msg}`, 
                    detalhes: typeof responseData === 'object' ? JSON.stringify(responseData) : responseData,
                    statusCode: status 
                });
            } else {
                res.status(500).json({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
            }
        }
    });
});

/**
 * Busca configurações do NFSe (com secrets) - apenas para admins
 * P0.2: Proteger secrets no Firestore
 */
export const getNFSeConfig = onCall(async (request) => {
    const { auth } = request;

    if (!auth) {
        throw new HttpsError('unauthenticated', 'Apenas usuários autenticados podem acessar.');
    }

    try {
        const userDoc = await admin.firestore().collection('users').doc(auth.uid).get();
        const userData = userDoc.data();

        const isAdminRole = userData?.role === 'admin';
        const hasAllPermission = userData?.role === 'Administrador' || 
            (userData?.role && userData.role.toLowerCase().includes('admin'));

        if (!isAdminRole && !hasAllPermission) {
            throw new HttpsError('permission-denied', 'Apenas administradores podem acessar configurações do NFSe.');
        }

        // Buscar settings com secrets
        const settingsDoc = await admin.firestore().collection('settings').doc('general').get();
        const settingsData = settingsDoc.data();
        
        if (!settingsData?.nfse) {
            return { nfse: null };
        }

        return {
            nfse: {
                enabled: settingsData.nfse.enabled,
                provider: settingsData.nfse.provider,
                environment: settingsData.nfse.environment,
                cityCode: settingsData.nfse.cityCode,
                serviceCode: settingsData.nfse.serviceCode,
                cnaeCode: settingsData.nfse.cnaeCode,
                aliqIss: settingsData.nfse.aliqIss,
                certificate: settingsData.nfse.certificate,
                certificatePassword: settingsData.nfse.certificatePassword,
                apiKey: settingsData.nfse.apiKey
            }
        };
    } catch (error) {
        console.error('Erro ao buscar config NFSe:', error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError('internal', 'Erro ao buscar configurações do NFSe.');
    }
});
