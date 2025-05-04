import nodemailer from 'nodemailer';
import Redis from 'ioredis';
import admin from 'firebase-admin';

// Initialisation de Firebase Admin si pas déjà fait
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

class NotificationService {
  constructor() {
    this.io = null;
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    });
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Middleware d'authentification avec Firebase
  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;
      
      // Vérifier le token Firebase
      const decodedToken = await admin.auth().verifyIdToken(token);
      socket.user = {
        id: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user' // Rôle personnalisé si défini
      };
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  }

  // Récupérer l'email d'un utilisateur depuis Firebase
  async getUserEmail(userId) {
    try {
      const userRecord = await admin.auth().getUser(userId);
      return userRecord.email;
    } catch (error) {
      console.error('Failed to get user email:', error);
      return null;
    }
  }

  // Créer une notification
  async createNotification(data) {
    const {
      recipientId,
      title,
      message,
      type,
      relatedId,
      priority = 'normal'
    } = data;

    const notification = {
      id: `notif_${Date.now()}_${recipientId}`,
      recipientId,
      title,
      message,
      type,
      relatedId,
      priority,
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    // Sauvegarder la notification dans Redis
    await this.saveNotification(notification);

    // Envoyer la notification in-app en temps réel
    this.sendInAppNotification(notification);

    // Envoyer une notification email si nécessaire
    if (priority === 'high' || type === 'email') {
      this.sendEmailNotification(notification);
    }

    return notification;
  }

  // Envoyer une notification in-app via Socket.IO
  sendInAppNotification(notification) {
    this.io.to(`user:${notification.recipientId}`).emit('notification', notification);
  }

  // Sauvegarder une notification dans Redis
  async saveNotification(notification) {
    const key = `notifications:${notification.recipientId}`;
    await this.redis.lpush(key, JSON.stringify(notification));
    // Garder un historique des 100 dernières notifications
    await this.redis.ltrim(key, 0, 99);
  }

  // Récupérer les notifications d'un utilisateur
  async getNotifications(userId, page = 1, limit = 20) {
    const key = `notifications:${userId}`;
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    const notifications = await this.redis.lrange(key, start, end);
    return notifications.map(notif => JSON.parse(notif));
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(userId, notificationId) {
    const key = `notifications:${userId}`;
    const notifications = await this.redis.lrange(key, 0, -1);
    
    const updatedNotifications = notifications.map(notif => {
      const parsed = JSON.parse(notif);
      if (parsed.id === notificationId) {
        parsed.status = 'read';
      }
      return JSON.stringify(parsed);
    });

    // Remplacer toutes les notifications
    await this.redis.del(key);
    if (updatedNotifications.length > 0) {
      await this.redis.rpush(key, ...updatedNotifications);
    }

    // Informer le client
    this.io.to(`user:${userId}`).emit('notification-updated', notificationId);
  }

  // Envoyer une notification par email
  async sendEmailNotification(notification) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.SMTP_FROM}>`,
        to: await this.getUserEmail(notification.recipientId),
        subject: notification.title,
        html: this.generateEmailTemplate(notification)
      };

      await this.emailTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  }

  // Générer un template d'email
  generateEmailTemplate(notification) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4a90e2; color: white; padding: 10px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${notification.title}</h2>
            </div>
            <div class="content">
              <p>${notification.message}</p>
              <p><a href="${process.env.FRONTEND_URL}/notifications" class="button">Voir la notification</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Émettre une notification système
  async notifySystem(type, message) {
    this.io.emit('system-notification', {
      type,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

export default new NotificationService();