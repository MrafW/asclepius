const predictClassification = require('../services/inferenceService');
const { v4: uuidv4 } = require('uuid');
const { storeData, getData } = require('../services/fireStore');
const Boom = require('@hapi/boom');

function createResponse(status, message, data = null) {
  return {
    status,
    message,
    data,
  };
}

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload;
    const { model } = request.server.app;

    if (!image) {
      return Boom.badRequest('Gambar tidak ditemukan dalam payload');
    }

    const { label, suggestion } = await predictClassification(model, image);

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    const data = {
      id,
      result: label,
      suggestion,
      createdAt,
    };

    await storeData(id, data);

    return h.response(createResponse('success', 'Model is predicted successfully', data)).code(201);
  } catch (error) {
    console.error('Prediction error:', error);
    return Boom.badRequest('Terjadi kesalahan dalam melakukan prediksi');
  }
}

async function getHistoriesHandler(request, h) {
    try{
        const data = await getData();
        return h.response({
            status: 'success',
            data: data, 
        }).code(200); 
    } catch (error){
        console.error(error);
        return Boom.badRequest('Failed to retrieve histories');
    }
  
}

module.exports = { postPredictHandler, getHistoriesHandler };