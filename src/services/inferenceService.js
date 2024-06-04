const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
  try {
    const tensor = tf.tidy(() => {
        return tf.node
            .decodeJpeg(image)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat();
    });
    if (tensor.shape[3] !== 3) {
        throw new InputError('Terjadi kesalahan dalam melakukan prediksi'); 
    }
    const prediction = model.predict(tensor);
    const score = await prediction.data();
    const label = score[0] < 0.5 ? 'Non-cancer' : 'Cancer';
    let suggestion = label === 'Cancer' 
    ? 'Segera periksa ke dokter!' 
    : 'Anda sehat!';
    tf.dispose([tensor, prediction]);
    return { label, suggestion };
    } catch (error) {
        if (error instanceof InputError) {
            throw error; 
          } else {
            throw new InputError(`Terjadi kesalahan input: ${error.message}`);
          }
    } 
}
  
  module.exports = predictClassification;