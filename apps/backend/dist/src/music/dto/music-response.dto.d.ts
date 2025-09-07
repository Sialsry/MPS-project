export declare class PlayMusicResponseDto {
    success: boolean;
    message: string;
    data?: {
        musicId: number;
        title: string;
        artist: string;
        duration: number;
        playSessionId: number;
    };
}
export declare class DownloadLyricResponseDto {
    success: boolean;
    message: string;
    data?: {
        musicId: number;
        title: string;
        filename: string;
        downloadCount: number;
    };
}
export declare class ApiErrorResponseDto {
    success: false;
    error: string;
    statusCode: number;
    timestamp: string;
}
