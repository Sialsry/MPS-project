export declare const playlist_items: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "playlist_items";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "playlist_items";
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
        playlist_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "playlist_id";
            tableName: "playlist_items";
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
        music_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "music_id";
            tableName: "playlist_items";
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
        added_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "added_at";
            tableName: "playlist_items";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const playlist_itemsRelations: import("drizzle-orm").Relations<"playlist_items", {
    playlist: import("drizzle-orm").One<"playlists", true>;
    music: import("drizzle-orm").One<"musics", true>;
}>;
