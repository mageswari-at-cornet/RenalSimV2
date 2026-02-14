// Force reload trigger
import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { chatRoutes } from './routes/chat';
import { patientRoutes } from './routes/patients';

dotenv.config();

const server = Fastify({
    logger: true
});

server.register(cors, {
    origin: '*' // In production, this should be restricted to the frontend URL
});

server.register(chatRoutes);
server.register(patientRoutes);

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3001');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
