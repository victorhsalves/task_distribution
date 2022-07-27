import prisma from "../prisma";
import { Request, Response } from "express"


class TaskController {
    async test(request: Request, response: Response) {
        const q = request.query;
        const p = request.params;
        const b = request.body;
        console.log(q)

        console.log(p)

        console.log(b)
    }

    async getAll(request: Request, response: Response) {
        const { taskType, username } = request.query;

        if (taskType) {

            const tasks = await prisma.task.findMany({
                where: {
                    type_id: parseInt(taskType.toString()),
                }
            })
            return response.json(tasks)
        }
        else {
            const tasks = await prisma.task.findMany({
            })
            return response.json(tasks)
        }

    }

    async getTasksBySupervisor(request: Request, response: Response) {
        const { username } = request.query;

        if (username) {
            const tasks = await prisma.task.findMany({
                where: {
                    type_id: parseInt(username.toString())
                }
            })
            return response.json(tasks)
        }
        else {
            const tasks = await prisma.task.findMany({})
            return response.json(tasks)
        }
    }

    async getTask(request: Request, response: Response) {
        const { task_id } = request.query;
        console.log(request.query)
        console.log(request.params)
        if (task_id) {
            const task = await prisma.task.findUnique({
                where: {
                    id: parseInt(task_id.toString()),
                },
                include: {
                    taskType: {
                        select: {
                            description: true
                        }
                    }
                }
            })

            console.log(task)
            return response.status(200).json(task);
        }

        return response.status(404).json({ message: 'Tarefa não encontrada!' })
    }

    async getMyTasks(request: Request, response: Response) {
        const { username } = request.params;
        if (username) {
            const tasks = await prisma.task.findMany({
                where: {
                    assignments: {
                        some: {
                            users: {
                                username: username
                            }
                        }
                    }
                }
            })
            const assignments = await prisma.assignments.findMany({
                where: {
                    users: {
                        username: username.toString()
                    }
                },
                select: {
                    task: true
                }
                // include: {
                //     task: true,
                //     users: {
                //         select: {
                //             name: true,
                //             username: true,
                //             profile: {
                //                 select: {
                //                     name: true
                //                 }
                //             }
                //         }
                //     }
                // }
            });

            return response.status(200).json(tasks);
        }

        return response.status(404).json({ message: 'Falha ao buscar tarefas!' })
    }

    async getTypes(request: Request, response: Response) {
        const types = await prisma.taskType.findMany();
        if (types) {
            return response.status(200).json(types);
        }
        else {
            return response.status(404).json({ error: 'Nenhum tipo encontrado' })
        }
    }

    async assingnToUserManually(request: Request, response: Response) {
        const { username, taskId } = request.body;
        const date = new Date();

        const user = await prisma.users.findFirst({
            where: {
                username: username
            },
            select: {
                id: true
            }
        })

        const assignment = await prisma.assignments.findFirst({
            where: {
                task_id: taskId
            }
        })

        if (user != null && assignment == null) {
            await prisma.assignments.create({
                data: {
                    user_id: user.id,
                    task_id: taskId,
                    assignment_date: date,
                    start_date: null,
                    final_date: null
                }
            }).then(async function () {
                await prisma.task.update({
                    where: {
                        id: taskId
                    },
                    data: {
                        assigned: 1
                    }
                }).then(() => {
                    return response.status(200).json({
                        user_id: user.id,
                        task_id: taskId,
                        assignment_date: date,
                        start_date: null,
                        final_date: null
                    })
                }).catch((error) => {
                    return response.status(500).json({ error: error })
                })
            }).catch((error) => {
                return response.status(401).json({ error: error })
            })
        }
        else {
            return response.status(200).json({
                message: 'Não foi possível atribuir a atividade!'
            })
        }
    }

    async multiAssingment(request: Request, response: Response) {
        const { usernames } = request.body;

        const users = await prisma.users.findMany({
            where: {
                username: {
                    in: usernames
                }
            }
        }).catch((error) => {
            return response.status(500).json(error)
        })

        return response.status(200).json(users)
    }

    async autoAssignment(request: Request, response: Response) {
        const { profile, supervisorId, taskTypeId, tasksPerUser } = request.body;
        console.log(profile)
        console.log(supervisorId)
        console.log(taskTypeId)

        // coletar todas as tarefas não atribuídas do dado tipo
        const tasks = await prisma.task.findMany({
            where: {
                assigned: 0,
                type_id: taskTypeId
            },
            orderBy: {
                request_date: 'desc'
            }
        });

        console.log(tasks.length)
        // coletar usuários disponíveis para receber tarefas
        const availableUsers = await prisma.userLogin.findMany({
            where: {
                available: 1,
                users: {
                    profile: {
                        name: profile
                    },
                    users: {
                        username: supervisorId
                    },
                    userSkill: {
                        some: {
                            task_type_id: taskTypeId
                        }
                    }
                },
                session_date: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
                }
            }
        });
        console.log(availableUsers)

        // selecionadas as tarefas que serão atribuídas de acordo com a qtd máx e qtd de users
        const maxCounting = availableUsers.length * tasksPerUser
        const tasksToAssign = tasks.slice(0, maxCounting)

        // criação da atribuição (task - user)
        let index = 0
        availableUsers.forEach(user => {
            let userTasks = tasksToAssign.slice(index * tasksPerUser, (index + 1) * tasksPerUser)
            userTasks.forEach(async userTask => {
                // criar assignments
                await prisma.assignments.create({
                    data: {
                        user_id: user.user_id,
                        task_id: userTask.id,
                        assignment_date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(),
                            new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()),
                    }
                }).then(() => {
                    response.status(200)
                }).catch((error) => {
                    console.log(error)
                })

                // update da tarefa para atribuição = 1
                await prisma.task.update({
                    where: {
                        id: userTask.id
                    },
                    data: {
                        assigned: 1
                    }
                }).then(() => {
                    console.log('Tarefa atualizada após atribuição');
                }).catch((error) => {
                    console.log(error)
                })
            });
            console.log(userTasks)
            index++
        });
        return response.status(200).json('Ok!')

    }

    async deleteAssignment(request: Request, response: Response) {
        const { assignmentId } = request.body;

        await prisma.assignments.delete({
            where: {
                id: assignmentId
            }
        }).then(() => {
            return response.status(200).json({ message: 'Atribuição deletada com sucesso!' })
        }).catch((err) => {
            return response.status(500).json({ message: 'Erro ao deletar atribuição!', erro: err })
        })
    }

    async getSquadTasks(request: Request, response: Response) {
        const { username } = request.params;
        if (username) {
            const tasks = await prisma.task.findMany({
                where: {
                    assignments: {
                        some: {
                            users: {
                                users: {
                                    username: username
                                }
                            }
                        }
                    }
                }
            })
            console.log(tasks)

            return response.status(200).json(tasks)
        }
        else {
            return response.status(500).json({ error: "Informe um usuário!" })
        }
    }
}


export { TaskController }