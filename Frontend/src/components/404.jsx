const ErrorPage404 = () => {
  return (
    <>
      <section className="bg-white dark:bg-blue-900 h-[100vh] transition-all duration-1000">
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
          <div className="mx-auto max-w-screen-sm text-center pt-[20%]">
            <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-gray-300">
              404
            </h1>
            <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
              Something&apos;s missing.
            </p>
            <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
              Sorry, we can&apos;t find that page. You&apos;ll find lots to
              explore on the home page.
            </p>
            <a
              href="/"
              className="inline-flex text-white bg-cyan-950 hover:bg-yellow-500 hover:text-gray-900 hover:font-semibold focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-400 dark:hover:bg-yellow-500 my-4"
            >
              Back to Homepage
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default ErrorPage404;
