import Joi  from "joi";

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must not exceed 30 characters",
        "any.required": "Username is required",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Email must be a valid address",
        "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
    }),
});

const loginSchema = Joi.object({
    
    email: Joi.string().email().required().messages({
        "string.email": "Email must be a valid address",
        "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required", 
    }),
});

export const validateRegister = (data) => registerSchema.validate(data, { abortEarly: false });
export const validateLogin = (data) => loginSchema.validate(data, {abortEarly: false});
