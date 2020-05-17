export interface Game {
  gameId: string
  createdAt: string
  name: string
  desc: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
