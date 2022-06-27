import prisma from "../prisma"
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'


class AuthController {

    async doLogin(request: Request, response: Response, next: NextFunction) {
        const { username, password } = request.body;
        console.log(username)
        console.log(password)

        const user = await prisma.users.findFirst({
            where: {
                username: username
            },
            include: {
                profile: {
                    select: {
                        name: true
                    }
                },
                users: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (user != null) {
            if (await bcrypt.compare(password, user.password)) {
                if (!process.env.SECRET) response.status(500).json({ message: 'Server could not decode token.' })
                var secret: jwt.Secret = String(process.env.SECRET);

                const token = jwt.sign(
                    { 
                        username: user.username, 
                        profile: user.profile.name, 
                        name: user.name,
                        supervisor: user.users?.name
                    }, secret, {
                    expiresIn: 3000 // expires in 5min
                });

                const userLogin = await prisma.userLogin.findFirst({
                    where: {
                        users: {
                            username: user.username
                        },
                        session_date: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
                        }
                    }
                })
                if (!userLogin) {
                    await prisma.userLogin.create({
                        data: {
                            user_id: user.id,
                            available: 1
                        }
                    })
                }
                console.log(response.cookie)
                console.log(token)
                return response.status(200).cookie('auth-token', 'Bearer ' + token, { expires: new Date(Date.now() + 50 * 60 * 1000) }).json({ auth: true, token: token });
            }

            return response.status(500).json({ message: 'Login inválido!' });
        }
    }

    async doLogout(request: Request, response: Response, next: NextFunction) {
        var token = request.body.headers['Authorization'];
        
        if (!token) return response.status(401).json({ auth: false, message: 'No token provided.' });
        token = token.substring(7);
        try {
            var decoded = jwt.verify(token, String(process.env.SECRET));
            console.log(decoded)
            console.log((<any>decoded).username)
            const login = await prisma.userLogin.findFirst({
                where: {
                    users: {
                        username: (<any>decoded).username
                    }
                }
            })
    
            if (login) {
                await prisma.userLogin.delete({
                    where: {
                        id: login.id
                    }
                })
            }
            return response.status(200).cookie('auth-token', '').json({ auth: false, token: '' });
        } catch (error) {
            response.status(401).json(error)
        }
        
    }

    validateJwt(request: Request, response: Response, next: NextFunction) {
        // var token = request.cookies['auth-token'];
        var token = request.headers.authorization;
        console.log(token)

        if (!token) return response.status(401).json({ auth: false, message: 'No token provided.' });


        token = token.substring(7);

        try {
            var dec = jwt.verify(token, String(process.env.SECRET));
            console.log(dec)
            console.log((<any>dec).id)
            response.status(201);
            next()

        } catch (error) {
            response.status(401).json(error)
        }

    }

    async getLoggedUsers(request: Request, response: Response, next: NextFunction) { 
        const loggedUsers = await prisma.userLogin.findMany({
            where: {
                session_date: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
                }
            },
            include: {
                users: {
                    select: {
                        username: true,
                        name: true
                    }
                }
            }
        })

        return response.status(200).json(loggedUsers)
    }

}

export { AuthController };

