import { useState } from 'react';
import Button from '../common/Button';
import Select from '../common/Select';
import Input from '../common/Input';

export default function AttendanceForm({ employees, onSubmit, onCancel, loading = false }) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    employee_id: '',
    date: today,
    status: ''
  });
  const [errors, setErrors] = useState({});

  const employeeOptions = [
    { value: '', label: 'Select Employee' },
    ...employees.map((emp) => ({
      value: emp.employee_id,
      label: `${emp.full_name} (${emp.employee_id})`
    }))
  ];

  const statusOptions = [
    { value: '', label: 'Select Status' },
    { value: 'Present', label: 'Present' },
    { value: 'Absent', label: 'Absent' }
  ];

  const validate = () => {
    const newErrors = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Please select an employee';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.status) {
      newErrors.status = 'Please select attendance status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Employee"
        name="employee_id"
        value={formData.employee_id}
        onChange={handleChange}
        options={employeeOptions}
        error={errors.employee_id}
      />
      <Input
        label="Date"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        max={today}
        error={errors.date}
      />
      <Select
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={statusOptions}
        error={errors.status}
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Mark Attendance
        </Button>
      </div>
    </form>
  );
}
