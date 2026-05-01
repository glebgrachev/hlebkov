export default async function handler(req, res) {
  // Разрешаем GET и OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { orderId } = req.query
  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' })
  }

  try {
    // 1. Получаем payment_id из заказа
    const supabaseRes = await fetch(
      `${process.env.VITE_SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=payment_id`,
      {
        headers: {
          apikey: process.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    )

    const orders = await supabaseRes.json()
    if (!orders.length || !orders[0].payment_id) {
      return res.status(404).json({ error: 'Payment ID not found' })
    }

    const paymentId = orders[0].payment_id

    // 2. Запрашиваем статус в ЮKassa
    const ykRes = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      headers: {
        Authorization: `Basic ${process.env.YOO_KASSA_AUTH}`,
        'Content-Type': 'application/json',
      },
    })

    const payment = await ykRes.json()

    // 3. Если оплата подтверждена — обновляем заказ
    if (payment.status === 'succeeded') {
      await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          payment_status: payment.status,
          status: 'paid'
        }),
      })
    }

    return res.status(200).json({
      orderId,
      status: payment.status,
      paid: payment.paid
    })
  } catch (error) {
    console.error('Check payment error:', error)
    return res.status(500).json({ error: error.message })
  }
}