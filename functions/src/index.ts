import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';
import axios from 'axios';

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
                            <p><strong>Serviços:</strong> ${services.map((s: any) => s.name).join(', ')}</p>
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

        if (!requesterData || requesterData.role !== 'admin') {
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
    } catch (error: any) {
        console.error('Erro ao criar usuário:', error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError('internal', error.message || 'Erro interno ao criar usuário');
    }
});
