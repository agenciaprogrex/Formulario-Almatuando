import { createElement, type ComponentType } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: () => sendEmail }));
vi.mock('@/lib/notify.functions', () => ({ sendSubmissionEmail: vi.fn() }));

import { Route } from '@/routes/index';
import { formAction, questions } from '@/lib/questionnaire';

afterEach(() => { cleanup(); vi.restoreAllMocks(); sendEmail.mockReset(); });

describe('Final questionnaire submission', () => {
  it.each([false, true])('keeps the thank-you page visible when email fails: %s', async emailFails => {
    if (emailFails) sendEmail.mockRejectedValue(new Error('Email not configured'));
    else sendEmail.mockResolvedValue({ ok: true });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    let submittedTarget = '';
    let submittedAction = '';
    let payload: FormData | undefined;
    const submit = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(function (this: HTMLFormElement) {
      submittedTarget = this.target;
      submittedAction = this.action;
      payload = new FormData(this);
    });

    render(createElement(Route.options.component as ComponentType));
    fireEvent.click(screen.getByRole('button', { name: 'Vamos começar' }));
    for (const question of questions) {
      if (question.type === 'choice') fireEvent.click(screen.getByRole('radio', { name: new RegExp(question.options![0]!) }));
      else fireEvent.change(screen.getByRole('textbox'), { target: { value: question.type === 'tel' ? '65999999999' : 'Resposta de teste' } });
      fireEvent.click(screen.getByRole('button', { name: question === questions.at(-1) ? 'Finalizar' : 'Continuar' }));
    }

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Obrigada por nos contar um pouco mais de você e do seu projeto!' })).toBeInTheDocument());
    expect(submit).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(submittedTarget).toBe('almatuando-submission');
    expect(submittedAction).toBe(formAction);
    expect(document.querySelector('iframe[name="almatuando-submission"]')).toHaveAttribute('hidden');
    expect(open).not.toHaveBeenCalled();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    for (const question of questions) expect(payload?.get('entry.' + question.id)).toBeTruthy();
  });
});
