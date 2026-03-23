type Tag = {
  id: string
  name: string
}

type TagFilterProps = {
  tags: Tag[]
  selectedTagIds: string[]
  onToggle: (tagId: string) => void
}

export function TagFilter({ tags, selectedTagIds, onToggle }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="タグフィルター"
    >
      {tags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.id)}
            aria-pressed={isSelected}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}
