const { Firestore } = require('@google-cloud/firestore');

const db = new Firestore();
const predictCollection = db.collection('predictions');
async function storeData(id, data) {
    return predictCollection.doc(id).set(data);
}

async function getData() {
    const history = await predictCollection.get();
    const data = [];
    history.forEach((doc) => {
        const entry = doc.data();
        const historiesContent = {
            id: entry.id,
            history: {
                result: entry.result,
                createdAt: entry.createdAt,
                suggestion: entry.suggestion,
                id: entry.id,
            },
        };
        data.push(historiesContent);
    });
    return data;
}

module.exports = {storeData, getData};