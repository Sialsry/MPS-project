"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExploreDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_explore_dto_1 = require("./create-explore.dto");
class UpdateExploreDto extends (0, mapped_types_1.PartialType)(create_explore_dto_1.CreateExploreDto) {
}
exports.UpdateExploreDto = UpdateExploreDto;
//# sourceMappingURL=update-explore.dto.js.map