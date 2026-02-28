import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display dashboard page with title', async ({ page }) => {
    await expect(page.locator('.page-title')).toContainText('Dashboard');
    await expect(page.locator('.page-subtitle')).toContainText('Overview');
  });

  test('should display stats cards', async ({ page }) => {
    // Wait for stats to load
    await page.waitForSelector('.stats-card', { timeout: 10000 });
    
    // Check for key stats
    const statsCards = page.locator('.stats-card');
    const count = await statsCards.count();
    
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Should have Total Employees
    await expect(page.locator('.stats-card').filter({ hasText: 'Total Employees' })).toBeVisible();
    
    // Should have Departments
    await expect(page.locator('.stats-card').filter({ hasText: 'Departments' })).toBeVisible();
    
    // Should have Present Today or Attendance Rate
    const presentToday = page.locator('.stats-card').filter({ hasText: 'Present Today' });
    const attendanceRate = page.locator('.stats-card').filter({ hasText: 'Attendance Rate' });
    
    expect(await presentToday.count() + await attendanceRate.count()).toBeGreaterThan(0);
  });

  test('should display charts', async ({ page }) => {
    // Wait for charts to render
    await page.waitForTimeout(1000);
    
    // Should have at least one chart
    const charts = page.locator('[data-testid="pie-chart"], [data-testid="bar-chart"], .recharts-wrapper');
    const count = await charts.count();
    
    // Charts should be present
    expect(count).toBeGreaterThan(0);
  });

  test('should display recent employees section', async ({ page }) => {
    await page.waitForSelector('.recent-employees', { timeout: 10000 });
    await expect(page.locator('.recent-employees')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate fresh to catch loading state
    await page.goto('/');
    
    // Either loading spinner or content should be visible
    const loading = page.locator('.spinner');
    const content = page.locator('.stats-card');
    
    // One of them should be visible
    const isLoadingVisible = await loading.isVisible().catch(() => false);
    const isContentVisible = await content.isVisible().catch(() => false);
    
    expect(isLoadingVisible || isContentVisible).toBeTruthy();
  });

  test('should navigate to employees page from dashboard', async ({ page }) => {
    // Look for link to employees page
    const manageEmployeesLink = page.locator('a:has-text("Manage Employees"), a:has-text("View All Employees")');
    
    if (await manageEmployeesLink.count() > 0) {
      await manageEmployeesLink.first().click();
      await page.waitForURL(/\/employees/);
      expect(page.url()).toContain('/employees');
    }
  });

  test('should navigate to attendance page from dashboard', async ({ page }) => {
    const attendanceLink = page.locator('a:has-text("Attendance"), a:has-text("View Detailed Attendance")');
    
    if (await attendanceLink.count() > 0) {
      await attendanceLink.first().click();
      await page.waitForURL(/\/attendance/);
      expect(page.url()).toContain('/attendance');
    }
  });

  test('should display employee count correctly', async ({ page }) => {
    await page.waitForSelector('.stats-card', { timeout: 10000 });
    
    const totalEmployeesCard = page.locator('.stats-card').filter({ hasText: 'Total Employees' });
    
    if (await totalEmployeesCard.count() > 0) {
      // Should show a number
      const statValue = totalEmployeesCard.locator('.stat-value');
      const text = await statValue.textContent();
      const number = parseInt(text || '0');
      expect(number).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    await page.waitForSelector('.dashboard-content, .stats-card', { timeout: 10000 });
    
    // Check for empty state message or stats
    const emptyState = page.locator('text=No employees added yet');
    const statsCard = page.locator('.stats-card');
    
    const hasEmptyState = await emptyState.count() > 0;
    const hasStats = await statsCard.count() > 0;
    
    expect(hasEmptyState || hasStats).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check that page renders correctly on mobile
      await page.waitForSelector('.page-title', { timeout: 10000 });
      
      // Stats cards should stack vertically
      const statsCards = page.locator('.stats-card');
      const count = await statsCards.count();
      
      if (count > 0) {
        await expect(statsCards.first()).toBeVisible();
      }
    }
  });

  test('should refresh stats on page reload', async ({ page }) => {
    await page.waitForSelector('.stats-card', { timeout: 10000 });
    
    const initialCount = await page.locator('.stats-card').count();
    
    // Reload page
    await page.reload();
    await page.waitForSelector('.stats-card', { timeout: 10000 });
    
    const afterReloadCount = await page.locator('.stats-card').count();
    
    // Count should remain consistent
    expect(afterReloadCount).toBe(initialCount);
  });
});
