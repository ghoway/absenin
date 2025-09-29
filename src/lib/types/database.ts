export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          nim: string | null;
          name: string;
          email: string;
          role: "student" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          nim?: string | null;
          name: string;
          email: string;
          role?: "student" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          nim?: string | null;
          name?: string;
          email?: string;
          role?: "student" | "admin";
          created_at?: string;
        };
      };
      attendances: {
        Row: {
          id: string;
          user_id: string;
          check_in_time: string | null;
          check_out_time: string | null;
          check_in_latitude: number | null;
          check_in_longitude: number | null;
          check_out_latitude: number | null;
          check_out_longitude: number | null;
          status: "present" | "late" | "absent";
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          check_in_time?: string | null;
          check_out_time?: string | null;
          check_in_latitude?: number | null;
          check_in_longitude?: number | null;
          check_out_latitude?: number | null;
          check_out_longitude?: number | null;
          status?: "present" | "late" | "absent";
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          check_in_time?: string | null;
          check_out_time?: string | null;
          check_in_latitude?: number | null;
          check_in_longitude?: number | null;
          check_out_latitude?: number | null;
          check_out_longitude?: number | null;
          status?: "present" | "late" | "absent";
          date?: string;
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      attendance_settings: {
        Row: {
          id: string;
          latitude: number;
          longitude: number;
          radius_meters: number;
          location_name: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          latitude: number;
          longitude: number;
          radius_meters?: number;
          location_name: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          latitude?: number;
          longitude?: number;
          radius_meters?: number;
          location_name?: string;
          updated_at?: string;
        };
      };
    };
  };
}
