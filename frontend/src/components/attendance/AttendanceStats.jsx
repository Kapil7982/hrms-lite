export default function AttendanceStats({ stats }) {
  const { total_days, present_days, absent_days, attendance_percentage } = stats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">Total Days</p>
        <p className="text-2xl font-bold text-gray-900">{total_days}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">Present</p>
        <p className="text-2xl font-bold text-green-600">{present_days}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">Absent</p>
        <p className="text-2xl font-bold text-red-600">{absent_days}</p>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">Attendance %</p>
        <p className={`text-2xl font-bold ${attendance_percentage >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
          {attendance_percentage}%
        </p>
      </div>
    </div>
  );
}
