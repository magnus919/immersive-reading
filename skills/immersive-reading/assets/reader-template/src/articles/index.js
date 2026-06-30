import sampleReading from './sample-reading/data.js?v=1';

export const articles = {
  [sampleReading.id]: sampleReading
};

export const defaultArticleId = sampleReading.id;

export function getArticle(id = defaultArticleId) {
  return articles[id] || articles[defaultArticleId];
}
