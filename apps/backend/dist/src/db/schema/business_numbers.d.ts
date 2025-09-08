export declare const business_numbers: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "business_numbers";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "business_numbers";
            dataType: "number";
            columnType: "PgBigSerial53";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        company_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "company_id";
            tableName: "business_numbers";
            dataType: "number";
            columnType: "PgBigInt53";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        number: import("drizzle-orm/pg-core").PgColumn<{
            name: "number";
            tableName: "business_numbers";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const business_numbersRelations: import("drizzle-orm").Relations<"business_numbers", {
    company: import("drizzle-orm").One<"companies", true>;
}>;
