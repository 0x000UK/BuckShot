export interface GameFaq {
    id?: string;
    gameId?: string;
    gameTitle?: string;
    gameSlug?: string;
    gameCover?: string;
    title: string;
    body: string;
    category?: string;
    pinned?: boolean;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DailyMetricData {
    date: string;
    visits: number;
    uniqueVisitors: number;
    discussions: number;
    wishlistAdds: number;
    downloadClicks?: number;
}

export interface AdminOverviewStats {
    totalGames: number;
    publishedGames: number;
    draftGames: number;
    totalCategories: number;
    totalUsers: number;
    newUsersThisMonth: number;
    totalDiscussions: number;
    totalDownloadClicks?: number;
}
