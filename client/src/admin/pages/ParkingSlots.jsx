import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCar,
  FaEdit,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaParking,
  FaPlus,
  FaRupeeSign,
  FaSearch,
  FaTrash,
} from 'react-icons/fa';

import Modal from '../../components/Modal';
import Table from '../../components/Table';
import {
  areasAPI,
  citiesAPI,
  locationsAPI,
  pincodesAPI,
  slotsAPI,
} from '../../services/api';

const getCollection = (response, key) =>
  response?.data?.data?.[key] ||
  response?.data?.[key] ||
  response?.data?.data ||
  response?.data ||
  [];

const getId = (value) => value?._id || value || '';
const getCityName = (item) => item?.cityId?.name || item?.city || item?.name || '';
const getPincodeValue = (item) => item?.pincodeId?.pincode || item?.pincode || '';
const getAreaValue = (item) => item?.areaId?.name || item?.area || item?.name || '';
const getLocationValue = (item) => item?.locationId?.name || item?.location || item?.name || '';
const getOptionKey = (item) => item?._id || item?.name || item?.pincode || item?.area || item?.location;
const getOptionLabel = (item) =>
  item?.name || item?.pincode || item?.area || item?.location || item?.city || '';

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500';

const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [locations, setLocations] = useState([]);

  const [cityId, setCityId] = useState('');
  const [pincodeId, setPincodeId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [landmark, setLandmark] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [slotType, setSlotType] = useState('normal');
  const [slotLocation, setSlotLocation] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      fetchCities();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!cityId) {
      setPincodes([]);
      return;
    }

    fetchPincodes(cityId);
  }, [cityId]);

  useEffect(() => {
    if (!cityId || !pincodeId) {
      setAreas([]);
      return;
    }

    fetchAreas(cityId, pincodeId);
  }, [cityId, pincodeId]);

  useEffect(() => {
    if (!cityId || !pincodeId || !areaId) {
      setLocations([]);
      return;
    }

    fetchLocations(cityId, pincodeId, areaId);
  }, [cityId, pincodeId, areaId]);

  const filteredSlots = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return slots;

    return slots.filter((slot) =>
      [
        slot.city,
        slot.pincode,
        slot.area,
        slot.location,
        slot.landmark,
        slot.vehicleType,
        slot.slotType,
        slot.slotLocation,
        String(slot.price ?? ''),
        slot._id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [searchTerm, slots]);

  const stats = useMemo(() => {
    const total = slots.length;
    const cars = slots.filter((slot) => slot.vehicleType === 'car').length;
    const bikes = slots.filter((slot) => slot.vehicleType === 'bike').length;
    const avgPrice = total
      ? Math.round(
          (slots.reduce((sum, slot) => sum + Number(slot.price || 0), 0) / total) * 100
        ) / 100
      : 0;

    return { total, cars, bikes, avgPrice };
  }, [slots]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await slotsAPI.getAll();
      const list = getCollection(response, 'slots');
      setSlots(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await citiesAPI.getAll();
      const list = getCollection(response, 'cities');
      setCities(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  const fetchPincodes = async (selectedCityId) => {
    try {
      const response = await pincodesAPI.getAll({ cityId: selectedCityId });
      const list = getCollection(response, 'pincodes');
      setPincodes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
    }
  };

  const fetchAreas = async (selectedCityId, selectedPincodeId) => {
    try {
      const response = await areasAPI.getAll({
        cityId: selectedCityId,
        pincodeId: selectedPincodeId,
      });
      const list = getCollection(response, 'areas');
      setAreas(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    }
  };

  const fetchLocations = async (selectedCityId, selectedPincodeId, selectedAreaId) => {
    try {
      const response = await locationsAPI.getAll({
        cityId: selectedCityId,
        pincodeId: selectedPincodeId,
        areaId: selectedAreaId,
      });
      const list = getCollection(response, 'locations');
      setLocations(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    }
  };

  const resetForm = () => {
    setEditingSlot(null);
    setCityId('');
    setPincodeId('');
    setAreaId('');
    setLocationId('');
    setLandmark('');
    setVehicleType('car');
    setSlotType('normal');
    setSlotLocation('');
    setPrice('');
    setPincodes([]);
    setAreas([]);
    setLocations([]);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCityChange = (value) => {
    setCityId(value);
    setPincodeId('');
    setAreaId('');
    setLocationId('');
    setPincodes([]);
    setAreas([]);
    setLocations([]);
  };

  const handlePincodeChange = (value) => {
    setPincodeId(value);
    setAreaId('');
    setLocationId('');
    setAreas([]);
    setLocations([]);
  };

  const handleAreaChange = (value) => {
    setAreaId(value);
    setLocationId('');
    setLocations([]);
  };

  const handleEdit = async (slot) => {
    setEditingSlot(slot);
    setLandmark(slot.landmark || '');
    setVehicleType(slot.vehicleType || 'car');
    setSlotType(slot.slotType || 'normal');
    setSlotLocation(slot.slotLocation || '');
    setPrice(slot.price ?? '');
    setModalOpen(true);

    try {
      const citiesResponse = await citiesAPI.getAll();
      const cityList = getCollection(citiesResponse, 'cities');
      setCities(Array.isArray(cityList) ? cityList : []);

      const matchedCity = cityList.find((item) => item.name === slot.city);
      const matchedCityId = matchedCity?._id || '';
      setCityId(matchedCityId);

      if (!matchedCityId) {
        return;
      }

      const pincodesResponse = await pincodesAPI.getAll({ cityId: matchedCityId });
      const pincodeList = getCollection(pincodesResponse, 'pincodes');
      setPincodes(Array.isArray(pincodeList) ? pincodeList : []);

      const matchedPincode = pincodeList.find((item) => item.pincode === slot.pincode);
      const matchedPincodeId = matchedPincode?._id || '';
      setPincodeId(matchedPincodeId);

      if (!matchedPincodeId) {
        return;
      }

      const areasResponse = await areasAPI.getAll({
        cityId: matchedCityId,
        pincodeId: matchedPincodeId,
      });
      const areaList = getCollection(areasResponse, 'areas');
      setAreas(Array.isArray(areaList) ? areaList : []);

      const matchedArea = areaList.find((item) => item.name === slot.area);
      const matchedAreaId = matchedArea?._id || '';
      setAreaId(matchedAreaId);

      if (!matchedAreaId) {
        return;
      }

      const locationsResponse = await locationsAPI.getAll({
        cityId: matchedCityId,
        pincodeId: matchedPincodeId,
        areaId: matchedAreaId,
      });
      const locationList = getCollection(locationsResponse, 'locations');
      setLocations(Array.isArray(locationList) ? locationList : []);

      const matchedLocation = locationList.find((item) => item.name === slot.location);
      setLocationId(matchedLocation?._id || '');
    } catch (error) {
      console.error('Error loading dependent slot values for edit:', error);
    }
  };

  const validateForm = () => {
    if (!cityId) return 'City is required';
    if (!pincodeId) return 'Pincode is required';
    if (!areaId) return 'Area is required';
    if (!locationId) return 'Location is required';
    if (!landmark.trim()) return 'Landmark is required';
    if (!slotLocation.trim()) return 'Slot location is required';
    if (price === '' || Number.isNaN(Number(price)) || Number(price) < 0) {
      return 'Price must be a valid positive number';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const selectedCity = cities.find((item) => item._id === cityId);
    const selectedPincode = pincodes.find((item) => item._id === pincodeId);
    const selectedArea = areas.find((item) => item._id === areaId);
    const selectedLocation = locations.find((item) => item._id === locationId);

    if (!selectedCity || !selectedPincode || !selectedArea || !selectedLocation) {
      alert('Please reselect city, pincode, area, and location');
      return;
    }

    const payload = {
      city: selectedCity.name,
      pincode: selectedPincode.pincode,
      area: selectedArea.name,
      location: selectedLocation.name,
      landmark: landmark.trim(),
      vehicleType,
      slotType,
      slotLocation: slotLocation.trim(),
      price: Number(price),
    };

    try {
      setSubmitting(true);

      if (editingSlot) {
        await slotsAPI.update(editingSlot._id, payload);
      } else {
        await slotsAPI.create(payload);
      }

      await fetchSlots();
      setModalOpen(false);
      resetForm();
      alert(editingSlot ? 'Slot updated successfully' : 'Slot created successfully');
    } catch (error) {
      console.error('Error saving slot:', error);
      const serverErrors = error?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        alert(serverErrors.map((item) => item.msg).join('\n'));
        return;
      }
      alert(error?.response?.data?.message || 'Failed to save slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;

    try {
      await slotsAPI.delete(id);
      await fetchSlots();
      alert('Slot deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error?.response?.data?.message || 'Failed to delete slot');
    }
  };

  const columns = [
    {
      header: 'SLOT',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-black text-slate-900 dark:text-white">
            {row.slotLocation || 'Unnamed slot'}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {(row.location || 'No location') + ' | ' + (row.area || 'No area')}
          </span>
        </div>
      ),
    },
    {
      header: 'ADDRESS',
      render: (row) => (
        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
          <FaMapMarkerAlt className="mt-0.5 text-slate-400" size={12} />
          <div>
            <p>{row.city || '---'}, {row.pincode || '---'}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{row.landmark || '---'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'VEHICLE',
      render: (row) => (
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {row.vehicleType === 'bike' ? <FaMotorcycle size={11} /> : <FaCar size={11} />}
          {row.vehicleType || 'N/A'}
        </span>
      ),
    },
    {
      header: 'TYPE',
      render: (row) => (
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          {row.slotType || 'N/A'}
        </span>
      ),
    },
    {
      header: 'PRICE',
      render: (row) => (
        <span className="text-base font-black text-slate-900 dark:text-white">
          Rs. {row.price ?? 0}
        </span>
      ),
    },
    {
      header: 'ACTION',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
            title="Edit"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="rounded-xl bg-red-50 p-2.5 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
            title="Delete"
          >
            <FaTrash size={14} />
          </button>
        </div>
      ),
    },
  ];

  const selectedCity = cities.find((item) => getId(item) === cityId);
  const selectedPincode = pincodes.find((item) => getId(item) === pincodeId);
  const selectedArea = areas.find((item) => getId(item) === areaId);
  const selectedLocation = locations.find((item) => getId(item) === locationId);

  const city = getCityName(selectedCity);
  const pincode = getPincodeValue(selectedPincode);
  const area = getAreaValue(selectedArea);
  const location = getLocationValue(selectedLocation);

  const detailCards = [
    { label: 'Slot ID', value: editingSlot?._id || 'Auto-generated on save' },
    { label: 'City', value: city || '---' },
    { label: 'Pincode', value: pincode || '---' },
    { label: 'Area', value: area || '---' },
    { label: 'Location', value: location || '---' },
    { label: 'Landmark', value: landmark || '---' },
    { label: 'Vehicle Type', value: vehicleType || '---' },
    { label: 'Slot Type', value: slotType || '---' },
    { label: 'Slot Location', value: slotLocation || '---' },
    { label: 'Price', value: price !== '' ? `Rs. ${price}` : '---' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans transition-colors duration-300 dark:bg-[#0F172A] lg:p-10">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Parking Slots
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Same polished flow as the user experience, with the full slot data visible for admins.
          </p>
        </div>

        <div className="flex w-full items-center gap-4 md:w-auto">
          <div className="group relative flex-grow md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search city, slot, landmark, type..."
              className="w-full rounded-2xl border-none bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:bg-[#1E293B] dark:text-white dark:ring-slate-700"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1E293B] px-5 py-3 font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] dark:bg-blue-600"
          >
            <FaPlus size={12} />
            Add Slot
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Slots" value={stats.total} icon={FaParking} accent="blue" />
        <StatCard label="Car Slots" value={stats.cars} icon={FaCar} accent="amber" />
        <StatCard label="Bike Slots" value={stats.bikes} icon={FaMotorcycle} accent="emerald" />
        <StatCard
          label="Avg Price"
          value={`Rs. ${stats.avgPrice}`}
          icon={FaRupeeSign}
          accent="slate"
        />
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-[#1E293B] dark:shadow-none">
        <Table
          columns={columns}
          data={filteredSlots}
          loading={loading}
          emptyMessage="No parking slots found"
        />

        {!loading && filteredSlots.length === 0 && searchTerm.trim() && (
          <div className="border-t border-slate-100 px-6 py-10 text-center dark:border-slate-800">
            <p className="font-medium text-slate-400 dark:text-slate-500">
              No slots found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false);
            resetForm();
          }
        }}
        size="xl"
        showCloseButton={!submitting}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-700 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                Slot Profile
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                {editingSlot ? 'Update Parking Slot' : 'Create Parking Slot'}
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                All 10 slot details stay visible while you create or edit the record.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Current Rate
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
                {price !== '' ? `Rs. ${price}` : 'Rs. 0'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr,0.9fr]">
            <div className="space-y-8">
              <section className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-900/40">
                <SectionTitle
                  title="Location Mapping"
                  description="Keep the same linked city, pincode, area, and location hierarchy used across the app."
                />
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SelectField
                    label="City"
                    value={cityId}
                    onChange={(e) => handleCityChange(e.target.value)}
                  >
                    <option value="">Select a city</option>
                    {cities.map((item) => (
                      <option key={getOptionKey(item)} value={getId(item)}>
                        {getCityName(item)}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Pincode"
                    value={pincodeId}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    disabled={!cityId}
                  >
                    <option value="">{!cityId ? 'Select a city first' : 'Select a pincode'}</option>
                    {pincodes.map((item) => (
                      <option key={getOptionKey(item)} value={getId(item)}>
                        {getPincodeValue(item)}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Area"
                    value={areaId}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    disabled={!pincodeId}
                  >
                    <option value="">{!pincodeId ? 'Select a pincode first' : 'Select an area'}</option>
                    {areas.map((item) => (
                      <option key={getOptionKey(item)} value={getId(item)}>
                        {getAreaValue(item)}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    label="Location"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    disabled={!areaId}
                  >
                    <option value="">{!areaId ? 'Select an area first' : 'Select a location'}</option>
                    {locations.map((item) => (
                      <option key={getOptionKey(item)} value={getId(item)}>
                        {getLocationValue(item)}
                      </option>
                    ))}
                  </SelectField>

                  <InputField
                    label="Landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Opposite mall gate, near metro..."
                  />

                  <InputField
                    label="Slot Location"
                    value={slotLocation}
                    onChange={(e) => setSlotLocation(e.target.value)}
                    placeholder="Floor 1, Section B"
                  />
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/20">
                <SectionTitle
                  title="Slot Configuration"
                  description="Vehicle category, slot class, and pricing are grouped here for faster edits."
                />
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <SelectField
                    label="Vehicle Type"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                  </SelectField>

                  <SelectField
                    label="Slot Type"
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="vip">VIP</option>
                    <option value="reserved">Reserved</option>
                  </SelectField>

                  <InputField
                    label="Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter hourly price"
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[2rem] bg-[#1E293B] p-6 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-200">
                  Live Preview
                </p>
                <h3 className="mt-3 text-2xl font-black">{slotLocation || 'New Slot'}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  {[location, area, city].filter(Boolean).join(', ') || 'Select the slot location details'}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <PreviewBadge>{vehicleType || 'vehicle'}</PreviewBadge>
                  <PreviewBadge>{slotType || 'type'}</PreviewBadge>
                  <PreviewBadge>{pincode || 'pincode'}</PreviewBadge>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  10 visible slot details
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {detailCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        {card.label}
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-900 dark:text-white">
                        {card.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              disabled={submitting}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, accent }) => {
  const accentMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  };

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accentMap[accent]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ title, description }) => (
  <div>
    <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{description}</p>
  </div>
);

const FieldLabel = ({ children }) => (
  <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
    {children}
  </label>
);

const InputField = ({ label, ...props }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input className={inputClassName} {...props} />
  </div>
);

const SelectField = ({ label, children, disabled, ...props }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <select
      className={`${inputClassName} ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500' : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </select>
  </div>
);

const PreviewBadge = ({ children }) => (
  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
    {children}
  </span>
);

export default ParkingSlots;
