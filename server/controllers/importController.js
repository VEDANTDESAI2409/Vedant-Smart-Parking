const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const City = require('../models/City');
const Pincode = require('../models/Pincode');
const Area = require('../models/Area');
const Location = require('../models/Location');
const { AppError } = require('../middleware/errorHandler');

const SUPPORTED_TYPES = ['city', 'pincode', 'area', 'location'];

const normalizeValue = (value) => String(value || '').trim();
const normalizeKey = (value) => normalizeValue(value).toLowerCase();
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const badRequest = (message) => new AppError(message, 400);
const notFound = (message) => new AppError(message, 404);

const getField = (row, candidates) => {
  for (const candidate of candidates) {
    if (row[candidate] !== undefined && row[candidate] !== null) {
      return row[candidate];
    }
  }

  return '';
};

const assertParentIds = async (type, payload) => {
  const { cityId, pincodeId, areaId } = payload;

  if (type === 'pincode') {
    if (!isValidObjectId(cityId)) {
      throw badRequest('A valid cityId is required for pincode import');
    }

    const city = await City.findById(cityId);
    if (!city) {
      throw notFound('Selected city was not found');
    }
  }

  if (type === 'area') {
    if (!isValidObjectId(cityId) || !isValidObjectId(pincodeId)) {
      throw badRequest('Valid cityId and pincodeId are required for area import');
    }

    const [city, pincode] = await Promise.all([
      City.findById(cityId),
      Pincode.findOne({ _id: pincodeId, cityId }),
    ]);

    if (!city) {
      throw notFound('Selected city was not found');
    }

    if (!pincode) {
      throw notFound('Selected pincode was not found for the chosen city');
    }
  }

  if (type === 'location') {
    if (!isValidObjectId(cityId) || !isValidObjectId(pincodeId) || !isValidObjectId(areaId)) {
      throw badRequest('Valid cityId, pincodeId, and areaId are required for location import');
    }

    const [city, pincode, area] = await Promise.all([
      City.findById(cityId),
      Pincode.findOne({ _id: pincodeId, cityId }),
      Area.findOne({ _id: areaId, pincodeId, cityId }),
    ]);

    if (!city) {
      throw notFound('Selected city was not found');
    }

    if (!pincode) {
      throw notFound('Selected pincode was not found for the chosen city');
    }

    if (!area) {
      throw notFound('Selected area was not found for the chosen pincode');
    }
  }
};

const buildPreparedRows = (type, rows, payload) => {
  const prepared = [];
  const errors = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    if (type === 'city') {
      const name = normalizeValue(getField(row, ['name', 'city']));
      const state = normalizeValue(getField(row, ['state']));

      if (!name || !state) {
        errors.push(`Row ${rowNumber}: name and state are required`);
        return;
      }

      prepared.push({
        name,
        state,
        status: true,
        uniqueKey: `${normalizeKey(name)}::${normalizeKey(state)}`,
      });
      return;
    }

    if (type === 'pincode') {
      const pincode = normalizeValue(getField(row, ['pincode']));

      if (!/^\d{6}$/.test(pincode)) {
        errors.push(`Row ${rowNumber}: pincode must be exactly 6 digits`);
        return;
      }

      prepared.push({
        pincode,
        cityId: payload.cityId,
        status: true,
        uniqueKey: `${payload.cityId}::${pincode}`,
      });
      return;
    }

    if (type === 'area') {
      const name = normalizeValue(getField(row, ['name', 'area']));

      if (!name) {
        errors.push(`Row ${rowNumber}: name is required`);
        return;
      }

      prepared.push({
        name,
        cityId: payload.cityId,
        pincodeId: payload.pincodeId,
        status: true,
        uniqueKey: `${payload.cityId}::${payload.pincodeId}::${normalizeKey(name)}`,
      });
      return;
    }

    const name = normalizeValue(getField(row, ['name', 'location']));
    const lat = Number(getField(row, ['lat', 'latitude']));
    const lng = Number(getField(row, ['lng', 'longitude', 'lon']));

    if (!name) {
      errors.push(`Row ${rowNumber}: name is required`);
      return;
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      errors.push(`Row ${rowNumber}: lat and lng must be valid numbers`);
      return;
    }

    prepared.push({
      name,
      lat,
      lng,
      cityId: payload.cityId,
      pincodeId: payload.pincodeId,
      areaId: payload.areaId,
      status: true,
      uniqueKey: `${payload.cityId}::${payload.pincodeId}::${payload.areaId}::${normalizeKey(name)}`,
    });
  });

  return { prepared, errors };
};

