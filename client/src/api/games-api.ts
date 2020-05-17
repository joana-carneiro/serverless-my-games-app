import { apiEndpoint } from '../config'
import { Game } from '../types/Game';
import { CreateGameRequest } from '../types/CreateGameRequest';
import Axios from 'axios'
import { UpdateGameRequest } from '../types/UpdateGameRequest';

export async function getGames(idToken: string): Promise<Game[]> {
  console.log('Fetching games')

  const response = await Axios.get(`${apiEndpoint}/games`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Games:', response.data)
  return response.data.items
}

export async function createGame(
  idToken: string,
  newGame: CreateGameRequest
): Promise<Game> {
  const response = await Axios.post(`${apiEndpoint}/games`,  JSON.stringify(newGame), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchGame(
  idToken: string,
  gameId: string,
  updatedGame: UpdateGameRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/games/${gameId}`, JSON.stringify(updatedGame), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteGame(
  idToken: string,
  gameId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/games/${gameId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  gameId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/games/${gameId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
