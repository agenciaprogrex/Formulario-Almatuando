import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { questions } from './questionnaire';

const TO = 'agenciaprogrex@gmail.com';
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1';

const b64 = (s: string) => btoa(Array.from(new TextEncoder().encode(s), b => String.fromCharCode(b)).join(''));
const header = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);
const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;

export const sendSubmissionEmail = createServerFn({ method: 'POST' })
  .inputValidator(data => z.record(z.string().max(80), z.string().max(5000)).parse(data))
  .handler(async ({ data }) => {
    const lovableKey = process.env['LOVABLE_API_KEY'];
    const gmailKey = process.env['GOOGLE_MAIL_API_KEY'];
    if (!lovableKey || !gmailKey) throw new Error('Email not configured');
    for (const q of questions) if (!data[q.id]?.trim()) throw new Error('Resposta obrigatória ausente');

    const name = data[questions[0]!.id]!;
    const date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' });
    const csv = '\uFEFF' + ['Data', ...questions.map(q => q.title)].map(cell).join(';') + '\r\n'
      + [date, ...questions.map(q => data[q.id]!)].map(cell).join(';') + '\r\n';
    const boundary = 'almatuando' + Date.now();
    const filename = `resposta-${name.replace(/[^\w]+/g, '-').toLowerCase()}.csv`;
    const body = questions.map(q => `${q.title}: ${data[q.id]}`).join('\n');
    const raw = [
      `To: ${TO}`,
      `Subject: ${header(`Nova resposta Almatuando - ${name}`)}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      b64(`Nova resposta recebida em ${date}.\n\n${body}`),
      `--${boundary}`,
      `Content-Type: text/csv; charset="UTF-8"; name="${filename}"`,
      `Content-Disposition: attachment; filename="${filename}"`,
      'Content-Transfer-Encoding: base64',
      '',
      b64(csv),
      `--${boundary}--`,
    ].join('\r\n');
    const encoded = b64(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${lovableKey}`, 'X-Connection-Api-Key': gmailKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: encoded }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error(`Gmail send failed [${res.status}]: ${t}`);
      throw new Error(`Falha ao enviar e-mail [${res.status}]`);
    }
    return { ok: true };
  });
