"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const realtime_service_1 = require("./realtime.service");
let RealtimeGateway = class RealtimeGateway {
    realtimeService;
    server;
    connectedClients = new Set();
    constructor(realtimeService) {
        this.realtimeService = realtimeService;
    }
    handleConnection(client) {
        console.log(`클라이언트 연결: ${client.id}`);
        this.connectedClients.add(client);
        this.sendRealtimeData(client);
    }
    handleDisconnect(client) {
        console.log(`클라이언트 연결 해제: ${client.id}`);
        this.connectedClients.delete(client);
    }
    async handleSubscribeRealtime(client) {
        console.log(`실시간 구독 요청: ${client.id}`);
        await this.sendRealtimeData(client);
    }
    handleUnsubscribeRealtime(client) {
        console.log(`실시간 구독 해제: ${client.id}`);
    }
    async sendRealtimeData(client) {
        try {
            const data = await this.realtimeService.getRealtimeData();
            client.emit('realtime-update', data);
        }
        catch (error) {
            console.error('실시간 데이터 전송 실패:', error);
            client.emit('realtime-error', { message: '데이터 조회 실패' });
        }
    }
    async broadcastRealtimeData() {
        if (this.connectedClients.size === 0)
            return;
        try {
            const data = await this.realtimeService.getRealtimeData();
            this.server.emit('realtime-update', data);
        }
        catch (error) {
            console.error('실시간 데이터 브로드캐스트 실패:', error);
        }
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe-realtime'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleSubscribeRealtime", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe-realtime'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleUnsubscribeRealtime", null);
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:4001',
                'https://admin.klk1.store',
                process.env.FRONTEND_URL
            ].filter(Boolean),
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map