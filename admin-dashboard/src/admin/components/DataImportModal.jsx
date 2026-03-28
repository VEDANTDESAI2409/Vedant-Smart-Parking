import React, { useEffect, useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import SearchableSelect from '../../components/SearchableSelect';
import { areasAPI, citiesAPI, importsAPI, pincodesAPI } from '../../services/api';
import { showError, showInfo, showSuccess, showWarning } from '../../utils/toastService';

const TYPE_CONFIG = {
  city: {
    title: 'Import Cities',
    description: 'Upload either name,state rows or a single-column city list and provide the state below.',
    headers: ['name,state', 'or one city name per line'],
  },
  pincode: {
    title: 'Import Pincodes',
    description: 'Choose a city, then upload either a pincode column or one pincode per line.',
    headers: ['pincode', 'or one pincode per line'],
  },
  area: {
    title: 'Import Areas',
    description: 'Choose the city and pincode, then upload either an area column or one area per line.',
    headers: ['name', 'or one area name per line'],
  },
  location: {
    title: 'Import Locations',
    description: 'Choose the city, pincode, and area, then upload name,lat,lng rows with or without a header.',
    headers: ['name,lat,lng', 'or one location per line as name,lat,lng'],
  },
};

const getCitiesFromResponse = (response) => response?.data?.data?.cities || [];
const getPincodesFromResponse = (response) => response?.data?.data?.pincodes || [];
const getAreasFromResponse = (response) => response?.data?.data?.areas || [];

const DataImportModal = ({ isOpen, onClose, onImported, type }) => {
  const fileInputRef = useRef(null);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedPincodeId, setSelectedPincodeId] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [cityState, setCityState] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const config = TYPE_CONFIG[type];

  useEffect(() => {
    if (!isOpen) {
      setCities([]);
      setPincodes([]);
      setAreas([]);
      setSelectedCityId('');
      setSelectedPincodeId('');
      setSelectedAreaId('');
      setCityState('');
      setFile(null);
      setDragging(false);
      setParsing(false);
      setSubmitting(false);
      return;
    }

    const loadCities = async () => {
      try {
        const response = await citiesAPI.getAll();
        setCities(getCitiesFromResponse(response));
      } catch (error) {
        console.error('Error loading cities for import:', error);
        setCities([]);
      }
    };

    loadCities();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedCityId || (type !== 'area' && type !== 'location')) {
      setPincodes([]);
      return;
    }

    const loadPincodes = async () => {
      try {
        const response = await pincodesAPI.getAll({ cityId: selectedCityId });
        setPincodes(getPincodesFromResponse(response));
      } catch (error) {
        console.error('Error loading pincodes for import:', error);
        setPincodes([]);
      }
    };

    loadPincodes();
  }, [isOpen, selectedCityId, type]);

  useEffect(() => {
    if (!isOpen || !selectedPincodeId || type !== 'location') {
      setAreas([]);
      return;
    }

    const loadAreas = async () => {
      try {
        const response = await areasAPI.getAll({
          cityId: selectedCityId,
          pincodeId: selectedPincodeId,
        });
        setAreas(getAreasFromResponse(response));
      } catch (error) {
        console.error('Error loading areas for import:', error);
        setAreas([]);
      }
    };

    loadAreas();
  }, [isOpen, selectedCityId, selectedPincodeId, type]);

  const canSelectCity = type === 'pincode' || type === 'area' || type === 'location';
  const canSelectPincode = type === 'area' || type === 'location';
  const canSelectArea = type === 'location';

  const sampleHeader = useMemo(() => config.headers.join(' / '), [config.headers]);
  const cityOptions = useMemo(
    () =>
      cities.map((city) => ({
        value: city._id,
        label: `${city.name} (${city.state})`,
      })),
    [cities]
  );
  const pincodeOptions = useMemo(
    () =>
      pincodes.map((pincode) => ({
        value: pincode._id,
        label: pincode.pincode,
      })),
    [pincodes]
  );
  const areaOptions = useMemo(
    () =>
      areas.map((area) => ({
        value: area._id,
        label: area.name,
      })),
    [areas]
  );

  const selectFile = (nextFile) => {
    if (!nextFile) {
      return;
    }

    if (!nextFile.name.toLowerCase().endsWith('.csv')) {
      showWarning('Please upload a CSV file');
      return;
    }

    setFile(nextFile);
  };

  const validateSelections = () => {
    if (type === 'pincode' && !selectedCityId) {
      return 'Please select a city';
    }

    if (type === 'area' && (!selectedCityId || !selectedPincodeId)) {
      return 'Please select both city and pincode';
    }

    if (type === 'location' && (!selectedCityId || !selectedPincodeId || !selectedAreaId)) {
      return 'Please select city, pincode, and area';
    }

    if (!file) {
      return 'Please upload a CSV file';
    }

    if (type === 'city' && !cityState.trim()) {
      return 'Please enter the state for this city file';
    }

    return null;
  };

  const parseCityCsvFile = async (selectedFile) => {
    const content = await selectedFile.text();

    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(',').map((value) => value.trim()))
      .filter((row) => {
        const first = (row[0] || '').toLowerCase();
        const second = (row[1] || '').toLowerCase();
        return !(first === 'name' && second === 'state');
      })
      .map((row) => ({
        name: row[0] || '',
        state: row[1] || cityState.trim(),
      }))
      .filter((row) => row.name);
  };

  const parsePincodeCsvFile = async (selectedFile) => {
    const content = await selectedFile.text();

    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(',').map((value) => value.trim()))
      .filter((row) => (row[0] || '').toLowerCase() !== 'pincode')
      .map((row) => ({
        pincode: row[0] || '',
      }))
      .filter((row) => row.pincode);
  };

  const parseAreaCsvFile = async (selectedFile) => {
    const content = await selectedFile.text();

    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(',').map((value) => value.trim()))
      .filter((row) => {
        const first = (row[0] || '').toLowerCase();
        return first !== 'name' && first !== 'area';
      })
      .map((row) => ({
        name: row[0] || '',
      }))
      .filter((row) => row.name);
  };

  const parseLocationCsvFile = async (selectedFile) => {
    const content = await selectedFile.text();

    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(',').map((value) => value.trim()))
      .filter((row) => {
        const first = (row[0] || '').toLowerCase();
        const second = (row[1] || '').toLowerCase();
        const third = (row[2] || '').toLowerCase();
        return !(
          (first === 'name' || first === 'location') &&
          (second === 'lat' || second === 'latitude') &&
          (third === 'lng' || third === 'longitude' || third === 'lon')
        );
      })
      .map((row) => ({
        name: row[0] || '',
        lat: row[1] || '',
        lng: row[2] || '',
      }))
      .filter((row) => row.name || row.lat || row.lng);
  };

  const parseStandardCsvFile = (selectedFile) =>
    new Promise((resolve, reject) => {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors?.length) {
            reject(new Error(results.errors[0].message || 'Failed to parse CSV'));
            return;
          }

          const rows = (results.data || []).filter((row) =>
            Object.values(row).some((value) => String(value || '').trim() !== '')
          );

          resolve(rows);
        },
        error: (error) => reject(error),
      });
    });

  const handleImport = async () => {
    const validationError = validateSelections();
    if (validationError) {
      showWarning(validationError);
      return;
    }

    try {
      showInfo('Processing CSV upload...');
      setParsing(true);
      let rows = [];

      if (type === 'city') {
        rows = await parseCityCsvFile(file);
      } else if (type === 'pincode') {
        rows = await parsePincodeCsvFile(file);
      } else if (type === 'area') {
        rows = await parseAreaCsvFile(file);
      } else if (type === 'location') {
        rows = await parseLocationCsvFile(file);
      } else {
        rows = await parseStandardCsvFile(file);
      }

      setParsing(false);

      if (!rows.length) {
        showError('CSV headers are missing or file is empty');
        return;
      }

      setSubmitting(true);
      const payload = {
        rows,
        cityId: selectedCityId || undefined,
        pincodeId: selectedPincodeId || undefined,
        areaId: selectedAreaId || undefined,
      };

      const response = await importsAPI.import(type, payload);
      const inserted = response?.data?.data?.inserted ?? rows.length;
      const successLabel =
        type === 'city'
          ? 'City Imported Successfully!'
          : `${type.charAt(0).toUpperCase()}${type.slice(1)} Imported Successfully!`;
      showSuccess(`${successLabel} Total: ${inserted}`);

      if (onImported) {
        await onImported();
      }

      onClose();
    } catch (error) {
      console.error('CSV import failed:', error);
      showError(error?.response?.data?.message || error.message || 'CSV upload failed');
    } finally {
      setParsing(false);
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={submitting ? undefined : onClose} title={config.title} size="lg">
      <div className="space-y-5">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">{config.description}</p>
          <p className="mt-1">
            Expected CSV headers: <span className="font-mono">{sampleHeader}</span>
          </p>
        </div>

        {type === 'city' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
            <input
              type="text"
              value={cityState}
              onChange={(event) => setCityState(event.target.value)}
              placeholder="e.g. Gujarat"
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This will be used for every city if your CSV contains only city names.
            </p>
          </div>
        )}

        {canSelectCity && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select City</label>
            <SearchableSelect
              value={selectedCityId}
              onChange={(value) => {
                setSelectedCityId(value);
                setSelectedPincodeId('');
                setSelectedAreaId('');
              }}
              options={cityOptions}
              placeholder="Select a city"
            />
          </div>
        )}

        {canSelectPincode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Pincode</label>
            <SearchableSelect
              value={selectedPincodeId}
              onChange={(value) => {
                setSelectedPincodeId(value);
                setSelectedAreaId('');
              }}
              options={pincodeOptions}
              placeholder={selectedCityId ? 'Select a pincode' : 'Select a city first'}
              disabled={!selectedCityId}
            />
          </div>
        )}

        {canSelectArea && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Area</label>
            <SearchableSelect
              value={selectedAreaId}
              onChange={setSelectedAreaId}
              options={areaOptions}
              placeholder={selectedPincodeId ? 'Select an area' : 'Select a pincode first'}
              disabled={!selectedPincodeId}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CSV File</label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              selectFile(event.dataTransfer.files?.[0]);
            }}
            className={`mt-1 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
              dragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/60 dark:border-gray-600 dark:bg-gray-800'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Drag and drop your CSV here, or click to browse
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {file ? `Selected file: ${file.name}` : `Headers must be: ${sampleHeader}`}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleImport} disabled={parsing || submitting}>
            {parsing ? 'Parsing CSV...' : submitting ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DataImportModal;
