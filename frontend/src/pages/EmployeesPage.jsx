import { useState, useEffect } from 'react';
import EmployeeList from '../components/employees/EmployeeList';
import EmployeeForm from '../components/employees/EmployeeForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { employeeApi } from '../services/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeApi.getAll();
      setEmployees(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (data) => {
    try {
      setSubmitting(true);
      await employeeApi.create(data);
      setShowModal(false);
      setToast({ message: 'Employee added successfully', variant: 'success' });
      fetchEmployees();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to add employee';
      setToast({ message: errorMessage, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('Are you sure you want to delete this employee? This will also delete all their attendance records.')) {
      return;
    }

    try {
      setDeleting(employeeId);
      await employeeApi.delete(employeeId);
      setToast({ message: 'Employee deleted successfully', variant: 'success' });
      fetchEmployees();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete employee';
      setToast({ message: errorMessage, variant: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <Loading message="Loading employees..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchEmployees} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500">Manage your employee records</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Employee
        </Button>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <EmptyState
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            title="No employees yet"
            description="Get started by adding your first employee"
            action={
              <Button onClick={() => setShowModal(true)}>
                Add Employee
              </Button>
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <EmployeeList
            employees={employees}
            onDelete={handleDeleteEmployee}
            deleting={deleting}
          />
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Employee"
      >
        <EmployeeForm
          onSubmit={handleAddEmployee}
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
