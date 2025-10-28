export interface FirestoreTimestamp {
    type: "firestore/timestamp/1.0";
    seconds: number;
    nanoseconds: number;
}

export interface AddressComponent {
    isShown: boolean;
    address: string;
}

export interface Location {
    country_code: string;
    name: string;
    country: string;
    longitude: number;
    latitude: number;
    addressComponents: AddressComponent[];
    formattedAddress: string;
}

export interface ProfileLayout {
    latest: string | null;
    home: string | null;
}

export interface User {
    id: string;
    isPro: boolean;
    column_layout: string | null;
    bio_url: string | null;
    show_counters_rest_of_app: boolean;
    location: Location | null;
    is_deactivated: boolean;
    fcm_token: string | null;
    email: string;
    profile_layout: ProfileLayout;
    last_entrance_at: FirestoreTimestamp;
    menu_title: string | null;
    bio: string | null;
    profile_cover: string | null;
    followee_count: number | null;
    language: string;
    profile_start: string | null;
    follower_approval: boolean | null;
    is_latest_activated: boolean;
    blocked_user_ids: string[] | null;
    is_invited: boolean | null;
    last_operation_by: string;
    name: string;
    hide_time_since_posted: boolean;
    last_searches: any | null;
    feelings: any | null;
    rate: number | null;
    username: string;
    plan: string | null;
    profile_lists: any | null;
    gender: string | null;
    birth_date_at: FirestoreTimestamp | null;
    follower_count: number | null;
    photo_url: string | null;
    match_preferences: any | null;
    profile_lists_layout: any | null;
    is_pioneer: boolean;
    notification_settings: any | null;
    show_counters_on_profile: boolean;
    created_at: FirestoreTimestamp;
    hide_story_viewers: boolean | null;
    is_second_layout: boolean;
    private_account: boolean;
    member_count: number | null;
}
