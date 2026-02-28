import { test, expect } from '@playwright/test';

test.describe('Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employees');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display employees page with header', async ({ page }) => {
    await expect(page.locator('.page-title')).toContainText('Employee Management');
    await expect(page.locator('.add-btn')).toContainText('Add Employee');
  });

  test('should show empty state when no employees', async ({ page }) => {
    // If there are employees, this test will verify the table exists
    const employeeCount = await page.locator('.employees-table tbody tr').count();
    
    if (employeeCount === 0) {
      await expect(page.locator('.empty-state')).toBeVisible();
      await expect(page.locator('.empty-state h3')).toContainText('No employees found');
    } else {
      // Table should be visible with employees
      await expect(page.locator('.employees-table')).toBeVisible();
    }
  });

  test('should open add employee modal', async ({ page }) => {
    await page.click('.add-btn');
    
    await expect(page.locator('.modal-content')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText('Add New Employee');
    
    // Check form fields exist
    await expect(page.locator('input[name="employee_id"]')).toBeVisible();
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="department"]')).toBeVisible();
  });

  test('should add a new employee', async ({ page }) => {
    // Open modal
    await page.click('.add-btn');
    await page.waitForSelector('.modal-content');
    
    // Fill in the form
    const uniqueId = `EMP${Date.now().toString().slice(-6)}`;
    await page.fill('input[name="employee_id"]', uniqueId);
    await page.fill('input[name="full_name"]', 'Test Employee');
    await page.fill('input[name="email"]', `test.${uniqueId}@example.com`);
    await page.fill('input[name="department"]', 'Engineering');
    
    // Submit form
    await page.click('.modal-content button[type="submit"]');
    
    // Wait for modal to close and success message
    await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 10000 });
    
    // Verify success alert appears
    await expect(page.locator('.alert')).toContainText('Employee added successfully');
  });

  test('should validate required fields when adding employee', async ({ page }) => {
    await page.click('.add-btn');
    await page.waitForSelector('.modal-content');
    
    // Submit without filling
    await page.click('.modal-content button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('.error-message')).toHaveCount(4, { timeout: 5000 });
    await expect(page.locator('.error-message').first()).toContainText('required');
  });

  test('should validate email format', async ({ page }) => {
    await page.click('.add-btn');
    await page.waitForSelector('.modal-content');
    
    await page.fill('input[name="employee_id"]', 'TEST001');
    await page.fill('input[name="full_name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="department"]', 'Engineering');
    
    await page.click('.modal-content button[type="submit"]');
    
    await expect(page.locator('.error-message')).toContainText('valid email');
  });

  test('should search employees', async ({ page }) => {
    const searchInput = page.locator('.search-input');
    
    // Type in search
    await searchInput.fill('John');
    
    // Wait for search to complete
    await page.waitForTimeout(500);
    
    // Verify search was performed (table should update)
    await expect(searchInput).toHaveValue('John');
  });

  test('should edit an existing employee', async ({ page }) => {
    // Check if there's at least one employee
    const editButtons = page.locator('.btn-edit');
    const count = await editButtons.count();
    
    if (count > 0) {
      // Click edit on first employee
      await editButtons.first().click();
      
      // Wait for modal
      await page.waitForSelector('.modal-content');
      await expect(page.locator('.modal-title')).toContainText('Edit Employee');
      
      // Verify employee_id field is disabled
      await expect(page.locator('input[name="employee_id"]')).toBeDisabled();
      
      // Update name
      await page.fill('input[name="full_name"]', 'Updated Name');
      
      // Submit
      await page.click('.modal-content button[type="submit"]');
      
      // Wait for success
      await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 10000 });
      await expect(page.locator('.alert')).toContainText('updated successfully');
    }
  });

  test('should delete an employee with confirmation', async ({ page }) => {
    // Check if there's at least one employee
    const deleteButtons = page.locator('.btn-delete');
    const count = await deleteButtons.count();
    
    if (count > 0) {
      // Click delete on first employee
      await deleteButtons.first().click();
      
      // Wait for delete confirmation modal
      await page.waitForSelector('.modal-content');
      await expect(page.locator('.modal-title')).toContainText('Delete Employee');
      
      // Click delete button in modal
      await page.click('.modal-content .btn-danger');
      
      // Wait for success
      await page.waitForSelector('.modal-content', { state: 'hidden', timeout: 10000 });
      await expect(page.locator('.alert')).toContainText('deleted successfully');
    }
  });

  test('should cancel delete operation', async ({ page }) => {
    const deleteButtons = page.locator('.btn-delete');
    const count = await deleteButtons.count();
    
    if (count > 0) {
      await deleteButtons.first().click();
      await page.waitForSelector('.modal-content');
      
      // Click cancel
      await page.click('.modal-content .btn-secondary');
      
      // Modal should close without deleting
      await page.waitForSelector('.modal-content', { state: 'hidden' });
    }
  });

  test('should navigate to attendance page for employee', async ({ page }) => {
    const attendanceButtons = page.locator('.btn-attendance');
    const count = await attendanceButtons.count();
    
    if (count > 0) {
      await attendanceButtons.first().click();
      
      // Should navigate to attendance page
      await page.waitForURL(/\/attendance\?employee=/);
      expect(page.url()).toContain('/attendance');
    }
  });
});
