export default async function handler(req, res) {
  console.log('Function called', req.method, req.body)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { orderId } = req.body
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' })
    }

    // Тестовый ответ
    return res.status(200).json({
      success: true,
      orderId,
      message: 'Payment function works!',
      paymentUrl: 'https://yookassa.ru/test-payment-url'
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
