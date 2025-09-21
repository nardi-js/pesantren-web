/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.pesantren-example.com",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ["/admin/*"],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${
        process.env.SITE_URL || "https://www.pesantren-example.com"
      }/sitemap.xml`,
    ],  
  },
};
