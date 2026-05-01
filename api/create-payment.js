const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

module.exports = async (req, res) => {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { orderId } = req.body
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' })
    }

    const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, YOOKASSA_AUTH } = process.env

    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY || !YOOKASSA_AUTH) {
      return res.status(500).json({ error: 'Environment variables not set' })
    }

    // Получаем сумму заказа из Supabase
    const supabaseRes = await fetch(
      `${VITE_SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=total`,
      {
        method: 'GET',
        headers: {
          apikey: VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${VITE_SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
      }
    )

    if (!supabaseRes.ok) {
      return res.status(500).json({
        error: 'Ошибка при получении суммы заказа',
        details: await supabaseRes.text(),
      })
    }

    const dataRes = await supabaseRes.json()
    if (!dataRes.length) {
      return res.status(404).json({ error: `Заказ с id ${orderId} не найден` })
    }

    const sumToPay = Number(dataRes[0].total)

    // Создаем платеж в YooKassa
    const idempotenceKey = Date.now().toString()
    const ykRes = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${YOOKASSA_AUTH}`,
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: { value: sumToPay.toFixed(2), currency: 'RUB' },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.VERCEL_URL || 'http://localhost:5173'}/my-orders`,
        },
        description: `Заказ №${orderId}`,
      }),
    })

    if (ykRes.status !== 200 && ykRes.status !== 201) {
      return res.status(ykRes.status).json({
        error: 'Ошибка YooKassa',
        details: await ykRes.text(),
      })
    }

    const ykData = await ykRes.json()

    // Обновляем заказ: сохраняем payment_id (опционально)
    await supabase
      .from('orders')
      .update({
        payment_id: ykData.id,
        payment_status: ykData.status,
      })
      .eq('id', orderId)

    return res.json({
      orderId,
      paymentId: ykData.id,
      status: ykData.status,
      paid: ykData.paid,
      amount: ykData.amount,
      paymentUrl: ykData.confirmation?.confirmation_url,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
