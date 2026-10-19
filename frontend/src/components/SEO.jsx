import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://hotpdf.haoyanbing.workers.dev";

const pages = {
  "/": ["Free Online PDF Tools | HotPDF", "Use HotPDF online tools to merge, split, compress and convert PDF files. Choose the tool you need and get started in your browser."],
  "/split": ["Split PDF Online | HotPDF", "Split PDF files online with HotPDF. Select the pages you need and create a separate PDF document."],
  "/merge": ["Merge PDF Online | HotPDF", "Combine multiple PDF documents into one file with HotPDF's online PDF merger."],
  "/convert": ["Convert PDF Online | HotPDF", "Explore HotPDF's online PDF conversion tools and supported formats."],
  "/compress": ["Compress PDF Online | HotPDF", "Use HotPDF's online PDF compression tool to reduce PDF file size."],
  "/edit": ["Edit PDF Online - Reorder, Rotate & Delete Pages | HotPDF", "Edit PDF files online with HotPDF. Reorder pages, rotate PDF pages, delete unwanted pages, and insert selected pages from another PDF. Preview your document and download your edited PDF."],
  "/about": ["About HotPDF | Online PDF Tools", "Learn about HotPDF and its online PDF tools."],
  "/privacy": ["Privacy Policy | HotPDF", "Read HotPDF's privacy policy and learn how information is handled."],
  "/terms": ["Terms of Service | HotPDF", "Read the terms of service for using HotPDF."]
};

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export default function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalized = pathname.replace(/\/+$/, "") || "/";
    const page = pages[normalized];
    if (!page) return;

    const [title, description] = page;
    const url = SITE + (normalized === "/" ? "/" : normalized);
    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [pathname]);

  return null;
}
