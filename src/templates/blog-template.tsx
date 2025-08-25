import React, { useState, useEffect } from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { MDXProvider } from "@mdx-js/react";
import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { format } from "date-fns";
import { Container, Flex, Image, Text } from "theme-ui";
import { StaticImage } from "gatsby-plugin-image";

const formatDate = (dateString: string) =>
  format(new Date(dateString), "MM.dd.yyyy");

const components = {
  StaticImage,

  Flex,
  // Add any custom MDX components here if needed
};

const BlogPostTemplate = ({ pageContext }: { pageContext: any }) => {
  const { title, date, content } = pageContext;

  const [MDXComponent, setMDXComponent] = useState<React.ComponentType | null>(
    null
  );

  useEffect(() => {
    const doCompile = async () => {
      try {
        const compiled = await compile(content, {
          outputFormat: "function-body",
          useDynamicImport: true,
          baseUrl: "/",
        });

        const result = await run(compiled, runtime);
        setMDXComponent(() => result.default);
      } catch (error) {
        console.error(error);
      }
    };

    doCompile();
  }, [content]);

  return (
    <>
      <SEO title={`${title} | Public Vinyl Radio Blog`} />
      <Container
        sx={{
          p: 3,
          maxWidth: ["100%", "540px", "720px", "960px", "1140px"],
          mx: "auto",
        }}
      >
        <h1>{title}</h1>
        <p>{formatDate(date)}</p>
        {MDXComponent ? (
          <MDXComponent components={components} />
        ) : (
          <Text>Loading content...</Text>
        )}
      </Container>
    </>
  );
};

export default BlogPostTemplate;
