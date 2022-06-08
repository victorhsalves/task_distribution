import prisma from "../prisma";
import { Request , Response } from "express"


class TaskController {
    async getAll(request: Request, response: Response) {
        const { uf , taskType } = request.query;

        if (taskType) {
            const tasks = await prisma.task.findMany({
                where: {
                    type_id: parseInt(taskType.toString())
                }
            })
            return response.json(tasks)
        }
        else {
            const tasks = await prisma.task.findMany({})
            return response.json(tasks)
        }
    }

    async assingnToUserManually(request: Request, response: Response) {
        const { username , taskId } = request.body;
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
            where:{
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
            }).then(async function() {
                await prisma.task.update({
                    where: {
                        id: taskId
                    },
                    data: {
                        assigned:1
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
                    return response.status(500).json({error:error})
                })
            }).catch((error) => {
                return response.status(401).json({error:error})
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
        const tasks = await prisma.task.findMany({
            where: {
                assigned: 0
            }
        })
        console.log(tasks)
        // const {values, weights, n, target} = request.body;
        //     //base case: when we cannot have take more items
        //     if(target < 0){
        //       return Number.MIN_SAFE_INTEGER;
        //     }
            
        //     //base case: when no items are left or capacity becomes 0
        //     if(n < 0 || target === 0){
        //       return 0;
        //     }
            
        //     // pick current item n in knapSack and recur for
        //     // remaining items (n - 1) with reduced capacity (weight - weights[n])
        //     let include = values[n] + knapSack(values, weights, n - 1, target - weights[n]);
          
        //     // leave the current item n from knapSack and recur for
        //     // remaining items (n - 1)
        //     let exclude = knapSack(values, weights, n - 1, target);
            
        //     // return maximum value we get by picking or leaving the current item
        //     return Math.max(include, exclude);
          
    }

    async deleteAssignment(request: Request, response: Response) {
        const { assignmentId } = request.body;

        await prisma.assignments.delete({
            where: {
                id: assignmentId
            }
        }).then(() => {
            return response.status(200).json({message:'Atribuição deletada com sucesso!'})
        }).catch((err) => {
            return response.status(500).json({message:'Erro ao deletar atribuição!', erro: err})
        })
    }

    async getAssigments(request: Request, response: Response) {
        const { username , taskType } = request.query;

        var queryArgs = {
            where: {}
        }

        if (username != null) {
            queryArgs = {
                where: {
                    users: {
                        username: username
                    }
                }
            }
        }
        if (taskType != null) {
            queryArgs = {
                where: {
                    ...queryArgs.where,
                    task: {
                        type_id: parseInt(taskType.toString())
                    }
                }
            }
        }

        const assignments = await prisma.assignments.findMany({
            where: {
                ...queryArgs.where
            }
        }).catch((error) => {
            return response.status(500).json({error:error})
        })

        return response.json(assignments)
    }
}


export { TaskController }