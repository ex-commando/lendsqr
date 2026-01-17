import { Response } from "express";

export const successResponse = (res: Response, message: string, data: any = null, code: number = 200) => {
    return res.status(code).json({
        status: "success",
        message,
        data,
    });
};

export const errorResponse = (res: Response, message: string, code: number = 400, errors: any = null) => {
    return res.status(code).json({
        status: "error",
        message,
        errors,
    });
};
