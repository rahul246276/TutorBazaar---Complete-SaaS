const logger = require('../utils/logger');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join tutor room for personalized updates
    socket.on('join_tutor_room', (tutorId) => {
      socket.join(`tutor_${tutorId}`);
      logger.info(`Tutor ${tutorId} joined their room`);
    });

    // Join admin room
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      logger.info('Admin joined admin room');
    });

    // Handle lead unlock notification
    socket.on('lead_unlocked', (data) => {
      // Broadcast to admin
      io.to('admin_room').emit('lead_unlocked_notification', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Make io available globally for notifications
  global.io = io;
};

module.exports = socketHandler;
