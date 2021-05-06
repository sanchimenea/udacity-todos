import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const docClient = new AWS.DynamoDB.DocumentClient
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ' + event)

  const todoId = uuid.v4()
  const userId = getUserId(event)
  const newItem = await createTodo(todoId, userId, event)

  logger.info('Storing new todo: ' + newItem)

  delete newItem.userId

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}


async function createTodo(todoId: string, userId: string, event: any) {
  const newTodo: CreateTodoRequest = JSON.parse(event.body) //name and dueDate
  const createdAt = new Date().toISOString()

  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    ...newTodo
  }

  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()

  return newItem

}
