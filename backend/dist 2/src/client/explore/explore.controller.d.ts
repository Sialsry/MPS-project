import { JwtService } from '@nestjs/jwt';
import { ExploreService } from './explore.service';
export declare class ExploreController {
    private readonly explore;
    private readonly jwt;
    constructor(explore: ExploreService, jwt: JwtService);
    getSections(req: any): Promise<import("./dto/explore.dto").ExploreSectionsDto>;
}
