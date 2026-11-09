import { useMediaQuery } from "react-responsive";
import defaultTheme from "tailwindcss/defaultTheme.js";
import resolveConfig from "tailwindcss/resolveConfig";
const tailwindConfig = require("../../tailwind.config.js");


const fullTheme = { ...defaultTheme, ...resolveConfig(tailwindConfig).theme };

export enum BreakPoint {
    SM,
    MD,
    LG,
    XL,
}

const breakPointWidth = {
    [BreakPoint.SM]: fullTheme.screens.sm,
    [BreakPoint.MD]: fullTheme.screens.md,
    [BreakPoint.LG]: fullTheme.screens.lg,
    [BreakPoint.XL]: fullTheme.screens.xl,
};

export const useBreakPoint = (
    breakPoint: BreakPoint,
    onChange?: (value: boolean) => void,
) => {
    return useMediaQuery(
        { minWidth: breakPointWidth[breakPoint] },
        undefined,
        onChange,
    );
};
