import { Role } from "@/model/auth/AuthData";
import { StudentTag } from "@/types/StudentTags";

export const studentTagsAllowed = (userRole: Role): StudentTag[] => {
    switch (userRole) {
        case Role.COACH_HEBREO:
        case Role.COACH_MENTORIA:
            return [StudentTag.ALUMNO];
        default:
            return [StudentTag.ALL, StudentTag.LEAD, StudentTag.ALUMNO, StudentTag.EX_ALUMNO];
    }
}