import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta
            name="description"
            content="AI Image Prompt Hub: structured prompt templates and professional build workflow."
          />
          <meta property="og:site_name" content="AI Image Prompt Hub" />
          <meta
            property="og:description"
            content="AI Image Prompt Hub: structured prompt templates and professional build workflow."
          />
          <meta property="og:title" content="AI Image Prompt Hub" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="AI Image Prompt Hub" />
          <meta
            name="twitter:description"
            content="AI Image Prompt Hub: structured prompt templates and professional build workflow."
          />
        </Head>
        <body className="bg-black antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
