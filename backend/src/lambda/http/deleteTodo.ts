import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('deleteTodo')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ' + event)

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  const validTodoId = await todoExists(todoId, userId)

  if (!validTodoId) {
    logger.warn("Do not exist, todoId: " + todoId)
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  logger.info('Deleting todo: ' + todoId)

  await deleteTodo(todoId, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}

async function todoExists(todoId: string, userId: string) {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    })
    .promise()

  logger.info('Get todo: ' + todoId)
  return !!result.Item
}
async function deleteTodo(todoId: string, userId: string) {

  const params = {
    TableName: todosTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    }
  };

  await docClient.delete(params, function (err, data) {
    if (err) logger.error(err);
    else logger.info("Delete Success " + data)
  }).promise()
}