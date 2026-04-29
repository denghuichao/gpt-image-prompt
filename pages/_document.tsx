import Document, { Head, Html, Main, NextScript, DocumentContext, DocumentInitialProps } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang={this.props.locale ?? "zh"}>
        <Head>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="icon" href="/favicon.ico" />
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
