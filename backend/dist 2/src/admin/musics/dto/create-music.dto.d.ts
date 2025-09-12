export declare class CreateMusicDto {
    title: string;
    artist: string;
    category: string;
    musicType: '일반' | 'Inst';
    durationSec: number;
    tags?: string;
    releaseDate?: string;
    lyricist?: string;
    composer?: string;
    arranger?: string;
    isrc?: string;
    priceMusicOnly: number;
    priceLyricsOnly: number;
    priceRef?: number;
    rewardPerPlay: number;
    maxPlayCount?: number;
    hasRewards?: boolean;
    grade: 0 | 1 | 2;
    lyricsText?: string;
    lyricsInputType: 'file' | 'text';
    audioFilePath: string;
    coverImagePath?: string;
    lyricsFilePath?: string;
}
