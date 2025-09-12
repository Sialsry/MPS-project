import { SystemService } from './system.service';
import { SystemStatsDto, SystemChartDto, SystemKeysDto } from './dto/system.dto';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getApiStats(query: SystemStatsDto): Promise<{
        musicCalls: number;
        lyricsCalls: number;
        totalCalls: number;
        activeApiKeys: number;
        musicCallsChange: number;
        lyricsCallsChange: number;
        totalCallsChange: number;
        activeApiKeysChange: number;
    }>;
    getApiChart(query: SystemChartDto): Promise<{
        labels: any[];
        freeCalls: number[];
        standardCalls: number[];
        businessCalls: number[];
        musicCalls: number[];
        lyricsCalls: number[];
    }>;
    getApiKeys(query: SystemKeysDto): Promise<{
        companyId: any;
        company: any;
        key: any;
        created: any;
        lastUsed: any;
        totalCalls: number;
        musicCalls: number;
        lyricsCalls: number;
    }[]>;
}
