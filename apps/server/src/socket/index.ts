import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { WS_EVENTS } from '@vedaai/shared';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let io: SocketIOServer | null = null;

/** Initialize Socket.io server attached to HTTP server */
export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join assignment-specific room for targeted updates
    socket.on(WS_EVENTS.JOIN_ROOM, (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      logger.debug(`Client ${socket.id} joined room assignment:${assignmentId}`);
    });

    socket.on(WS_EVENTS.LEAVE_ROOM, (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
      logger.debug(`Client ${socket.id} left room assignment:${assignmentId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

/** Emit an event to all clients in an assignment room */
export function emitToAssignment(assignmentId: string, event: string, data: unknown): void {
  if (io) {
    io.to(`assignment:${assignmentId}`).emit(event, data);
  }
}

/** Get the Socket.io server instance */
export function getIO(): SocketIOServer | null {
  return io;
}
