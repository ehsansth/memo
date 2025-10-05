export type Memory = {
  id: string
  title: string
  imageUrl: string
  personName?: string
  eventName?: string
  placeName?: string
}

export type SessionQuestion = {
  id: string
  memoryId: string
  prompt: string
  hint: string
  options: [string, string, string]
  imageUrl: string
}
