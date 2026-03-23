import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  describe('基本表示', () => {
    it('検索入力フィールドが表示される', () => {
      // Arrange & Act
      render(<SearchBar value="" onChange={() => {}} />)

      // Assert
      expect(
        screen.getByRole('searchbox', { name: '記事を検索' })
      ).toBeInTheDocument()
    })

    it('placeholder が表示される', () => {
      // Arrange & Act
      render(
        <SearchBar value="" onChange={() => {}} placeholder="タイトルで検索" />
      )

      // Assert
      expect(screen.getByPlaceholderText('タイトルで検索')).toBeInTheDocument()
    })

    it('value が入力フィールドに反映される', () => {
      // Arrange & Act
      render(<SearchBar value="React" onChange={() => {}} />)

      // Assert
      expect(screen.getByRole('searchbox')).toHaveValue('React')
    })
  })

  describe('インタラクション', () => {
    it('テキスト入力時に onChange が呼ばれる', () => {
      // Arrange
      const handleChange = jest.fn()
      render(<SearchBar value="" onChange={handleChange} />)

      // Act
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'TypeScript' },
      })

      // Assert
      expect(handleChange).toHaveBeenCalledWith('TypeScript')
    })

    it('入力クリア時に onChange が空文字で呼ばれる', () => {
      // Arrange
      const handleChange = jest.fn()
      render(<SearchBar value="React" onChange={handleChange} />)

      // Act
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: '' },
      })

      // Assert
      expect(handleChange).toHaveBeenCalledWith('')
    })
  })
})
