import { User } from "./user";

export interface FirestoreTimestamp {
    type: "firestore/timestamp/1.0";
    seconds: number;
    nanoseconds: number;
}

export interface AddressComponent {
    address: string;
    isShown: boolean;
}

export interface Location {
    latitude: number;
    longitude: number;
    country_code: string;
    country: string;
    formattedAddress: string;
    name: string;
    addressComponents: AddressComponent[];
}

export interface GeoLocation {
    lat: number;
    lng: number;
}

export interface Post {
    id: string;
    watched_50_percent: number | null;
    go_link_count: number | null;
    languageWithCountry: string;
    watched_length_seconds: number | null;
    view_count: number;
    location: Location;
    retention_rate: number | null;
    created_at: FirestoreTimestamp;
    latitude: number | null;
    watched_75_percent: number | null;
    is_comments_active: boolean;
    comment_count: number;
    videoProcessStatus: number;
    userDisplayName: string;
    unique_view_count: number | null;
    aspect_ratio: number;
    video_length_seconds: number;
    profile_list_id: string | null;
    contentType: number;
    list_id_for_notify: string | null;
    language: string;
    list_name_for_notify: string | null;
    description: string;
    visibility: number;
    share_count: number;
    like_count: number;
    status: "published" | "draft" | string;
    watched_90_percent: number | null;
    thumbnail_custom: string | null;
    hashtags: string[];
    go_to: string | null;
    video_url: string | null;
    last_operation_by: string;
    user_id: string;
    reactions: any; // if you know its structure, we can replace `any`
    people_tags: any[]; // same here
    save_list_ids: string[];
    _geoloc: GeoLocation;
    save_count: number;
    longitude: number | null;
    isMuted: boolean;
    isPlaying: boolean;
    user: User;
}
