"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getCurrentLocation, isWithinRadius } from "@/lib/utils/location";
import { format } from "date-fns";

export function useAttendance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const supabase = createClient();

  const checkIn = useCallback(async () => {
    if (!profile?.id) {
      setError("User tidak terautentikasi");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user location
      const position = await getCurrentLocation();
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Get attendance settings
      const { data: settings, error: settingsError } = await supabase
        .from("attendance_settings")
        .select("*")
        .single();

      if (settingsError || !settings) {
        throw new Error("Pengaturan lokasi absensi tidak ditemukan");
      }

      // Check if within radius
      const withinRadius = isWithinRadius(
        userLat,
        userLng,
        settings.latitude,
        settings.longitude,
        settings.radius_meters
      );

      if (!withinRadius) {
        throw new Error("Anda berada di luar area absensi yang diizinkan");
      }

      // Check if already checked in today
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: existingAttendance } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", profile.id)
        .eq("date", today)
        .single();

      if (existingAttendance?.check_in_time) {
        throw new Error("Anda sudah melakukan check-in hari ini");
      }

      // Determine status based on schedule
      const { data: schedule } = await supabase
        .from("schedules")
        .select("*")
        .eq("day_of_week", new Date().getDay() || 7) // Sunday = 7
        .eq("is_active", true)
        .single();

      let status = "present";
      if (schedule) {
        const now = new Date();
        const [startHour, startMinute] = schedule.start_time
          .split(":")
          .map(Number);
        const scheduleStart = new Date();
        scheduleStart.setHours(startHour, startMinute, 0, 0);

        if (now > scheduleStart) {
          status = "late";
        }
      }

      // Insert or update attendance
      const attendanceData = {
        user_id: profile.id,
        date: today,
        check_in_time: new Date().toISOString(),
        check_in_latitude: userLat,
        check_in_longitude: userLng,
        status,
      };

      if (existingAttendance) {
        const { error: updateError } = await supabase
          .from("attendances")
          .update(attendanceData)
          .eq("id", existingAttendance.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("attendances")
          .insert(attendanceData);

        if (insertError) throw insertError;
      }

      return true;
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat check-in");
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile?.id, supabase]);

  const checkOut = useCallback(async () => {
    if (!profile?.id) {
      setError("User tidak terautentikasi");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user location
      const position = await getCurrentLocation();
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Get attendance settings
      const { data: settings, error: settingsError } = await supabase
        .from("attendance_settings")
        .select("*")
        .single();

      if (settingsError || !settings) {
        throw new Error("Pengaturan lokasi absensi tidak ditemukan");
      }

      // Check if within radius
      const withinRadius = isWithinRadius(
        userLat,
        userLng,
        settings.latitude,
        settings.longitude,
        settings.radius_meters
      );

      if (!withinRadius) {
        throw new Error("Anda berada di luar area absensi yang diizinkan");
      }

      // Get today's attendance
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: attendance, error: attendanceError } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", profile.id)
        .eq("date", today)
        .single();

      if (attendanceError || !attendance) {
        throw new Error("Anda belum melakukan check-in hari ini");
      }

      if (attendance.check_out_time) {
        throw new Error("Anda sudah melakukan check-out hari ini");
      }

      // Update attendance with check-out
      const { error: updateError } = await supabase
        .from("attendances")
        .update({
          check_out_time: new Date().toISOString(),
          check_out_latitude: userLat,
          check_out_longitude: userLng,
        })
        .eq("id", attendance.id);

      if (updateError) throw updateError;

      return true;
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat check-out");
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile?.id, supabase]);

  return {
    checkIn,
    checkOut,
    loading,
    error,
    clearError: () => setError(null),
  };
}
