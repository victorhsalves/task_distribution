import prisma from "../prisma"
import { Request , Response } from "express"


class UserController {
    async createUser(request: Request, response: Response) {
        const {
            username,
            password,
            cpf,
            name,
            birth_date,
            supervisor_id,
            profile_id
        } = request.body;

        const user = await prisma.users.findFirst({
            where: {
                OR: [{
                    username: username
                },
                {
                    cpf: cpf
                }
            ]}
        })

        if (user) {
            return response.status(200).json({message:'Usuário já cadastrado!'})
        }
        else{

            try {
                await prisma.users.create({
                    data: {
                        username: username,
                        password: password,
                        cpf: cpf,
                        name: name,
                        birth_date: new Date(birth_date),
                        supervisor_id: supervisor_id,
                        profile_id: profile_id
                    }
                })
                return response.status(200).json(user)
            }
            catch(err){
                console.log(err)
                return response.status(500).json(err)
            }
        }
    }

    async getUser(request: Request, response: Response) {
        const { username , cpf } = request.query;

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
    }
}

export { UserController }