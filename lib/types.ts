export type EventStatus = 'draft' | 'published' | 'cancelled';
export type EventBackgroundPreset = 'galaxy' | 'balatro' | 'prism' | 'plasma' | 'tunnel' | 'warp' | 'threads' | 'aurora';
export type ApprovalMode = 'auto' | 'manual';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type RegistrationState = 'not_open' | 'open' | 'closed' | 'full' | 'cancelled';
export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox';

export type RegistrationField = { id?: string; event_id?: string; type: FieldType; label: string; description?: string | null; placeholder?: string | null; options?: {label: string; value: string}[] | null; required: boolean; sort_order: number };
export type LamaEvent = { id: string; slug: string; title: string; description: string; cover_image_path: string | null; background_preset: EventBackgroundPreset; host_name: string; start_at: string; end_at: string; timezone: string; location_type: 'in_person' | 'online'; location_name: string | null; location_url: string | null; map_url: string | null; registration_enabled: boolean; registration_open_at: string | null; registration_close_at: string | null; capacity: number | null; approval_mode: ApprovalMode; status: EventStatus; created_by: string; created_at: string; updated_at: string; };
export type Registration = { id: string; event_id: string; name: string; email: string; normalized_email: string; answers: Record<string, unknown>; status: RegistrationStatus; consent_at: string; registered_at: string; updated_at: string; cancelled_at: string | null; cancel_token_hash?: string };
