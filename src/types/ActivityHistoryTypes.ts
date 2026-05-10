export interface ActivityHistory {
    id: number;
    type: string; // ActivityType (Enum)
    message: string;
    targetType: string;
    targetId: number;
    createdAt: string; // LocalDateTime
}