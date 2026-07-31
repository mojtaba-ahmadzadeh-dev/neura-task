import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  namespace: "/notifications",
  cors: {
    origin: "*",
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client Disconnected: ${client.id}`);
  }

  @SubscribeMessage("join")
  async joinRoom(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`user:${userId}`);

    client.emit("joined", {
      room: `user:${userId}`,
    });
  }

  @SubscribeMessage("leave")
  async leaveRoom(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`user:${userId}`);
  }

  sendToUser(userId: number, notification: any) {
    this.server.to(`user:${userId}`).emit("notification:new", notification);
  }

  updateNotification(userId: number, notification: any) {
    this.server.to(`user:${userId}`).emit("notification:update", notification);
  }

  deleteNotification(userId: number, notificationId: number) {
    this.server.to(`user:${userId}`).emit("notification:delete", {
      id: notificationId,
    });
  }

  unreadCount(userId: number, count: number) {
    this.server.to(`user:${userId}`).emit("notification:count", {
      count,
    });
  }
}
