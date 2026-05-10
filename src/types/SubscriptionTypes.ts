export interface Subscription {
    planName: string | null;
    status: string | null; // SubscriptionStatus (Enum)
    startedAt: string | null; // LocalDate
    expiredAt: string | null; // LocalDate
    nextPaymentAt: string | null; // LocalDate
    active: boolean;
}