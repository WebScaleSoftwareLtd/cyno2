import z from "zod";

export type Validator = {
    min: number;
    max: number;
};

export function constructValidator(validator: Validator) {
    let s = z.string();
    if (validator.min) s = s.min(validator.min);
    if (validator.max) s = s.max(validator.max);
    return s;
}
