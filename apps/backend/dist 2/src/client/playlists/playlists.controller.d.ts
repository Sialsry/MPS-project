import { PlaylistService } from './playlists.service';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { RemoveTracksDto } from './dto/remove-tracks.dto';
import { UsePlaylistDto } from './dto/use-playlist.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
export declare class PlaylistsController {
    private readonly service;
    constructor(service: PlaylistService);
    create(req: any, dto: CreatePlaylistDto): Promise<any>;
    list(req: any): Promise<{
        id: number;
        name: string;
        count: number;
        cover: any;
    }[]>;
    detail(req: any, playlistId: number): Promise<{
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
    }>;
    tracks(req: any, playlistId: number): Promise<{
        id: number;
        title: string;
        artist: string;
        coverUrl: any;
        audioUrl: string;
        durationSec: number;
    }[]>;
    replaceTracks(req: any, playlistId: number, dto: UpdatePlaylistDto): Promise<{
        playlistId: number;
        count: number;
    }>;
    removeTracks(req: any, playlistId: number, dto: RemoveTracksDto): Promise<any>;
    remove(req: any, playlistId: number): Promise<{
        deleted: boolean;
    }>;
    use(req: any, playlistId: number, dto: UsePlaylistDto): Promise<{
        count: number;
    }>;
}
