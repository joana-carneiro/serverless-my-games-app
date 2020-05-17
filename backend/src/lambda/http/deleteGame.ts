import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import {deleteGame} from "../../businessLogic/manageGames"

const logger = createLogger('deleteGame')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', event)

  try {
    await deleteGame(event)

    return {
      statusCode: 202,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
    };

  } catch (e) {

    return {
      statusCode: 404,
      body: JSON.stringify({
        error: e
      })
    };

  }




  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  };

}
