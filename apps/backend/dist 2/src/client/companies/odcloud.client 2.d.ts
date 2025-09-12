import { ConfigService } from '@nestjs/config';
export declare class OdcloudClient {
    private readonly config;
    constructor(config: ConfigService);
    private qs;
    status(bNo: string): Promise<any>;
}
