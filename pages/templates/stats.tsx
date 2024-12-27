import { GetServerSideProps, NextPage } from "next";
import { authMiddleware, AuthenticatedRequest } from "../../lib/authMiddleware";
import prisma from "../../lib/prisma";
import { NextApiResponse } from "next";

interface StatsPageProps {
  totalForms: number;
  totalSubmissions: number;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<StatsPageProps> = async (
  context
) => {
  const { req, res } = context;

  try {
    await authMiddleware(req as AuthenticatedRequest, res as NextApiResponse);
    const userId = (req as AuthenticatedRequest).user?.userId;

    if (!userId) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const totalForms = await prisma.template.count({
      where: { userId },
    });

    const totalSubmissions = await prisma.submission.count({
      where: {
        template: {
          userId,
        },
      },
    });

    return {
      props: {
        totalForms,
        totalSubmissions,
      },
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      props: {
        totalForms: 0,
        totalSubmissions: 0,
        error: "Failed to fetch dashboard statistics",
      },
    };
  }
};

const StatsPage: NextPage<StatsPageProps> = ({
  totalForms,
  totalSubmissions,
  error,
}) => {
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Dashboard Statistics</h1>
      <p>Total Forms: {totalForms}</p>
      <p>Total Submissions: {totalSubmissions}</p>
    </div>
  );
};

export default StatsPage;
