import { useState, useEffect } from 'react';
import AttendanceList from '../components/attendance/AttendanceList';
import AttendanceForm from '../components/attendance/AttendanceForm';
import AttendanceStats from '../components/attendance/AttendanceStats';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Loading from '../components/common/Loading';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { attendanceApi, employeeApi } from '../services/api';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeStats, setEmployeeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    from: '',
    to: ''
  });

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll();
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedEmployee) params.employee_id = selectedEmployee;
      if (filters.date) params.date = filters.date;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const response = await attendanceApi.getAll(params);
      setAttendance(response.data);

      // Fetch stats if employee is selected
      if (selectedEmployee) {
        const statsResponse = await attendanceApi.getStats(selectedEmployee);
        setEmployeeStats(statsResponse.data.stats);
      } else {
        setEmployeeStats(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedEmployee, filters]);

  const handleMarkAttendance = async (data) => {
    try {
      setSubmitting(true);
      await attendanceApi.mark(data);
      setShowModal(false);
      setToast({ message: 'Attendance marked successfully', variant: 'success' });
      fetchAttendance();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to mark attendance';
      setToast({ message: errorMessage, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ date: '', from: '', to: '' });
    setSelectedEmployee('');
  };

  const employeeOptions = [
    { value: '', label: 'All Employees' },
    ...employees.map((emp) => ({
      value: emp.employee_id,
      label: `${emp.full_name} (${emp.employee_id})`
    }))
  ];

  if (error && !loading) {
    return <ErrorState message={error} onRetry={fetchAttendance} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500">Track and manage employee attendance</p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={employees.length === 0}>
          <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Mark Attendance
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select
            label="Employee"
            name="employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            options={employeeOptions}
          />
          <Input
            label="Specific Date"
            name="date"
            type="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
          <Input
            label="From Date"
            name="from"
            type="date"
            value={filters.from}
            onChange={handleFilterChange}
          />
          <Input
            label="To Date"
            name="to"
            type="date"
            value={filters.to}
            onChange={handleFilterChange}
          />
          <div className="flex items-end">
            <Button variant="secondary" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Stats */}
      {selectedEmployee && employeeStats && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Attendance Statistics for {employees.find(e => e.employee_id === selectedEmployee)?.full_name}
          </h3>
          <AttendanceStats stats={employeeStats} />
        </div>
      )}

      {/* Attendance Records */}
      {loading ? (
        <Loading message="Loading attendance records..." />
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <EmptyState
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            title="No employees available"
            description="Add employees first before marking attendance"
            action={
              <Button onClick={() => window.location.href = '/employees'}>
                Go to Employees
              </Button>
            }
          />
        </div>
      ) : attendance.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <EmptyState
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            title="No attendance records"
            description={selectedEmployee ? "No attendance records found for this employee" : "Start by marking attendance for your employees"}
            action={
              <Button onClick={() => setShowModal(true)}>
                Mark Attendance
              </Button>
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <AttendanceList attendance={attendance} />
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Mark Attendance"
      >
        <AttendanceForm
          employees={employees}
          onSubmit={handleMarkAttendance}
          onCancel={() => setShowModal(false)}
          loading={submitting}
        />
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
