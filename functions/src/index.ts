import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import sgMail from '@sendgrid/mail';
import axios from 'axios';

admin.initializeApp();

// Configurações das APIs (Devem ser configuradas no Firebase Console)
const SENDGRID_API_KEY = functions.config().sendgrid?.key;
const WHATSAPP_TOKEN = functions.config().whatsapp?.token;
const WHATSAPP_PHONE_NUMBER_ID = functions.config().whatsapp?.phone_number_id;

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

export const onAppointmentUpdate = functions.firestore
    .document('appointments/{appointmentId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

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
                        from: 'contato@julianamirandaconcept.com.br', // Deve ser um remetente verificado no SendGrid
                        subject: 'Confirmação de Agendamento - Studio Nail Ju',
                        text: `Olá ${clientName}! Seu agendamento para o dia ${dateFormatted} às ${time} foi confirmado. Valor: R$ ${totalValue.toFixed(2)}. Te esperamos!`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                                <h2 style="color: #e91e63;">Olá ${clientName}! ✨</h2>
                                <p>Sua beleza tem hora marcada no <strong>Studio Nail Ju</strong>.</p>
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
                                name: 'confirmacao_agendamento', // Deve existir esse template aprovado na Meta
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
