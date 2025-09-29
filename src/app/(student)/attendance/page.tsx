"use client";

import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { LocationMap } from "@/components/shared/LocationMap";
import { useAttendance } from "@/hooks/useAttendance";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getCurrentLocation, calculateDistance } from "@/lib/utils/location";
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AttendancePage() {
  const { profile } = useAuth();
  const { checkIn, checkOut, loading, error, clearError } = useAttendance();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [attendanceSettings, setAttendanceSettings] = useState<any>(null);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchAttendanceData();
    getUserLocation();
  }, [profile?.id]);

  const fetchAttendanceData = async () => {
    if (!profile?.id) return;

    try {
      // Get attendance settings
      const { data: settings } = await supabase
        .from("attendance_settings")
        .select("*")
        .single();

      setAttendanceSettings(settings);

      // Get today's attendance
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: attendance } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", profile.id)
        .eq("date", today)
        .single();

      setTodayAttendance(attendance);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const getUserLocation = async () => {
    setLoadingLocation(true);
    setLocationError(null);

    try {
      const position = await getCurrentLocation();
      const userPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserLocation(userPos);

      // Calculate distance if settings available
      if (attendanceSettings) {
        const dist = calculateDistance(
          userPos.lat,
          userPos.lng,
          attendanceSettings.latitude,
          attendanceSettings.longitude
        );
        setDistance(dist);
      }
    } catch (err: any) {
      setLocationError(err.message || "Tidak dapat mengakses lokasi");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCheckIn = async () => {
    clearError();
    const success = await checkIn();
    if (success) {
      await fetchAttendanceData();
    }
  };

  const handleCheckOut = async () => {
    clearError();
    const success = await checkOut();
    if (success) {
      await fetchAttendanceData();
    }
  };

  const isWithinArea =
    distance !== null &&
    attendanceSettings &&
    distance <= attendanceSettings.radius_meters;

  const canCheckIn = !todayAttendance?.check_in_time && isWithinArea;
  const canCheckOut =
    todayAttendance?.check_in_time &&
    !todayAttendance?.check_out_time &&
    isWithinArea;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Absensi</h1>
          <p className="text-gray-600">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Location Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isWithinArea ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <MapPin
                    className={`w-6 h-6 ${
                      isWithinArea ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Status Lokasi
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isWithinArea ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {loadingLocation
                      ? "Mencari..."
                      : isWithinArea
                      ? "Dalam Area"
                      : "Luar Area"}
                  </p>
                  {distance !== null && (
                    <p className="text-sm text-gray-500">
                      {distance}m dari kampus
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check In Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    todayAttendance?.check_in_time
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  <CheckCircle
                    className={`w-6 h-6 ${
                      todayAttendance?.check_in_time
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Check In</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {todayAttendance?.check_in_time
                      ? format(new Date(todayAttendance.check_in_time), "HH:mm")
                      : "Belum Check In"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check Out Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    todayAttendance?.check_out_time
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Clock
                    className={`w-6 h-6 ${
                      todayAttendance?.check_out_time
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Check Out</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {todayAttendance?.check_out_time
                      ? format(
                          new Date(todayAttendance.check_out_time),
                          "HH:mm"
                        )
                      : "Belum Check Out"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lokasi Absensi
                </h3>
                <button
                  onClick={getUserLocation}
                  disabled={loadingLocation}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loadingLocation ? "animate-spin" : ""
                    }`}
                  />
                  <span>Refresh</span>
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceSettings ? (
                <LocationMap
                  centerLat={attendanceSettings.latitude}
                  centerLng={attendanceSettings.longitude}
                  radius={attendanceSettings.radius_meters}
                  userLat={userLocation?.lat}
                  userLng={userLocation?.lng}
                  locationName={attendanceSettings.location_name}
                />
              ) : (
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Memuat peta...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Aksi Absensi
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error/Location Error Display */}
              {(error || locationError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 text-sm">
                      {error || locationError}
                    </p>
                  </div>
                </div>
              )}

              {/* Location not available */}
              {!userLocation && !loadingLocation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-yellow-700 text-sm font-medium">
                        Lokasi Tidak Tersedia
                      </p>
                      <p className="text-yellow-600 text-sm">
                        Pastikan GPS aktif dan izinkan akses lokasi
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Check In Button */}
              <button
                onClick={handleCheckIn}
                disabled={!canCheckIn || loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  canCheckIn && !loading
                    ? "gradient-primary text-white hover:opacity-90"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Memproses..." : "Check In"}
              </button>

              {/* Check Out Button */}
              <button
                onClick={handleCheckOut}
                disabled={!canCheckOut || loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  canCheckOut && !loading
                    ? "gradient-secondary text-white hover:opacity-90"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Memproses..." : "Check Out"}
              </button>

              {/* Status Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Informasi:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Pastikan Anda berada dalam area kampus</li>
                  <li>• Check-in harus dilakukan sebelum jam masuk</li>
                  <li>• Check-out dilakukan setelah jam keluar</li>
                  <li>• GPS harus aktif untuk validasi lokasi</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
