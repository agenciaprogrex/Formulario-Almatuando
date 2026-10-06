<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep questionnaire definitions in a browser-safe data module so rendering and submission use the same question IDs.
- Submit responses through a native browser POST to the original Google Forms endpoint; Google owns storage and confirmation, avoiding unverified cross-origin success claims.
- Each submission is emailed as a CSV attachment through the Gmail connector in a server function before the native Google POST; the email never blocks Google submission.
