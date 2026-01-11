describe('Jest環境のセットアップ', () => {
  test('Jestが正しく動作する', () => {
    expect(1 + 1).toBe(2)
  })

  it('Testing Libraryが読み込まれている', () => {
    expect(true).toBeTruthy()
  })
});
