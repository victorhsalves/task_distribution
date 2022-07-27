import prisma from "../prisma"
import { Roles } from "../utils/Roles";
import { NextFunction, Request, Response } from "express"
import bcrypt from 'bcrypt'


class UserController {

    // async grantAccess(action: String, resource: String, req: Request, res: Response , next: NextFunction) {
    //     const { role } = req.body;
    //     try {
    //         const permission = Roles.can(role)[action](resource);
    //         if (!permission.granted) {
    //             return res.status(401).json({
    //                 error: "You don't have enough permission to perform this action"
    //             });
    //         }
    //         next()
    //     } catch (error) {
    //         next(error)
    //     }
    // }

    async createUser(request: Request, response: Response) {
        const { username, password, cpf, name, birth_date, supervisor_id, profile_id } = request.body;

        const user = await prisma.users.findFirst({
            where: {
                OR: [{
                    username: username
                },
                {
                    cpf: cpf
                }
                ]
            }
        })

        if (user) {
            return response.status(200).json({ message: 'Usuário já cadastrado!' })
        }
        else {
            const salt = await bcrypt.genSalt(6);
            const hashedPwd = await bcrypt.hash(password, salt);

            await prisma.users.create({
                data: {
                    username: username,
                    password: hashedPwd,
                    cpf: cpf,
                    name: name,
                    birth_date: new Date(birth_date),
                    supervisor_id: supervisor_id,
                    profile_id: profile_id
                }
            }).then(() => {
                return response.status(200).json(user)
            }).catch((err) => {
                console.log(err)
                return response.status(500).json({ message: 'Erro ao criar usuário!', erro: err })
            })
        }
    }

    async getUser(request: Request, response: Response) {
        const { username, cpf } = request.query;

        const users = await prisma.users.findMany({
            where: {
                OR: [{
                    cpf: cpf?.toString()
                },
                {
                    username: username?.toString()
                }]
            },
            select: {
                username: true,
                cpf: true,
                name: true,
                supervisor_id: true,
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

        if (users) {
            return response.status(200).json(users)
        }
        else {
            return response.status(404).json('no users found!')
        }
    }

    async setAvailability(request: Request, response: Response) {
        const { userList, availability } = request.body;

        console.log('body')
        console.log(userList)
        console.log(availability)
        if (availability == true) {
            try {
                const updatedUserLogin = await prisma.userLogin.updateMany({
                    where: {
                        id: {
                            in: userList
                        }
                    },
                    data: {
                        available: 1
                    }
                })
                console.log('ok false')
                return response.status(200).json({ message: 'Usuários agora estão disponíveis!' })
            } catch (error) {
                console.log(error)
                return response.status(500).json({ error: error })
            }
        } else if (availability == false) {
            try {
                const updatedUserLogin = await prisma.userLogin.updateMany({
                    where: {
                        id: {
                            in: userList
                        }
                    },
                    data: {
                        available: 0
                    }
                })
                console.log('ok false')
                return response.status(200).json({ message: 'Usuários agora estão indisponíveis!' })
            } catch (error) {
                console.log(error)
                return response.status(500).json({ error: error })
            }

        } else {
            console.log('algo errado')
        }
    }
}

export { UserController }