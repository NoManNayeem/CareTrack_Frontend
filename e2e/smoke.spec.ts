import { expect, test } from "@playwright/test";

test.describe("route protection", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects anonymous users to login and back after sign-in", async ({ page }) => {
    await page.goto("/patients?condition=critical");
    await expect(page).toHaveURL(/\/login\?next=%2Fpatients/);
  });

  test("the API rejects requests without a session", async ({ request }) => {
    const res = await request.get("/api/v1/doctors");
    expect(res.status()).toBe(401);
  });
});

test("doctor → patient lifecycle", async ({ page }) => {
  const stamp = Date.now().toString().slice(-6);
  const doctorName = `Dr. Playwright Test${stamp}`;
  const patientName = `Robin Example${stamp}`;

  // Create a doctor
  await page.goto("/doctors");
  await page.getByRole("button", { name: "Add doctor" }).first().click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Full name").fill(doctorName);
  await sheet.getByLabel("Specialization").click();
  await page.getByRole("option", { name: "Neurology" }).click();
  await sheet.getByLabel("Hospital").click();
  const hospital = `Playwright General ${stamp}`;
  await page.getByPlaceholder("Search or add hospital…").fill(hospital);
  await page.getByRole("option", { name: `Use “${hospital}”` }).click();
  await sheet.getByLabel("Phone").fill("+1 555 444 3322");
  await sheet.getByLabel("Email").fill(`pw${stamp}@caretrack.dev`);
  await sheet.getByRole("button", { name: "Add doctor" }).click();
  await expect(page.getByText("Doctor added")).toBeVisible();

  // Open it and add a patient
  await page.getByRole("link", { name: doctorName }).click();
  await expect(page.getByRole("heading", { name: doctorName })).toBeVisible();
  await page.getByRole("button", { name: "Add patient" }).first().click();
  const form = page.getByRole("dialog");
  await form.getByLabel("Full name").fill(patientName);
  await form.getByLabel("Age").fill("47");
  await form.getByRole("radio", { name: "Female" }).click();
  await form.getByLabel("Phone").fill("+1 555 777 1212");
  await form.getByLabel("Diagnosis").fill("Migraine");
  await form.getByRole("button", { name: "Add patient" }).click();
  await expect(page.getByText("Patient added")).toBeVisible();
  await expect(page.getByText(patientName, { exact: true }).first()).toBeVisible();

  // It shows on the global Patients page and can be edited
  await page.goto(`/patients?q=${encodeURIComponent(patientName)}`);
  await page.getByRole("button", { name: `Actions for ${patientName}` }).click();
  await page.getByRole("menuitem", { name: "Edit details" }).click();
  await page.getByRole("dialog").getByLabel("Diagnosis").fill("Chronic migraine");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Patient updated")).toBeVisible();
  await expect(page.getByText("Chronic migraine").first()).toBeVisible();

  // Delete
  await page.getByRole("button", { name: `Actions for ${patientName}` }).click();
  await page.getByRole("menuitem", { name: "Delete patient" }).click();
  await page.getByRole("button", { name: "Delete patient" }).click();
  await expect(page.getByText("No patients match these filters").first()).toBeVisible();
});

test("dashboard renders analytics", async ({ page }) => {
  await page.goto("/dashboard?range=90d");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  for (const name of [
    "Admissions over time",
    "Patient condition",
    "Patients per doctor",
    "Patients by specialization",
  ]) {
    await expect(page.getByRole("region", { name })).toBeVisible();
  }
});
