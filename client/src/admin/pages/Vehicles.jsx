import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { vehiclesAPI } from '../../services/api';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesAPI.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Dummy data
      setVehicles([
        { id: 1, licensePlate: 'ABC-123', model: 'Toyota Camry', color: 'Blue', user: { name: 'John Doe' }, status: 'active' },
        { id: 2, licensePlate: 'XYZ-789', model: 'Honda Civic', color: 'Red', user: { name: 'Jane Smith' }, status: 'active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'License Plate', key: 'licensePlate' },
    { header: 'Model', key: 'model' },
    { header: 'Color', key: 'color' },
    { header: 'Owner', key: 'user', render: (row) => row.user.name },
    { header: 'Status', key: 'status', render: (row) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {row.status}
      </span>
    )},
    { header: 'Actions', key: 'actions', render: (row) => (
      <div className="flex space-x-2">
        <button className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
        <button className="text-red-600 hover:text-red-800"><FaTrash /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicles</h1>
        <Button><FaPlus className="mr-2" />Add Vehicle</Button>
      </div>
      <Card>
        <Table columns={columns} data={vehicles} loading={loading} emptyMessage="No vehicles found" />
      </Card>
    </div>
  );
};

export default Vehicles;