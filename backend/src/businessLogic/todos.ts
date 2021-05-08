import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

import { TodoAccess } from '../dataLayer/todosAccess'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils'


const todosAccess = new TodoAccess()
const logger = createLogger('todosLogic')

export async function getTodosByUser(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
    const userId = getUserId(event);
    logger.info('User of request: ' + userId)

    return todosAccess.getTodosByUser(userId)
}