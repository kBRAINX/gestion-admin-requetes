import notificationService from '../../services/notificationService';

export default async function handler(req, res) {
  const { action } = req.query;
  const { method } = req;

  switch (action) {
    case 'create':
      if (method === 'POST') {
        try {
          const notification = await notificationService.createNotification(req.body);
          res.status(201).json(notification);
        } catch (error) {
          res.status(500).json({ error: 'Failed to create notification' });
        }
      }
      break;

    case 'list':
      if (method === 'GET') {
        try {
          const { userId, page } = req.query;
          const notifications = await notificationService.getNotifications(userId, page);
          res.status(200).json(notifications);
        } catch (error) {
          res.status(500).json({ error: 'Failed to fetch notifications' });
        }
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}