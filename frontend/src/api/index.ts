export class Api {
  private static baseUrl = 'YOUR_BACKEND_URL'

  private static headers(jwt: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    }
  }

  static async getBalance(jwt: string, telegramId: string) {
    const response = await fetch(`${this.baseUrl}/balance`, {
      headers: this.headers(jwt),
      method: 'POST',
      body: JSON.stringify({ telegramId })
    })
    return await response.json()
  }

  static async getDepositHistory(jwt: string, telegramId: string) {
    const response = await fetch(`${this.baseUrl}/deposits`, {
      headers: this.headers(jwt),
      method: 'POST',
      body: JSON.stringify({ telegramId })
    })
    return await response.json()
  }

  async purchaseVPN(jwtToken: string, telegramId: string, tariffId: number, period: number) {
    // Логика для отправки запроса на сервер
    const response = await fetch('/api/purchase-vpn', {
      method: 'POST',
      body: JSON.stringify({ jwtToken, telegramId, tariffId, period }),
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) {
      throw new Error('Ошибка при оформлении покупки')
    }
    return response.json()
  }
}