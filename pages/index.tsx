import React from "react";
import Layout from "../components/layout";
import Link from "next/link";

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
          Welcome to FormCraft
        </h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Create and manage customizable forms with ease.
        </p>
        <Link
          href="/templates"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Explore Templates
        </Link>
      </div>
    </Layout>
  );
};

export default Home;
