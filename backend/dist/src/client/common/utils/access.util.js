"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeToLevel = gradeToLevel;
exports.canUseTrack = canUseTrack;
function gradeToLevel(g) { return g === 'free' ? 0 : g === 'standard' ? 1 : 2; }
function canUseTrack(companyGrade, trackGradeRequired) {
    const lvl = gradeToLevel(companyGrade);
    return trackGradeRequired === 0 ? true : (lvl >= 1);
}
//# sourceMappingURL=access.util.js.map