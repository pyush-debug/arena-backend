import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Base WebSocket Gateway serving as a foundation for real-time features.
 * Features (e.g. Chat, Notifications) should extend or compose this.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    protected readonly logger: CustomLoggerService,
    protected readonly jwtService: JwtService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway Initialized', 'BaseGateway');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`, 'BaseGateway');
    try {
      const authHeader = client.handshake.headers.authorization;
      if (!authHeader) {
        throw new Error('Unauthorized: No authorization header provided');
      }
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify<{ franchise_id?: number }>(token);
      (client.data as Record<string, unknown>).user = decoded;

      // Join franchise room
      if (decoded.franchise_id) {
        client.join(`franchise_${decoded.franchise_id}`);
        this.logger.debug(
          `Client ${client.id} joined franchise_${decoded.franchise_id}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Unauthorized connection attempt: ${client.id}. Error: ${(error as Error).message}`,
        'BaseGateway',
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`, 'BaseGateway');
  }

  /**
   * Broadcasts an event to a specific franchise room.
   */
  broadcastToFranchise(
    franchiseId: number,
    event: string,
    payload: Record<string, unknown>,
  ) {
    this.server.to(`franchise_${franchiseId}`).emit(event, payload);
  }
}
