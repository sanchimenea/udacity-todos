export interface TodoUpdateParams {
    Key: { [key: string]: any },
    UpdateExpression: string,
    ExpressionAttributeNames?: { [key: string]: string },
    ExpressionAttributeValues: { [key: string]: any }
}