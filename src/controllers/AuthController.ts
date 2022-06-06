import prisma from "../prisma"
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'


class AuthController {

    async DoLogin(request: Request, response: Response, next: NextFunction) {
        const { username, password } = request.body;

        const user = await prisma.users.findFirst({
            where: {
                username: username
            }
        })

        if (user != null) {
            if (await bcrypt.compare(password, user.password)) {
                if (!process.env.SECRET) response.status(500).json({ message: 'Server couldnot decode token.' })
                var secret: jwt.Secret = String(process.env.SECRET);

                const id = user.username; 
                const token = jwt.sign({ id }, secret, {
                    expiresIn: 3000 // expires in 5min
                });

                return response.status(200).cookie('auth-token', 'Bearer ' + token, { expires: new Date(Date.now() + 50 * 60 * 1000) }).json({ auth: true, token: token });
            }

            return response.status(500).json({ message: 'Login inválido!' });
        }
    }


    DoLogout(request: Request, response: Response, next: NextFunction) {
        return response.status(200).cookie('auth-token', '').json({ auth: false, token: '' });
    }

    ValidateJwt(request: Request, response: Response, next: NextFunction) {
        var token = request.cookies['auth-token'];

        if (!token) return response.status(401).json({ auth: false, message: 'No token provided.' });


        token = token.substring(7);

        try {
            var dec = jwt.verify(token, String(process.env.SECRET));
            response.status(201);
            next()

        } catch (error) {
            response.status(401).json(error)
        }

    }
}

export { AuthController };

