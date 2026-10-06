# Publicação no Vercel

Repositório previsto: https://github.com/agenciaprogrex/Formulario-Almatuando.git

Os arquivos foram publicados na branch `main` do GitHub. A importação no Vercel ainda precisa ser concluída com uma sessão autenticada.

1. Publicar os arquivos na branch principal, preservando qualquer histórico remoto.
2. Importar o repositório em https://vercel.com/new com a integração GitHub.
3. Usar a detecção automática do framework TanStack Start e o comando de build do projeto.
4. Configurar `LOVABLE_API_KEY` e `GOOGLE_MAIL_API_KEY` como variáveis apenas do servidor. As credenciais da conexão Gmail precisam ser válidas no gateway Lovable.
5. O logotipo original está incluído em `public/almatuando-logo.png`, sem depender do proxy Lovable.
6. Verificar o site publicado e o envio por e-mail e POST nativo ao Google Forms.

Cada alteração enviada ao GitHub dispara uma nova publicação pelo Vercel após a integração. Salvar arquivos locais não envia commits automaticamente. Nunca incluir arquivos `.env` ou credenciais no Git.

Referência: https://vercel.com/docs/frameworks/full-stack/tanstack-start
