import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-companie.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    register(file: Express.Multer.File | undefined, dto: CreateCompanyDto, skipNts?: string): Promise<{
        id: number;
        name: string;
        email: string;
        grade: "free" | "standard" | "business";
        created_at: Date | null;
        api_key: string;
        api_key_hint: string;
        blockchain: {
            eoaAddress: string;
            smartAccountAddress: string;
            transactionHash: string | undefined;
        } | null;
    }>;
    verifyBusinessNumber(bNo: string, skipNts?: string): Promise<{
        ok: boolean;
        mode: string;
        source: "LOCAL" | "NTS" | "CHECKSUM" | "CLIENT";
        business_number: string;
        reason?: string | null;
        tax_type?: string | null;
        error?: string;
    }>;
    rotateById(id: number): Promise<{
        api_key: string;
        last4: string;
    }>;
    createOrGetSmartAccount(id: number): Promise<{
        eoaAddress: null;
        smartAccountAddress: string;
        isExisting: boolean;
        transactionHash?: undefined;
    } | {
        eoaAddress: string;
        smartAccountAddress: string;
        transactionHash: string | undefined;
        isExisting: boolean;
    }>;
}
