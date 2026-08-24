import React, { useEffect, useState, useCallback } from 'react';
import { Video, Phone } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { appointmentsApi, AppointmentFilters } from '../../api/appointments.api';
import { useToast } from '../../context/ToastContext';
import { Appointment, AppointmentStatus } from '../../types';

export const AppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters] = useState<AppointmentFilters>({
    status: '',
    page: 1,
    limit: 10,
  });

  const { showSuccess, showError } = useToast();

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await appointmentsApi.list(filters);
      if (res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleUpdateStatus = async (publicId: string, status: AppointmentStatus) => {
    try {
      const res = await appointmentsApi.updateStatus(publicId, status);
      if (res.success) {
        showSuccess(`Appointment marked as ${status}`);
        loadAppointments();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Consultation Appointments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Scheduled video, phone, and in-person advisory sessions.
        </p>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Consultant</th>
                <th className="py-3 px-4">Meeting Type</th>
                <th className="py-3 px-4">Schedule Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No scheduled consultation appointments.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {appt.clientName || 'Client'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {appt.consultantName || 'Assigned Consultant'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        {appt.appointmentType === 'VIDEO' ? (
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Phone className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span className="capitalize">{appt.appointmentType.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-semibold">
                      {new Date(appt.scheduledStart).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={appt.status}
                        onChange={(e) =>
                          handleUpdateStatus(appt.publicId, e.target.value as AppointmentStatus)
                        }
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="REQUESTED">Requested</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
