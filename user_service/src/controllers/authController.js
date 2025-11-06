import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import logger from "../configs/logger.js";
import {SignToken} from "../utils/authvalidate.js";
import { publishEvent } from "../configs/mq.js";
import { validateRegister, validateLogin } from "../utils/validInput.js";

export const Register = async (req, res) => {
    try{
        const { error } = validateRegister(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const {username, email, password, isPrivate} = req.body;

        const hashpass = await bcrypt.hash(password, 10);

        const existing = await User.findOne({where: {email}});
        if(existing) return res.status(401).json("Email already in use");

        const user = await User.create({
            username, 
            email, 
            password: hashpass,
            isPrivate: isPrivate || false
        });

        logger.info(`User creation successful, ${username}-${email}`);

        const exchange = process.env.EVENT_EXCHANGE || "social.events";
        await publishEvent(exchange, "user.created", {
            userId: user.id,
            displayName: user.username,
            isPrivate: user.isPrivate
        });

        res.status(201).json({ 
            message: "User created successfully",
        });
    }catch(err){
        logger.error("Error creating user: %o", err);
        res.status(500).json("Internal server error");
    }
}

export const Login = async (req, res) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const {email, password} = req.body;

        const user = await User.findOne({where: {email}});
        if(!user) return res.status(401).json("Invalid credential");
        
        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid) return res.status(401).json("Invalid credential");

        const token = SignToken({id: user.id});
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: Number(process.env.COOKIE_EXPIRES_IN),
        });

        logger.info(`Login successfull: ${email}`);

        res.json({ 
            message: "Login successful", 
            token
        });

    } catch (err) {
        logger.error("Error during login: %o", err);
        res.status(500).json("Internal server error");
    }
}