const getExistingUniqueKeys = async (type, payload) => {
  if (type === 'city') {
    const cities = await City.find({}, 'name state');
    return new Set(cities.map((item) => `${normalizeKey(item.name)}::${normalizeKey(item.state)}`));
  }

  if (type === 'pincode') {
    const pincodes = await Pincode.find({ cityId: payload.cityId }, 'pincode cityId');
    return new Set(pincodes.map((item) => `${String(item.cityId)}::${item.pincode}`));
  }

  if (type === 'area') {
    const areas = await Area.find(
      { cityId: payload.cityId, pincodeId: payload.pincodeId },
      'name cityId pincodeId'
    );
    return new Set(
      areas.map(
        (item) => `${String(item.cityId)}::${String(item.pincodeId)}::${normalizeKey(item.name)}`
      )
    );
  }

  const locations = await Location.find(
    {
      cityId: payload.cityId,
      pincodeId: payload.pincodeId,
      areaId: payload.areaId,
    },
    'name cityId pincodeId areaId'
  );

  return new Set(
    locations.map(
      (item) =>
        `${String(item.cityId)}::${String(item.pincodeId)}::${String(item.areaId)}::${normalizeKey(item.name)}`
    )
  );
};

const insertRows = async (type, rows) => {
  const docs = rows.map(({ uniqueKey, ...item }) => item);

  if (type === 'city') {
    return City.insertMany(docs, { ordered: false });
  }

  if (type === 'pincode') {
    return Pincode.insertMany(docs, { ordered: false });
  }

  if (type === 'area') {
    return Area.insertMany(docs, { ordered: false });
  }

  return Location.insertMany(docs, { ordered: false });
};

const importData = asyncHandler(async (req, res) => {
  const type = normalizeKey(req.params.type);
  const { rows, cityId, pincodeId, areaId } = req.body;

  if (!SUPPORTED_TYPES.includes(type)) {
    throw badRequest('Unsupported import type');
  }

  if (!Array.isArray(rows) || !rows.length) {
    throw badRequest('rows must be a non-empty array');
  }

  await assertParentIds(type, { cityId, pincodeId, areaId });

  const { prepared, errors } = buildPreparedRows(type, rows, { cityId, pincodeId, areaId });

  if (errors.length) {
    throw badRequest(errors.join(', '));
  }

  const seenKeys = new Set();
  const duplicateRowsInFile = [];
  const uniqueRows = prepared.filter((item) => {
    if (seenKeys.has(item.uniqueKey)) {
      duplicateRowsInFile.push(item.uniqueKey);
      return false;
    }

    seenKeys.add(item.uniqueKey);
    return true;
  });

  const existingKeys = await getExistingUniqueKeys(type, { cityId, pincodeId, areaId });
  const rowsToInsert = uniqueRows.filter((item) => !existingKeys.has(item.uniqueKey));

  if (!rowsToInsert.length) {
    throw badRequest('No new rows to import. All rows already exist or are duplicated.');
  }

  const insertedDocs = await insertRows(type, rowsToInsert);

  res.status(201).json({
    success: true,
    message: `Imported ${insertedDocs.length} ${type} record(s) successfully`,
    data: {
      type,
      received: rows.length,
      inserted: insertedDocs.length,
      skippedDuplicatesInFile: duplicateRowsInFile.length,
      skippedExisting: uniqueRows.length - rowsToInsert.length,
      records: insertedDocs,
    },
  });
});

module.exports = {
  importData,
};
