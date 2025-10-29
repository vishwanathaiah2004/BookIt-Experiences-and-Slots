export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      experiences: {
        Row: {
          id: string
          title: string
          image: string
          description: string
          price: number
          location: string
          guide_name: string | null
          about: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          image: string
          description: string
          price: number
          location: string
          guide_name?: string | null
          about?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          image?: string
          description?: string
          price?: number
          location?: string
          guide_name?: string | null
          about?: string | null
          created_at?: string
        }
      }
      available_slots: {
        Row: {
          id: string
          experience_id: string
          date: string
          time: string
          total_slots: number
          booked_slots: number
          created_at: string
        }
        Insert: {
          id?: string
          experience_id: string
          date: string
          time: string
          total_slots?: number
          booked_slots?: number
          created_at?: string
        }
        Update: {
          id?: string
          experience_id?: string
          date?: string
          time?: string
          total_slots?: number
          booked_slots?: number
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_ref: string
          experience_id: string
          slot_id: string
          user_name: string
          user_email: string
          quantity: number
          subtotal: number
          taxes: number
          discount: number
          total_price: number
          promo_code: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_ref: string
          experience_id: string
          slot_id: string
          user_name: string
          user_email: string
          quantity?: number
          subtotal: number
          taxes?: number
          discount?: number
          total_price: number
          promo_code?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_ref?: string
          experience_id?: string
          slot_id?: string
          user_name?: string
          user_email?: string
          quantity?: number
          subtotal?: number
          taxes?: number
          discount?: number
          total_price?: number
          promo_code?: string | null
          status?: string
          created_at?: string
        }
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          discount_type: string
          discount_value: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: string
          discount_value: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: string
          discount_value?: number
          is_active?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type Experience = Database['public']['Tables']['experiences']['Row'];
export type AvailableSlot = Database['public']['Tables']['available_slots']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type PromoCode = Database['public']['Tables']['promo_codes']['Row'];

export interface ExperienceWithSlots extends Experience {
  available_slots: AvailableSlot[];
}

export interface SlotAvailability extends AvailableSlot {
  available: number;
  soldOut: boolean;
}
