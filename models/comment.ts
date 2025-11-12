import { User } from "./user";

export interface Comment {
    id?: string;
    uid?: string;
    created_at?: string;
    text?: string;
    like_count?: number;
    reply_count?: number;
    user?: User;
    is_liked?: boolean;
    is_member?: boolean;
    replies?: Comment[];
    myLikeId: string | null;
}