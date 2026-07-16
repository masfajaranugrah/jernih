"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRentalItemDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_rental_item_dto_1 = require("./create-rental-item.dto");
class UpdateRentalItemDto extends (0, mapped_types_1.PartialType)(create_rental_item_dto_1.CreateRentalItemDto) {
}
exports.UpdateRentalItemDto = UpdateRentalItemDto;
//# sourceMappingURL=update-rental-item.dto.js.map