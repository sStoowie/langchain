import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:5173/login';

test.describe('login-form.svelte', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('ปุ่ม Sign in ถูกปิดการใช้งานเมื่อฟอร์มว่างทั้งหมด', async ({ page }) => {
    await test.step('ตรวจสอบปุ่ม Sign in disabled เมื่อฟอร์มว่าง', async () => {
      const submitButton = page.locator('button[type="submit"].w-full.bg-purple-600');
      await expect(submitButton).toBeDisabled();
    });
  });

  test('แสดงข้อความ error เมื่ออีเมลไม่ถูกต้อง (ขณะกรอกรหัสผ่านถูกต้อง)', async ({ page }) => {
    await test.step('กรอกอีเมลผิดและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'invalid-email');
      await page.locator('#email').blur();
      await page.fill('#password', 'Valid1@Password');
      await page.locator('#password').blur();
    });
    const error = page.locator('p.text-red-400.text-sm[role="alert"]');
    await expect(error.first()).toBeVisible();
    await expect(error.first()).toContainText('กรุณากรอกอีเมลให้ถูกต้อง');
    await expect(page.locator('button[type="submit"].w-full.bg-purple-600')).toBeDisabled();
  });

  test('แสดงข้อความ error เมื่อรหัสผ่านไม่ถูกต้อง (ขณะกรอกรอีเมลถูกต้อง)', async ({ page }) => {
    await test.step('กรอกอีเมลถูกต้องและรหัสผ่านผิด', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'short');
      await page.locator('#password').blur();
    });
    const error = page.locator('p.text-red-400.text-sm[role="alert"]');
    await expect(error.last()).toBeVisible();
    await expect(error.last()).toContainText('รหัสผ่านต้อง ≥ 8 ตัว มีตัวพิมพ์เล็ก/ใหญ่ ตัวเลข และอักขระพิเศษ');
    await expect(page.locator('button[type="submit"].w-full.bg-purple-600')).toBeDisabled();
  });

  test('ปุ่ม Sign in ถูกปิดการใช้งานเมื่ออีเมลถูกต้องแต่รหัสผ่านผิด', async ({ page }) => {
    await test.step('กรอกอีเมลถูกต้องและรหัสผ่านผิด', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', '12345678');
      await page.locator('#password').blur();
    });
    await expect(page.locator('button[type="submit"].w-full.bg-purple-600')).toBeDisabled();
  });

  test('ปุ่ม Sign in ถูกปิดการใช้งานเมื่อรหัสผ่านถูกต้องแต่อีเมลผิด', async ({ page }) => {
    await test.step('กรอกอีเมลผิดและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'invalid-email');
      await page.locator('#email').blur();
      await page.fill('#password', 'Valid1@Password');
      await page.locator('#password').blur();
    });
    await expect(page.locator('button[type="submit"].w-full.bg-purple-600')).toBeDisabled();
  });

  test('ปุ่ม Sign in เปิดใช้งานเมื่อกรอกอีเมลและรหัสผ่านถูกต้องทั้งหมด', async ({ page }) => {
    await test.step('กรอกอีเมลและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'Valid1@Password');
      await page.locator('#password').blur();
    });
    await expect(page.locator('button[type="submit"].w-full.bg-purple-600')).toBeEnabled();
  });

  test('เข้าสู่ระบบสำเร็จเมื่อกรอกข้อมูลถูกต้องและกดปุ่ม Sign in', async ({ page }) => {
    let loginAttempted = false;
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Login attempt:')) {
        loginAttempted = true;
      }
    });

    await test.step('กรอกอีเมลและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'Valid1@Password');
      await page.locator('#password').blur();
    });

    await expect(page.locator('button[type="submit"].w-full.bg-purple-600')).toBeEnabled();
    await page.click('button[type="submit"].w-full.bg-purple-600');

    // รอ console log
    await test.step('ตรวจสอบว่า handleSubmit ถูกเรียก', async () => {
      await expect.poll(() => loginAttempted).toBeTruthy();
    });

    // ไม่มี error message
    await expect(page.locator('p.text-red-400.text-sm[role="alert"]')).toHaveCount(0);
  });

  test('แสดงข้อความ error ทั้งสองฟิลด์เมื่อกรอกอีเมลและรหัสผ่านผิดทั้งคู่', async ({ page }) => {
    await test.step('กรอกอีเมลผิดและรหัสผ่านผิด', async () => {
      await page.fill('#email', 'invalid-email');
      await page.locator('#email').blur();
      await page.fill('#password', 'short');
      await page.locator('#password').blur();
    });
    const errors = page.locator('p.text-red-400.text-sm[role="alert"]');
    await expect(errors).toHaveCount(2);
    await expect(errors.nth(0)).toBeVisible();
    await expect(errors.nth(0)).toContainText('กรุณากรอกอีเมลให้ถูกต้อง');
    await expect(errors.nth(1)).toBeVisible();
    await expect(errors.nth(1)).toContainText('รหัสผ่านต้อง ≥ 8 ตัว มีตัวพิมพ์เล็ก/ใหญ่ ตัวเลข และอักขระพิเศษ');
    await expect(page.locator('button[type="submit"].w-full.bg-purple-600')).toBeDisabled();
  });

  test('สามารถกดปุ่มแสดง/ซ่อนรหัสผ่านได้', async ({ page }) => {
    await test.step('กรอกอีเมลและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'Valid1@Password');
      await page.locator('#password').blur();
    });

    const passwordInput = page.locator('#password');
    const toggleButton = page.locator('button.absolute.right-3');

    // เริ่มต้นควรเป็น type password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // คลิกเพื่อแสดงรหัสผ่าน
    await test.step('คลิกปุ่ม Show password', async () => {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    // คลิกเพื่อซ่อนรหัสผ่าน
    await test.step('คลิกปุ่ม Hide password', async () => {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test('สามารถกดปุ่ม Forgot password ได้', async ({ page }) => {
    await test.step('กรอกอีเมลและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'Valid1@Password');
      await page.locator('#password').blur();
    });

    const forgotButton = page.locator('button.text-purple-400.underline');
    await expect(forgotButton).toBeVisible();
    await expect(forgotButton).toBeEnabled();
    await forgotButton.click();

    // ไม่มี error message
    await expect(page.locator('p.text-red-400.text-sm[role="alert"]')).toHaveCount(0);
  });

  test('สามารถเข้าสู่ระบบด้วย Google ได้', async ({ page }) => {
    let socialLogin = '';
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('Google login clicked')) {
        socialLogin = 'Google';
      }
    });

    await test.step('กรอกอีเมลและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'Valid1@Password');
      await page.locator('#password').blur();
    });

    const googleBtn = page.locator('button[aria-label="Sign in with Google"]');
    await expect(googleBtn).toBeVisible();
    await googleBtn.click();

    await test.step('ตรวจสอบว่า handleSocialLogin ถูกเรียกด้วย Google', async () => {
      await expect.poll(() => socialLogin).toBe('Google');
    });
  });

  test('สามารถเข้าสู่ระบบด้วย GitHub ได้', async ({ page }) => {
    let socialLogin = '';
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('GitHub login clicked')) {
        socialLogin = 'GitHub';
      }
    });

    await test.step('กรอกอีเมลและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'Valid1@Password');
      await page.locator('#password').blur();
    });

    const githubBtn = page.locator('button[aria-label="Sign in with GitHub"]');
    await expect(githubBtn).toBeVisible();
    await githubBtn.click();

    await test.step('ตรวจสอบว่า handleSocialLogin ถูกเรียกด้วย GitHub', async () => {
      await expect.poll(() => socialLogin).toBe('GitHub');
    });
  });

  test('สามารถเข้าสู่ระบบด้วย LinkedIn ได้', async ({ page }) => {
    let socialLogin = '';
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('LinkedIn login clicked')) {
        socialLogin = 'LinkedIn';
      }
    });

    await test.step('กรอกอีเมลและรหัสผ่านถูกต้อง', async () => {
      await page.fill('#email', 'test@example.com');
      await page.locator('#email').blur();
      await page.fill('#password', 'Valid1@Password');
      await page.locator('#password').blur();
    });

    const linkedinBtn = page.locator('button[aria-label="Sign in with LinkedIn"]');
    await expect(linkedinBtn).toBeVisible();
    await linkedinBtn.click();

    await test.step('ตรวจสอบว่า handleSocialLogin ถูกเรียกด้วย LinkedIn', async () => {
      await expect.poll(() => socialLogin).toBe('LinkedIn');
    });
  });
});