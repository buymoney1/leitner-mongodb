import { Metadata } from 'next';
import PodcastsClient from './podcasts-client';

export const metadata: Metadata = {
  title: 'پادکست‌های آموزشی',
  description: 'پادکست‌های آموزشی سطح‌بندی شده برای یادگیری زبان انگلیسی'
};

export default function PodcastsPage() {
  return <PodcastsClient />;
}