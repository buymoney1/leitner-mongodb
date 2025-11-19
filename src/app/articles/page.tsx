import { Metadata } from 'next';
import ArticlesClient from './articles-client';

export const metadata: Metadata = {
  title: 'مقاله‌های آموزشی',
  description: 'مقاله‌های آموزشی سطح‌بندی شده برای یادگیری زبان انگلیسی'
};

export default function ArticlesPage() {
  return <ArticlesClient />;
}