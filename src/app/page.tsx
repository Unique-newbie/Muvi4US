import { getTrendingMovies, getTrendingShows } from '@/lib/tmdb';
import { SmartHeroBanner } from '@/components/media/smart-hero-banner';
import { MediaRow } from '@/components/media/media-row';
import { PersonalizedRows } from '@/components/media/personalized-rows';
import { Film, AlertCircle, Sparkles } from 'lucide-react';

export default async function HomePage() {
  // Fetch trending content
  const [trendingMovies, trendingShows] = await Promise.all([
    getTrendingMovies('week').catch(() => []),
    getTrendingShows('week').catch(() => []),
  ]);

  // Check if we have any content
  const hasContent = trendingMovies.length > 0 || trendingShows.length > 0;

  // Show setup message if no content
  if (!hasContent) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500">
          <Film className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-4 text-4xl font-bold text-white">Welcome to Muvi4US</h1>
        <div className="mb-8 max-w-md space-y-4 text-gray-400">
          <div className="flex items-start gap-3 rounded-lg bg-yellow-500/10 p-4 text-left">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
            <div>
              <p className="font-medium text-yellow-500">TMDB API Key Required</p>
              <p className="mt-1 text-sm text-gray-400">
                To display movies and TV shows, you need to configure your TMDB API key.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-white/5 p-4 text-left">
            <p className="mb-2 text-sm font-medium text-white">Setup Instructions:</p>
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>Get a free API key from <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">TMDB</a></li>
              <li>Create a file named <code className="rounded bg-white/10 px-1">.env.local</code> in the project root</li>
              <li>Add: <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_TMDB_API_KEY=your_key_here</code></li>
              <li>Restart the dev server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Smart Hero Section - Personalized */}
      <SmartHeroBanner />

      {/* Content Rows */}
      <div className="relative z-10 -mt-20 space-y-8 pb-12">

        {/* Personalized Rows - Client Component */}
        <PersonalizedRows />

        {/* Divider with personalization notice */}
        <div className="px-4 md:px-8">
          <div className="flex items-center gap-3 border-t border-gray-800 pt-8">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-500">
              Explore more content below • Your recommendations improve as you watch
            </span>
          </div>
        </div>

        {/* Static Trending Rows */}
        {trendingMovies.length > 0 && (
          <MediaRow
            title="🔥 Trending Movies"
            items={trendingMovies}
            type="movie"
            viewAllHref="/movies"
          />
        )}

        {trendingShows.length > 0 && (
          <MediaRow
            title="📺 Trending TV Shows"
            items={trendingShows}
            type="tv"
            viewAllHref="/tv"
          />
        )}

        {(trendingMovies.length > 0 || trendingShows.length > 0) && (
          <MediaRow
            title="🎬 Popular This Week"
            items={[...trendingMovies, ...trendingShows].sort((a, b) => b.popularity - a.popularity).slice(0, 20)}
            type="movie"
            viewAllHref="/movies"
          />
        )}
      </div>
    </div>
  );
}
