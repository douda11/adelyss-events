const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.adelyss-events.com',
  port: 465,
  secure: true, // SSL direct sur le port 465
  auth: {
    user: 'contact@adelyss-events.com',
    pass: 'Elyssa2023!',
  },
  tls: {
    rejectUnauthorized: false, // Accepte le certificat LWSPANEL
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Vérification de sécurité par clé secrète
  const apiKey =
    event.headers['x-api-key'] ||
    event.headers['X-Api-Key'] ||
    event.headers['X-API-KEY'];

  if (apiKey !== 'AdelyssEmailSecret2026!') {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized: Invalid API Key' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { to, subject, body, html } = payload;

    if (!to || !subject) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing recipient (to) or subject' }),
      };
    }

    const htmlContent = html || (body ? body.replace(/\n/g, '<br>') : '');

    const signature =
      '<br><br>' +
      '<hr style="border: none; border-top: 1px solid #ccc; margin-top: 20px; margin-bottom: 20px;" />' +
      '<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5;">' +
      '  <img src="https://adelyss-events.com/assets/logo.png" alt="Adelyss Events" style="max-height: 50px; margin-bottom: 10px; display: block;" />' +
      '  <strong>L\'équipe Adelyss Events</strong><br>' +
      '  <em>Événements professionnels, associatifs et privés</em><br><br>' +
      '  <strong>Tél :</strong> +216 25 944 684<br>' +
      '  <strong>Web :</strong> <a href="https://adelyss-events.com" style="color: #c9a227; text-decoration: none;">adelyss-events.com</a>' +
      '</div>';

    const fullHtml = htmlContent.includes('Adelyss Events')
      ? htmlContent
      : htmlContent + signature;

    const info = await transporter.sendMail({
      from: '"Adelyss Events" <contact@adelyss-events.com>',
      to,
      subject,
      text: body || '',
      html: fullHtml,
    });

    console.log(`Email successfully sent to ${to}: ${info.messageId}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
      }),
    };
  } catch (err) {
    console.error('Failed to send email via SMTP:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err.message || 'Failed to send email',
      }),
    };
  }
};
