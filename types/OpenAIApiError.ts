export type OpenAIApiError = Error & {
  response?: {
    status: number
    data: {
      error: {
        message: string
        type: string
        param?: string
        code?: string
      }
    }
  }
}
