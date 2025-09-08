export type Company = {
    id: string
    name: string
    tier: string
    totalTokens: number
    monthlyEarned: number
    monthlyUsed: number
    usageRate: number
    activeTracks: number
    status: 'active' | 'inactive' | 'suspended'
    lastActivity: string
    joinedDate: string
    contactEmail: string
    contactPhone: string
    businessNumber: string
    subscriptionStart: string
    subscriptionEnd: string
    monthlyUsage: number[]
    monthlyRewards: number[]
    topTracks: Array<{ title: string; usage: number; category: string }>
}
