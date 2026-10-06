import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, ArrowDown, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/almatuando-logo-fixed.png.asset.json';
import { answerError, formAction, questions } from '@/lib/questionnaire';
import { useServerFn } from '@tanstack/react-start';
import { sendSubmissionEmail } from '@/lib/notify.functions';

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Almatuando | Sua marca começa uma nova conversa' },
    { name: 'description', content: 'Conte sobre seu negócio, seus desafios e o que sua marca busca. Vamos construir o próximo capítulo juntos.' },
    { property: 'og:title', content: 'Almatuando | Sua marca começa uma nova conversa' },
    { property: 'og:description', content: 'Um primeiro encontro para conhecer você e sua empresa.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

function Index() {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [other, setOther] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const sendEmail = useServerFn(sendSubmissionEmail);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const question = questions[step];
  const value = question ? answers[question.id] || '' : '';
  const thankYou = step === questions.length;
  const lastQuestion = step === questions.length - 1;
  const completed = questions.filter(q => !answerError(q, answers[q.id] || '', other)).length;

  useEffect(() => {
    if (step === questions.length) document.querySelector<HTMLElement>('.thank-you h1')?.focus();
    else if (step >= 0) inputRef.current?.focus();
  }, [step]);
  const move = (target: number) => { setError(''); setStep(target); };
  const next = () => {
    if (!question) return;
    const message = answerError(question, value, other);
    if (message) { setError(message); inputRef.current?.focus(); return; }
    if (!lastQuestion) move(step + 1);
  };
  const update = (value: string) => { if (question) setAnswers(prev => ({ ...prev, [question.id]: value })); setError(''); };

  return (
    <div className="questionnaire">
      <header className="brand-header">
        <img className="brand-logo" src={logo.url} alt="Almatuando" />
        <span className="header-label">Estratégia com alma. Marcas com presença.</span>
      </header>
      {step === -1 ? <main className="welcome question-enter">
        <div>
          <h1>Olá, que bom<br />ter você <em>aqui.</em></h1>
          <p className="intro-copy">Toda marca tem uma história. Queremos conhecer a sua.<br /><br />Esse questionário é muito importante para conhecermos melhor você e a sua empresa e desenvolvermos a melhor estratégia para você.</p>
          <Button variant="editorial" onClick={() => move(0)}>Vamos começar <ArrowRight /></Button>
        </div>
        <div className="welcome-art"><img src={logo.url} alt="Logo Almatuando" /></div>
      </main> : thankYou ? <main className="conversation thank-you question-enter">
        <img className="thank-you-logo" src={logo.url} alt="AlmAtuando" />
        <h1 className="question-title" tabIndex={-1}>Obrigada por nos contar um pouco mais de você e do seu projeto!</h1>
        <p className="thank-you-copy">Muito em breve entraremos em contato.</p>
      </main> : question ? <main className="conversation">
        <form key={step} className="question-enter" action={formAction} method="POST" onSubmit={async event => {
          event.preventDefault();
          if (sending) return;
          if (!lastQuestion) { next(); return; }
          const invalidIndex = questions.findIndex(q => answerError(q, answers[q.id] || '', other));
          const invalidQuestion = questions[invalidIndex];
          if (invalidQuestion) {
            setStep(invalidIndex);
            setError(answerError(invalidQuestion, answers[invalidQuestion.id] || '', other));
            return;
          }
          const form = event.currentTarget;
          // Open the Google confirmation tab during the user's click, before awaiting email.
          const target = 'almatuando-confirmation-' + Date.now();
          const confirmation = window.open('about:blank', target);
          form.target = confirmation ? target : '_self';
          setSending(true);
          let timeout: ReturnType<typeof setTimeout> | undefined;
          try { await Promise.race([sendEmail({ data: Object.fromEntries(questions.map(q => [q.id, q.other && answers[q.id] === 'Outro' ? 'Outro: ' + other : answers[q.id] || ''])) }), new Promise<void>(resolve => { timeout = setTimeout(resolve, 8000); })]); }
          catch (e) { console.error(e); }
          finally { clearTimeout(timeout); }
          form.submit();
          setStep(questions.length);
        }}>
          {questions.map(q => <input key={q.id} type="hidden" name={'entry.' + q.id} value={q.other && answers[q.id] === 'Outro' ? '__other_option__' : answers[q.id] || ''} />)}
          {answers['671491852'] === 'Outro' && <input type="hidden" name="entry.671491852.other_option_response" value={other} />}
          <fieldset disabled={sending} className="question-fields">
          <div className="question-number">{String(step + 1).padStart(2, '0')} <ArrowRight size={15} /><span>Vamos conhecer você e sua empresa</span></div>
          <h1 className="question-title" id="question-title">{question.title}<span className="required-mark" aria-label="obrigatório">*</span></h1>
          {question.type === 'choice' ? <div role="radiogroup" aria-labelledby="question-title" className="choice-list">
            {question.options?.map((option, i) => <Button key={option} type="button" variant={value === option ? 'chosen' : 'choice'} role="radio" aria-checked={value === option} onClick={() => update(option)}>
              <span className="choice-letter">{String.fromCharCode(65 + i)}</span><span className="flex-1">{option}</span>{value === option && <Check size={16} />}
            </Button>)}
            {question.other && value === 'Outro' && <input className="answer-input" aria-label="Outro nicho" placeholder="Qual é o seu nicho?" value={other} onChange={e => { setOther(e.target.value); setError(''); }} />}
          </div> : question.type === 'long' ? <textarea ref={node => { inputRef.current = node; }} className="answer-input" aria-labelledby="question-title" aria-invalid={!!error} aria-describedby={error ? 'answer-error' : undefined} value={value} placeholder={question.placeholder} onChange={e => update(e.target.value)} /> :
            <input ref={node => { inputRef.current = node; }} type={question.type === 'tel' ? 'tel' : 'text'} className="answer-input" aria-labelledby="question-title" aria-invalid={!!error} aria-describedby={error ? 'answer-error' : undefined} value={value} placeholder={question.placeholder} onChange={e => update(e.target.value)} autoComplete={step === 0 ? 'name' : question.type === 'tel' ? 'tel' : 'off'} />}
          {error && <p className="error-text" id="answer-error" role="alert">{error}</p>}
          <div className="form-actions"><Button type="submit" variant="editorial" disabled={sending}>{sending ? 'Enviando…' : lastQuestion ? 'Finalizar' : 'Continuar'} <Check /></Button></div>
          </fieldset>
        </form>
      </main> : null}
      <footer className="form-footer">
        {(step === -1 || thankYou) ? <><span className="flex items-center gap-2"><ShieldCheck size={13} /> Sua história fica entre nós.</span><span>© {new Date().getFullYear()} Almatuando</span></> : <>
          <div className="progress-area"><span>{completed} de {questions.length} respondidas</span><div className="progress-track"><progress aria-label="Progresso do formulário" value={completed} max={questions.length} /></div></div>
          <div className="navigation-buttons"><Button variant="outline" size="icon" aria-label="Pergunta anterior" title="Pergunta anterior" disabled={sending} onClick={() => move(step - 1)}><ArrowUp /></Button><Button variant="outline" size="icon" aria-label="Próxima pergunta" title="Próxima pergunta" disabled={lastQuestion || sending} onClick={next}><ArrowDown /></Button></div>
        </>}
      </footer>
    </div>
  );
}
