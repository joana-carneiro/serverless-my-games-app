/**
 * Fields in a request to update a single game entry
 */
export interface UpdateGameRequest {
  name: string
  dueDate: string
  done: boolean
}
