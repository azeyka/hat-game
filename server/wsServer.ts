import { Server } from 'ws';
import { createConnection } from 'typeorm';
import { User } from './entities/User';
import { Room } from './entities/Room';
import { Round } from './entities/Round';
import { RoundWord } from './entities/RoundWord';
import { Word } from './entities/Word';

interface WSClient extends WebSocket {
    userId?: string;
}

// (Сюда вставлен весь код wsServer.ts с логикой раундов и таймеров из предыдущих сообщений)
