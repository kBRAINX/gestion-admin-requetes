import nodemailer from 'nodemailer';

// Configuration SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true pour 465, false pour d'autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Templates d'email
const emailTemplates = {
  requestReceived: {
    subject: 'Nouvelle demande reçue',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Nouvelle demande administrative</h2>
        <p>Bonjour,</p>
        <p>Une nouvelle demande a été soumise et nécessite votre attention.</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Détails de la demande :</h3>
          <p><strong>Type :</strong> ${data.type}</p>
          <p><strong>Émetteur :</strong> ${data.userName}</p>
          <p><strong>Email :</strong> ${data.userEmail}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <p>Veuillez vous connecter au portail pour traiter cette demande.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/service/pending"
           style="display: inline-block; background-color: #2563EB; color: white; padding: 10px 20px;
                  text-decoration: none; border-radius: 5px; margin-top: 20px;">
           Voir la demande
        </a>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Ceci est un email automatique. Merci de ne pas répondre directement à ce message.
        </p>
      </div>
    `
  },
  requestStatusUpdate: {
    subject: (status) => `Mise à jour de votre demande - ${status}`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Mise à jour de votre demande</h2>
        <p>Bonjour ${data.userName},</p>
        <p>Le statut de votre demande a été mis à jour.</p>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Détails :</h3>
          <p><strong>Type de demande :</strong> ${data.type}</p>
          <p><strong>Nouveau statut :</strong> <span style="color: ${data.status === 'approved' ? '#059669' : data.status === 'rejected' ? '#DC2626' : '#2563EB'}; font-weight: bold;">${getStatusLabel(data.status)}</span></p>
          ${data.comment ? `<p><strong>Commentaire :</strong> ${data.comment}</p>` : ''}
        </div>

        <p>Vous pouvez consulter le détail de votre demande en vous connectant au portail.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/history"
           style="display: inline-block; background-color: #2563EB; color: white; padding: 10px 20px;
                  text-decoration: none; border-radius: 5px; margin-top: 20px;">
           Voir ma demande
        </a>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Ceci est un email automatique. Merci de ne pas répondre directement à ce message.
        </p>
      </div>
    `
  }
};

function getStatusLabel(status) {
  const statusLabels = {
    pending: 'En attente',
    in_progress: 'En cours',
    approved: 'Approuvée',
    rejected: 'Rejetée',
  };
  return statusLabels[status] || status;
}

export const sendEmail = async (type, to, data) => {
  try {
    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Template ${type} not found`);
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: typeof template.subject === 'function' ? template.subject(data.status) : template.subject,
      html: template.html(data),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// Fonction pour envoyer une notification aux administrateurs
export const sendAdminNotification = async (requestData) => {
  // Récupérer les emails des administrateurs du service concerné
  const serviceQuery = await db.collection('services')
    .doc(requestData.currentServiceId)
    .get();

  const serviceData = serviceQuery.data();
  const adminEmails = [serviceData.email];

  // Récupérer les emails des membres du service
  if (serviceData.members && serviceData.members.length > 0) {
    const memberPromises = serviceData.members.map(memberId =>
      db.collection('users').doc(memberId).get()
    );
    const memberDocs = await Promise.all(memberPromises);
    const memberEmails = memberDocs
      .filter(doc => doc.exists)
      .map(doc => doc.data().email);

    adminEmails.push(...memberEmails);
  }

  // Envoyer l'email à tous les administrateurs
  const sendPromises = adminEmails.map(email =>
    sendEmail('requestReceived', email, {
      type: requestData.type,
      userName: requestData.userName,
      userEmail: requestData.userEmail,
    })
  );

  return Promise.all(sendPromises);
};

// Fonction pour notifier l'utilisateur du changement de statut
export const sendStatusUpdateNotification = async (requestData, newStatus, comment = '') => {
  await sendEmail('requestStatusUpdate', requestData.userEmail, {
    type: requestData.type,
    userName: requestData.userName,
    status: newStatus,
    comment: comment,
  });
};