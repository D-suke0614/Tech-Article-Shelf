import { render, screen, fireEvent } from '@testing-library/react'
import { TagFilter } from './TagFilter'

const mockTags = [
  { id: 'tag-1', name: 'React' },
  { id: 'tag-2', name: 'TypeScript' },
  { id: 'tag-3', name: 'Next.js' },
]

describe('TagFilter', () => {
  describe('基本表示', () => {
    it('タグが存在する場合、タグボタンが表示される', () => {
      // Arrange & Act
      render(
        <TagFilter tags={mockTags} selectedTagIds={[]} onToggle={() => {}} />
      )

      // Assert
      expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'TypeScript' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Next.js' })
      ).toBeInTheDocument()
    })

    it('タグが空の場合、何も表示されない', () => {
      // Arrange & Act
      const { container } = render(
        <TagFilter tags={[]} selectedTagIds={[]} onToggle={() => {}} />
      )

      // Assert
      expect(container.firstChild).toBeNull()
    })

    it('選択済みタグは aria-pressed が true になる', () => {
      // Arrange & Act
      render(
        <TagFilter
          tags={mockTags}
          selectedTagIds={['tag-1']}
          onToggle={() => {}}
        />
      )

      // Assert
      expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
      expect(
        screen.getByRole('button', { name: 'TypeScript' })
      ).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('インタラクション', () => {
    it('タグをクリックすると onToggle が tagId とともに呼ばれる', () => {
      // Arrange
      const handleToggle = jest.fn()
      render(
        <TagFilter
          tags={mockTags}
          selectedTagIds={[]}
          onToggle={handleToggle}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'React' }))

      // Assert
      expect(handleToggle).toHaveBeenCalledWith('tag-1')
    })

    it('選択済みタグをクリックすると onToggle が呼ばれる（解除）', () => {
      // Arrange
      const handleToggle = jest.fn()
      render(
        <TagFilter
          tags={mockTags}
          selectedTagIds={['tag-2']}
          onToggle={handleToggle}
        />
      )

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'TypeScript' }))

      // Assert
      expect(handleToggle).toHaveBeenCalledWith('tag-2')
    })
  })
})
