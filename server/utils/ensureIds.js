const City = require('../models/City');
const Pincode = require('../models/Pincode');
const Area = require('../models/Area');
const Location = require('../models/Location');
const Counter = require('../models/Counter');

const getNextSequence = async (name) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const ensureSequentialIds = async () => {
  const map = [
    { model: City, idField: 'cityId' },
    { model: Pincode, idField: 'pincodeId' },
    { model: Area, idField: 'areaId' },
    { model: Location, idField: 'locationId' }
  ];

  for (const { model, idField } of map) {
    const docsWithoutId = await model.find({
      $or: [
        { [idField]: { $exists: false } },
        { [idField]: null }
      ]
    }).sort({ createdAt: 1 });

    for (const doc of docsWithoutId) {
      const next = await getNextSequence(idField);
      doc[idField] = next;
      await doc.save();
    }
  }
};

module.exports = {
  getNextSequence,
  ensureSequentialIds
};