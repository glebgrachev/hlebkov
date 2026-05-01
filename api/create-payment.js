export default async function handler(req, res) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { orderId } = req.body
  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' })
  }

  try {
    // 1. Получаем сумму заказа из Supabase (поле total)
    const supabaseRes = await fetch(
      `${process.env.VITE_SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=total`,
      {
        headers: {
          apikey: process.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    )

    const orders = await supabaseRes.json()
    if (!orders.length) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const sumToPay = orders[0].total   // total — это поле в таблице orders

    // 2. Создаём платеж в ЮKassa
    const ykRes = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': `${orderId}-${Date.now()}`,
        Authorization: `Basic ${process.env.YOO_KASSA_AUTH}`,
      },
      body: JSON.stringify({
        amount: { value: sumToPay.toFixed(2), currency: 'RUB' },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `https://hlebkov.vercel.app/my-orders?orderId=${orderId}`,
        },
        description: `Заказ №${orderId}`,
        metadata: { orderId: String(orderId) },
      }),
    })

    const payment = await ykRes.json()

    if (!ykRes.ok) {
      console.error('YooKassa error:', payment)
      return res.status(500).json({ error: payment.description || 'YooKassa error' })
    }

    // 3. Обновляем заказ (сохраняем payment_id и payment_status)
    await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        payment_id: payment.id,
        payment_status: payment.status,
      }),
    })

    // 4. Возвращаем ссылку на оплату
    return res.status(200).json({
      orderId,
      paymentUrl: payment.confirmation.confirmation_url,
      paymentId: payment.id,
    })
  } catch (error) {
    console.error('Payment error:', error)
    return res.status(500).json({ error: error.message })
  }
}