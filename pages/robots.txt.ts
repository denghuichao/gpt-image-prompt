import type { GetServerSideProps } from "next";
import { getSiteUrl } from "../utils/seo";

const RobotsTxt = () => null;

export default RobotsTxt;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = getSiteUrl();
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join("\n");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.write(body);
  res.end();

  return { props: {} };
};
