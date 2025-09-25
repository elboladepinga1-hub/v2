const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Callable function to assign admin to a fixed email
exports.makeAdmin = functions.https.onCall(async (data, context) => {
  const email = "wildpicturesstudio@gmail.com";

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `✅ Usuario ${email} ahora es admin` };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});

// Mercado Pago config check
exports.mpCheckConfig = functions.https.onCall(async (_data, _context) => {
  const accessToken = process.env.MP_ACCESS_TOKEN || (functions.config().mp && functions.config().mp.access_token);
  return { configured: Boolean(accessToken) };
});

// Mercado Pago - create preference via Firebase Functions (no Netlify)
exports.mpCreatePreference = functions.https.onCall(async (data, context) => {
  try {
    const { preference } = data || {};
    if (!preference || !Array.isArray(preference.items)) {
      throw new functions.https.HttpsError('invalid-argument', 'Preferência inválida.');
    }

    const accessToken = process.env.MP_ACCESS_TOKEN || (functions.config().mp && functions.config().mp.access_token);
    if (!accessToken) {
      throw new functions.https.HttpsError('failed-precondition', 'Mercado Pago não configurado. Defina MP_ACCESS_TOKEN nas variáveis do Firebase Functions.');
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    let body = null;
    try { body = await response.clone().json(); } catch (_) { try { body = await response.text(); } catch (e) { body = null; } }

    if (!response.ok) {
      const msg = (body && (body.message || body.error)) || 'Erro ao criar preferência';
      throw new functions.https.HttpsError('unknown', msg);
    }

    return {
      id: body.id,
      init_point: body.init_point,
      sandbox_init_point: body.sandbox_init_point,
    };
  } catch (err) {
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError('unknown', err?.message || 'Erro desconhecido', err);
  }
});

// Mercado Pago webhook - receive notifications and persist minimal audit
exports.mpWebhook = functions.https.onRequest(async (req, res) => {
  // Basic CORS for MP callbacks
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const nowIso = new Date().toISOString();

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN || (functions.config().mp && functions.config().mp.access_token);
    const db = admin.firestore();
    const body = req.body || {};
    const query = req.query || {};

    // Extract topic/type and payment id robustly (supports classic and v2 webhooks)
    const topic = String(body.type || body.topic || query.type || query.topic || '').toLowerCase();
    let paymentId = body?.data?.id || body?.id || query?.id || query?.['data.id'] || null;
    if (!paymentId && typeof body?.resource === 'string') {
      const m = body.resource.match(/\/payments\/(\d+)/);
      if (m) paymentId = m[1];
    }

    // Save audit log
    await db.collection('mp_webhooks').add({
      receivedAt: nowIso,
      topic: topic || null,
      paymentId: paymentId ? String(paymentId) : null,
      headers: req.headers || {},
      query,
      body,
    });

    // Validate input
    if (topic !== 'payment') {
      return res.status(200).json({ received: true, skipped: 'non-payment-topic' });
    }
    if (!paymentId) {
      return res.status(200).json({ received: true, skipped: 'missing-payment-id' });
    }
    if (!accessToken) {
      console.warn('mpWebhook: missing MP access token');
      return res.status(500).json({ error: 'Missing Mercado Pago configuration' });
    }

    const pid = String(paymentId);

    // Idempotency: avoid reprocessing same payment if already stored with same status
    const payRef = db.collection('mp_payments').doc(pid);

    // Fetch payment from MP API to verify authenticity and current status
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${pid}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    let payment = null;
    try { payment = await r.clone().json(); } catch (_) { try { payment = await r.text(); } catch (e) { payment = null; } }
    if (!r.ok || !payment) {
      await payRef.set({ lastErrorAt: nowIso, lastError: 'failed-to-fetch-payment', httpStatus: r.status }, { merge: true });
      return res.status(200).json({ received: true, fetched: false });
    }

    // Upsert with idempotency flags
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(payRef);
      const prev = snap.exists ? snap.data() : null;
      const incomingStatus = payment.status || payment?.body?.status || null;
      const data = {
        fetchedAt: nowIso,
        payment,
        status: incomingStatus,
        processed: true,
        processedAt: nowIso,
      };
      // If already processed with same status, do nothing special
      if (prev && prev.processed && prev.status === incomingStatus) {
        tx.set(payRef, { lastSeenAt: nowIso }, { merge: true });
        return;
      }
      tx.set(payRef, data, { merge: true });

      // OPTIONAL: Update related order/contract by external_reference when present
      const extRef = payment.external_reference || payment?.metadata?.external_reference || null;
      if (extRef) {
        const ordersCol = db.collection('orders');
        const q = await ordersCol.where('external_reference', '==', extRef).limit(1).get().catch(() => null);
        if (q && !q.empty) {
          const docRef = q.docs[0].ref;
          tx.set(docRef, { paymentStatus: incomingStatus, mpPaymentId: pid, updated_at: nowIso }, { merge: true });
        }
      }
    });

    return res.status(200).json({ received: true, paymentId: pid });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
