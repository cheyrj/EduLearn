import Head from 'next/head';

const HeadComponent = ({ title = 'EduLearn' }) => {
  return (
    <Head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
    </Head>
  );
};

export default HeadComponent;