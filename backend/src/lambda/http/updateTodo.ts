import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient
const todosTable = process.env.TODOS_TABLE

const logger = createLogger('updateTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ' + event)

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  logger.info("Update todoId: " + todoId, "Update values: " + updatedTodo)

  await updateTodo(updatedTodo, todoId, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ''
  }
}


async function updateTodo(updatedTodo: UpdateTodoRequest, todoId: string, userId: string) {

  const params = {
    TableName: todosTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    },
    UpdateExpression: "set #n = :name, dueDate = :dueDate, done = :done",
    ExpressionAttributeNames: {
      "#n": "name"
    },
    ExpressionAttributeValues: {
      ":name": updatedTodo.name,
      ":dueDate": updatedTodo.dueDate,
      ":done": updatedTodo.done
    }
  };

  await docClient.update(params, function (err, data) {
    if (err) logger.error(err);
    else logger.info("Success " + data)
  }).promise()

}
