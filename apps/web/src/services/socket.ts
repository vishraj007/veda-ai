import { io, Socket } from 'socket.io-client';
import { WS_EVENTS } from '@vedaai/shared';
import type { GenerationProgress } from '@vedaai/shared';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

let socket: Socket | null = null;

/** Get or create the socket connection */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

/** Join an assignment room to receive updates */
export function joinAssignmentRoom(assignmentId: string): void {
  const s = getSocket();
  s.emit(WS_EVENTS.JOIN_ROOM, assignmentId);
}

/** Leave an assignment room */
export function leaveAssignmentRoom(assignmentId: string): void {
  const s = getSocket();
  s.emit(WS_EVENTS.LEAVE_ROOM, assignmentId);
}

/** Subscribe to generation progress events */
export function onGenerationProgress(callback: (data: GenerationProgress) => void): () => void {
  const s = getSocket();
  s.on(WS_EVENTS.GENERATION_PROGRESS, callback);
  return () => { s.off(WS_EVENTS.GENERATION_PROGRESS, callback); };
}

/** Subscribe to generation complete */
export function onGenerationCompleted(callback: (data: GenerationProgress & { paper?: unknown }) => void): () => void {
  const s = getSocket();
  s.on(WS_EVENTS.GENERATION_COMPLETED, callback);
  return () => { s.off(WS_EVENTS.GENERATION_COMPLETED, callback); };
}

/** Subscribe to generation failure */
export function onGenerationFailed(callback: (data: GenerationProgress) => void): () => void {
  const s = getSocket();
  s.on(WS_EVENTS.GENERATION_FAILED, callback);
  return () => { s.off(WS_EVENTS.GENERATION_FAILED, callback); };
}

/** Disconnect socket */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
