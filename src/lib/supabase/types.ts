/**
 * Hand-written to match supabase/migrations. Regenerate with
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 * once the cloud project exists, and this file becomes the generated one.
 */

export type OrderStatus = "pending" | "approved" | "delivered" | "cancelled";
export type RepairStatus = "received" | "mending" | "sent_back" | "closed";
export type MessageStatus = "new" | "read" | "archived";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = { created_at: string };

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
  is_default: boolean;
} & Timestamps;

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  blurb: string;
  art_kind: string;
  position: number;
  is_active: boolean;
} & Timestamps;

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  price: number;
  blurb: string;
  material: string;
  dimensions: string;
  care: string;
  maker: string;
  lead_time: string;
  art_kind: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  storage_path: string;
  alt: string;
  position: number;
} & Timestamps;

export type SavedItemRow = {
  user_id: string;
  product_id: string;
} & Timestamps;

export type OrderAttribution = {
  session_id?: string | null;
  referrer_host?: string | null;
  social_referrer?: string | null;
  utm?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    term?: string | null;
  } | null;
};

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  ship_line1: string;
  ship_city: string;
  ship_postcode: string;
  ship_country: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  attribution: OrderAttribution;
  admin_note: string;
  placed_at: string;
  approved_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_slug: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type RepairRow = {
  id: string;
  reference: string;
  user_id: string | null;
  customer_email: string;
  piece: string;
  note: string;
  status: RepairStatus;
  admin_note: string;
  created_at: string;
  updated_at: string;
};

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
} & Timestamps;

export type NewsletterRow = {
  id: string;
  email: string;
  created_at: string;
  unsubscribed_at: string | null;
};

export type SessionRow = {
  id: string;
  session_id: string | null;
  path: string | null;
  referrer: string | null;
  referrer_host: string | null;
  social_referrer: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  utm: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    content?: string | null;
    term?: string | null;
  };
} & Timestamps;

export type SettingRow = {
  key: string;
  value: Json;
  updated_at: string;
};

/** Insert shapes: anything with a default is optional. */
type Insert<T, Required extends keyof T> = Partial<T> & Pick<T, Required>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Insert<ProfileRow, "id" | "email">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      addresses: {
        Row: AddressRow;
        Insert: Insert<AddressRow, "user_id" | "full_name" | "line1" | "city">;
        Update: Partial<AddressRow>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: Insert<CategoryRow, "slug" | "name" | "short_name">;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Insert<ProductRow, "slug" | "name" | "price">;
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      product_images: {
        Row: ProductImageRow;
        Insert: Insert<ProductImageRow, "product_id" | "storage_path">;
        Update: Partial<ProductImageRow>;
        Relationships: [];
      };
      saved_items: {
        Row: SavedItemRow;
        Insert: Insert<SavedItemRow, "user_id" | "product_id">;
        Update: Partial<SavedItemRow>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Insert<
          OrderRow,
          | "order_number"
          | "customer_name"
          | "customer_email"
          | "ship_line1"
          | "ship_city"
          | "subtotal"
          | "total"
        >;
        Update: Partial<OrderRow>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: Insert<
          OrderItemRow,
          | "order_id"
          | "product_slug"
          | "product_name"
          | "unit_price"
          | "quantity"
          | "line_total"
        >;
        Update: Partial<OrderItemRow>;
        Relationships: [];
      };
      repairs: {
        Row: RepairRow;
        Insert: Insert<RepairRow, "reference" | "piece">;
        Update: Partial<RepairRow>;
        Relationships: [];
      };
      contact_messages: {
        Row: ContactMessageRow;
        Insert: Insert<ContactMessageRow, "name" | "email" | "message">;
        Update: Partial<ContactMessageRow>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: NewsletterRow;
        Insert: Insert<NewsletterRow, "email">;
        Update: Partial<NewsletterRow>;
        Relationships: [];
      };
      sessions: {
        Row: SessionRow;
        Insert: Partial<SessionRow>;
        Update: Partial<SessionRow>;
        Relationships: [];
      };
      settings: {
        Row: SettingRow;
        Insert: Insert<SettingRow, "key" | "value">;
        Update: Partial<SettingRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      next_order_number: { Args: Record<string, never>; Returns: string };
      next_repair_reference: { Args: Record<string, never>; Returns: string };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      place_order: {
        Args: {
          p_items: Json;
          p_customer: Json;
          p_attribution?: Json;
          p_user_id?: string | null;
        };
        Returns: OrderRow;
      };
      set_order_status: {
        Args: { p_order_id: string; p_status: OrderStatus };
        Returns: OrderRow;
      };
      open_repair: {
        Args: {
          p_piece: string;
          p_note: string;
          p_email?: string;
          p_user_id?: string | null;
        };
        Returns: RepairRow;
      };
    };
    Enums: {
      order_status: OrderStatus;
      repair_status: RepairStatus;
      message_status: MessageStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};
