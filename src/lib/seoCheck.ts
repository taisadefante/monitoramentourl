export function analisarSeo(html: string) {
  const hasTitleTag = /<title>.*?<\/title>/i.test(html);
  const hasMetaDescription = /<meta name=["']description["'] content=/i.test(
    html
  );
  const hasAltTags = /<img[^>]*alt=["'][^"']+["']/i.test(html);
  const h1Matches = html.match(/<h1[^>]*>/gi);
  const h1Count = h1Matches ? h1Matches.length : 0;

  return {
    hasTitleTag,
    hasMetaDescription,
    hasAltTags,
    h1Count,
  };
}
