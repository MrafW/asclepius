const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

require('dotenv').config();

(async () => {
    try {
        const server = Hapi.server({
            port: process.env.PORT || 3000,
            host: process.env.HOST || '0.0.0.0',
            routes: {
                cors: {
                    origin: ['*'],
                },
                payload: {
                    maxBytes: 1000000,
                },
            },
        });
    
        try {
            const model = await loadModel();
            server.app.model = model;
        } catch (error) {
            console.log('Failed to load model:', error);
            throw error;
        }
    
        server.route(routes);
    
        server.ext('onPreResponse', (request, h) => {
            const { response } = request;
    
            if (request.payload && request.payload.length > 1000000) {
                return h.response({
                    status: 'fail',
                    message: 'Payload content length greater than maximum allowed: 1000000',
                }).code(413);
            }
    
            if (response instanceof InputError) {
                return h.response({
                    status: 'fail',
                    message: response.message,
                }).code(response.statusCode);
            }
    
            if (response.isBoom) {
                const statusCode = response.output.statusCode;
                let message = response.message;
    
                if (statusCode === 400) {
                    message = 'Terjadi kesalahan dalam melakukan prediksi';
                }
    
                return h.response({
                    status: 'fail',
                    message,
                }).code(response.output.statusCode);
            }

            return h.continue;
        });

        await server.start();
        console.log(`Server start at: ${server.info.uri}`)
    } catch (err) {
        console.log('Error starting server:', err);
        process.exit(1);
    }
})();