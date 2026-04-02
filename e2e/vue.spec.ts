import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  const newWorkspace = page.getByRole('button', { name: 'New workspace' })
  await newWorkspace.click()
  // await expect(page.locator())
  await expect(page.locator('header').filter({ hasText: 'New workspace' })).toBeVisible()
})
