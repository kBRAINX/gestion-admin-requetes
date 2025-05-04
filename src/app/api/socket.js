import { Server } from 'socket.io';
import notificationService from '../../services/notificationService';

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  notificationService.initialize(io);
  res.socket.server.io = io;
  res.end();
}