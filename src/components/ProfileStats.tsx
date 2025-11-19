interface ProfileStatsProps {
    stats: {
      books: number
      cards: number
      podcasts: number
      articles: number
    }
  }
  
  export default function ProfileStats({ stats }: ProfileStatsProps) {
    const statItems = [
      { label: 'کتاب‌ها', value: stats.books, color: 'from-cyan-400 to-blue-500' },
      { label: 'فلش کارت‌ها', value: stats.cards, color: 'from-purple-400 to-pink-500' },
      { label: 'پادکست‌ها', value: stats.podcasts, color: 'from-green-400 to-emerald-500' },
      { label: 'مقالات', value: stats.articles, color: 'from-orange-400 to-red-500' }
    ]
  
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, index) => (
          <div
            key={item.label}
            className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-3`}>
              <span className="text-white font-bold text-lg">{item.value}</span>
            </div>
            <p className="text-gray-400 text-sm font-light">{item.label}</p>
          </div>
        ))}
      </div>
    )
  }