"use client";

import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { StatsCard } from "@/components/ui/StatsCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Calendar, Clock, TrendingUp, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalHadir: 0,
    persentaseHadir: 0,
    mingguIni: 0,
    statusHariIni: "belum_absen",
  });
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, [profile?.id]);

  const fetchDashboardData = async () => {
    if (!profile?.id) return;

    try {
      // Fetch attendance stats
      const { data: attendances } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", profile.id)
        .order("date", { ascending: false });

      // Calculate stats
      const totalHadir =
        attendances?.filter((a) => a.status === "present").length || 0;
      const totalRecords = attendances?.length || 0;
      const persentaseHadir =
        totalRecords > 0 ? Math.round((totalHadir / totalRecords) * 100) : 0;

      // Check today's status
      const today = format(new Date(), "yyyy-MM-dd");
      const todayAttendance = attendances?.find((a) => a.date === today);

      let statusHariIni = "belum_absen";
      if (todayAttendance) {
        if (todayAttendance.check_in_time && todayAttendance.check_out_time) {
          statusHariIni = "selesai";
        } else if (todayAttendance.check_in_time) {
          statusHariIni = "check_in";
        }
      }

      // Week attendance
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const mingguIni =
        attendances?.filter(
          (a) => new Date(a.date) >= oneWeekAgo && a.status === "present"
        ).length || 0;

      setStats({
        totalHadir,
        persentaseHadir,
        mingguIni,
        statusHariIni,
      });

      setRecentAttendance(attendances?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      present: "bg-green-100 text-green-800",
      late: "bg-yellow-100 text-yellow-800",
      absent: "bg-red-100 text-red-800",
    };
    const labels = {
      present: "Hadir",
      late: "Terlambat",
      absent: "Tidak Hadir",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          badges[status as keyof typeof badges]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat datang, {profile?.name}!
          </h1>
          <p className="text-gray-600">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Kehadiran"
            value={stats.totalHadir}
            subtitle="hari hadir"
            icon={UserCheck}
            gradient="gradient-primary"
          />
          <StatsCard
            title="Persentase Hadir"
            value={`${stats.persentaseHadir}%`}
            icon={TrendingUp}
            gradient="gradient-secondary"
          />
          <StatsCard
            title="Minggu Ini"
            value={stats.mingguIni}
            subtitle="hari hadir"
            icon={Calendar}
            gradient="gradient-accent"
          />
          <StatsCard
            title="Status Hari Ini"
            value={
              stats.statusHariIni === "belum_absen"
                ? "Belum Absen"
                : stats.statusHariIni === "check_in"
                ? "Sudah Check In"
                : "Selesai"
            }
            icon={Clock}
            gradient={
              stats.statusHariIni === "selesai"
                ? "gradient-primary"
                : "bg-gray-500"
            }
          />
        </div>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Riwayat Absensi Terbaru
            </h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentAttendance.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(attendance.date), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance.check_in_time
                          ? format(new Date(attendance.check_in_time), "HH:mm")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance.check_out_time
                          ? format(new Date(attendance.check_out_time), "HH:mm")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(attendance.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentAttendance.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data absensi
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
