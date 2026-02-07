import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Supabase 설정 여부 확인
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Supabase 클라이언트 (설정이 없으면 더미 클라이언트)
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient); // 타입 에러 방지용

// 타입 정의
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          nickname: string | null;
          rank: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          nickname?: string | null;
          rank?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          nickname?: string | null;
          rank?: string;
          created_at?: string;
        };
      };
      user_stats: {
        Row: {
          user_id: string;
          total_focus_minutes: number;
          completed_sessions: number;
          failed_sessions: number;
          longest_session: number;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
        };
        Insert: {
          user_id: string;
          total_focus_minutes?: number;
          completed_sessions?: number;
          failed_sessions?: number;
          longest_session?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
        };
        Update: {
          user_id?: string;
          total_focus_minutes?: number;
          completed_sessions?: number;
          failed_sessions?: number;
          longest_session?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
        };
      };
      voyages: {
        Row: {
          id: string;
          user_id: string;
          departure_port: string;
          arrival_port: string;
          duration: number;
          distance: number;
          cabin_number: string | null;
          focus_purpose: string | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          departure_port: string;
          arrival_port: string;
          duration: number;
          distance: number;
          cabin_number?: string | null;
          focus_purpose?: string | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          departure_port?: string;
          arrival_port?: string;
          duration?: number;
          distance?: number;
          cabin_number?: string | null;
          focus_purpose?: string | null;
          completed_at?: string;
        };
      };
      daily_goals: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          goal_minutes: number;
          achieved_minutes: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          goal_minutes?: number;
          achieved_minutes?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          goal_minutes?: number;
          achieved_minutes?: number;
        };
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      visited_ports: {
        Row: {
          user_id: string;
          port_id: string;
          first_visited_at: string;
          visit_count: number;
        };
        Insert: {
          user_id: string;
          port_id: string;
          first_visited_at?: string;
          visit_count?: number;
        };
        Update: {
          user_id?: string;
          port_id?: string;
          first_visited_at?: string;
          visit_count?: number;
        };
      };
    };
  };
}
