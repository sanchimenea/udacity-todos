import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { addUrlTodo, todoExists } from '../../businessLogic/todos'
import { getUploadUrl } from '../../dataLayer/bucketAccess'

const bucketName = process.env.TODOS_S3_BUCKET
const logger = createLogger('generateUploadURL')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ' + event)

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  const validTodoId: Boolean = await todoExists(todoId, userId)
  logger.info('Todo exists: ' + validTodoId)

  if (!validTodoId) {
    logger.warn("Do not exist, todoId: " + todoId)
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  const signedUrl = getUploadUrl(todoId)
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  await addUrlTodo(todoId, userId, attachmentUrl)

  logger.info('Added attachment with URL: ' + attachmentUrl)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  }
}




