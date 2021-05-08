import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

import { TodoAccess } from '../dataLayer/todosAccess'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils'

import * as uuid from 'uuid'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'


const todosAccess = new TodoAccess()
const logger = createLogger('todosLogic')

export async function getTodosByUser(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
    const userId = getUserId(event);
    logger.info('User of request: ' + userId)
    logger.info("Getting all todos of user: " + userId)

    return await todosAccess.getTodosByUser(userId)
}

export async function createTodo(event: any) {
    const todoId = uuid.v4()
    const userId = getUserId(event)

    const newTodo: CreateTodoRequest = JSON.parse(event.body) //name and dueDate
    const createdAt = new Date().toISOString()

    const newItem = await todosAccess.createTodo({
        userId,
        todoId,
        createdAt,
        done: false,
        ...newTodo
    })

    delete newItem.userId
    logger.info('Storing new todo: ' + newItem)

    return newItem
}