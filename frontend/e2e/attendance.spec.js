import { test, expect } from '@playwright/test';

test.describe('Attendance Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');
  });

  test('should display attendance page with header', async ({ page }) => {
    await expect(page.locator('.page-title')).toContainText('Attendance Management');
    await expect(page.locator('.add-btn')).toContainText('Mark Attendance');
  });

  test('should display filter options', async ({ page }) => {
    await expect(page.locator('.filter-section')).toBeVisible();
    await expect(page.locator('select[name="employee_id"]')).toBeVisible();
    await expect(page.locator('input[name="start_date"]')).toBeVisible();
    await expect(page.locator('input[name="end_date"]')).toBeVisible();
    await expect(page.locator('select[name="status"]')).toBeVisible();
  });

  test('should open mark attendance modal', async ({ page }) => {
    await page.click('.add-btn');
    
    await expect(page.locator('.modal-content')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText('Mark Attendance');
    
    // Check form fields
    await expect(page.locator('select[name="employee_id"]')).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
    await expect(page.locator('.status-options')).toBeVisible();
  });

  test('should mark attendance for an employee', async ({ page }) => {
    // Open modal
    await page.click('.add-btn');
    await page.waitForSelector('.modal-content');
    
    // Check if employees are available
    const employeeSelect = page.locator('select[name="employee_id"]');
    const options = await employeeSelect.locator('option').count();
    
    if (options > 1) {
      // Select first employee
      await employeeSelect.selectOption({ index: 1 });
      
      // Set date to today
      const today = new Date().toISOString().split('T')[0];
      await page.fill('input[name="date"]', today);
      
      // Select Present status (default)
      await page.click('.status-option:has-text("Present")');
      
      // Submit
      await page.click('.modal-content button[type="submit"]');
      
      // Wait for success
      await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 10000 });
      await expect(page.locator('.alert')).toContainText('marked successfully');
    }
  });

  test('should validate required fields when marking attendance', async ({ page }) => {
    await page.click('.add-btn');
    await page.waitForSelector('.modal-content');
    
    // Submit without selection
    await page.click('.modal-content button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('.error-message').first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter attendance by employee', async ({ page }) => {
    const employeeSelect = page.locator('select[name="employee_id"]');
    const options = await employeeSelect.locator('option').count();
    
    if (options > 1) {
      await employeeSelect.selectOption({ index: 1 });
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      // Verify filter is applied
      const selectedValue = await employeeSelect.inputValue();
      expect(selectedValue).not.toBe('');
    }
  });

  test('should filter attendance by status', async ({ page }) => {
    const statusSelect = page.locator('select[name="status"]');
    
    await statusSelect.selectOption('Present');
    await page.waitForTimeout(500);
    
    const selectedValue = await statusSelect.inputValue();
    expect(selectedValue).toBe('Present');
  });

  test('should filter attendance by date range', async ({ page }) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startDate = yesterday.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    await page.fill('input[name="start_date"]', startDate);
    await page.fill('input[name="end_date"]', endDate);
    
    await page.waitForTimeout(500);
    
    await expect(page.locator('input[name="start_date"]')).toHaveValue(startDate);
    await expect(page.locator('input[name="end_date"]')).toHaveValue(endDate);
  });

  test('should clear all filters', async ({ page }) => {
    // Apply some filters
    await page.locator('select[name="status"]').selectOption('Present');
    
    // Clear filters
    await page.click('.clear-filters');
    
    // Verify filters are cleared
    await expect(page.locator('select[name="status"]')).toHaveValue('');
    await expect(page.locator('select[name="employee_id"]')).toHaveValue('');
  });

  test('should display attendance records in table', async ({ page }) => {
    const recordsCount = await page.locator('.attendance-table tbody tr').count();
    
    if (recordsCount > 0) {
      // Table should have expected columns
      const headers = page.locator('.attendance-table th');
      await expect(headers.nth(0)).toContainText('Date');
      await expect(headers.nth(1)).toContainText('Employee');
      await expect(headers.nth(2)).toContainText('Employee ID');
      await expect(headers.nth(3)).toContainText('Status');
    } else {
      // Should show empty state
      await expect(page.locator('.empty-state')).toBeVisible();
    }
  });

  test('should display status badges correctly', async ({ page }) => {
    const statusBadge = page.locator('.status-badge').first();
    const count = await statusBadge.count();
    
    if (count > 0) {
      const text = await statusBadge.textContent();
      expect(['Present', 'Absent']).toContain(text?.trim());
    }
  });

  test('should show today badge for current date records', async ({ page }) => {
    const todayBadge = page.locator('.today-badge');
    const count = await todayBadge.count();
    
    // If there are records for today, badge should be visible
    if (count > 0) {
      await expect(todayBadge.first()).toContainText('Today');
    }
  });

  test('should delete attendance record with confirmation', async ({ page }) => {
    const deleteButtons = page.locator('.attendance-table .btn-delete');
    const count = await deleteButtons.count();
    
    if (count > 0) {
      await deleteButtons.first().click();
      
      // Wait for confirmation modal
      await page.waitForSelector('.modal-content');
      await expect(page.locator('.modal-title')).toContainText('Delete Attendance');
      
      // Confirm delete
      await page.click('.modal-content .btn-danger');
      
      // Wait for success
      await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 10000 });
      await expect(page.locator('.alert')).toContainText('deleted successfully');
    }
  });

  test('should show employee info when coming from employee page', async ({ page }) => {
    // First go to employees page to get an employee ID
    await page.goto('/employees');
    await page.waitForLoadState('networkidle');
    
    const attendanceButtons = page.locator('.btn-attendance');
    const count = await attendanceButtons.count();
    
    if (count > 0) {
      await attendanceButtons.first().click();
      
      // Should be on attendance page with employee filter set
      await page.waitForURL(/\/attendance\?employee=/);
      
      // Employee filter should be pre-selected
      const employeeSelect = page.locator('select[name="employee_id"]');
      const selectedValue = await employeeSelect.inputValue();
      expect(selectedValue).not.toBe('');
    }
  });
});
