# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-flows.spec.ts >> critical inventory flows >> admin can create material and record inbound movement
- Location: src/e2e/critical-flows.spec.ts:25:7

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel(/Part Number/i) resolved to 2 elements:
    1) <input value="" type="text" aria-label="Search materials and part numbers" placeholder="Search materials, part numbers..." class="rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"/> aka getByRole('textbox', { name: 'Search materials and part' })
    2) <input value="" required="" id="add-partNumber" placeholder="e.g. SR-001" class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"/> aka getByRole('textbox', { name: 'Part Number *' })

Call log:
  - waiting for getByLabel(/Part Number/i)

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e12]:
    - banner [ref=e13]:
      - generic [ref=e14]:
        - heading "📦 LogiCore Inventory Management System" [level=1] [ref=e15]
        - generic [ref=e16]:
          - generic [ref=e17]:
            - img [ref=e18]
            - textbox "Search materials and part numbers" [ref=e20]:
              - /placeholder: Search materials, part numbers...
          - generic [ref=e21]:
            - textbox "Start date" [ref=e22]
            - generic [ref=e23]: →
            - textbox "End date" [ref=e24]
          - combobox "Filter by department" [ref=e25]:
            - option "All Departments" [selected]
            - option "Doors"
            - option "Finishing"
            - option "Floors"
            - option "Front Walls"
            - option "Janitorial"
            - option "Maintenance"
            - option "Mounting/Liftgates"
            - option "Rear Frames"
            - option "Roofs"
            - option "Sidewalls"
            - option "Skirts/Sliders"
            - option "Swing Doors"
            - option "Undercarriage"
            - option "Wiring"
          - generic [ref=e26]:
            - generic [ref=e27]: Admin
            - generic [ref=e28]: ADMIN
          - button "📷 Scan" [ref=e29]
          - button "📋 Orders" [ref=e30]
          - button "👥 Users" [ref=e31]
          - button "Sign Out" [ref=e32]
          - button "🌙" [ref=e33]
    - main [ref=e34]:
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]: Total Materials
          - generic [ref=e38]: "0"
        - generic [ref=e39]:
          - generic [ref=e40]: Total Stock
          - generic [ref=e41]: "0"
        - button "Low Stock 0" [ref=e42]:
          - generic [ref=e44]: Low Stock
          - generic [ref=e46]: "0"
        - generic [ref=e47]:
          - generic [ref=e48]: Active POs
          - generic [ref=e49]: "0"
          - generic [ref=e50]: 0 submitted · 0 approved
      - generic [ref=e51]:
        - heading "Inventory Health" [level=3] [ref=e53]
        - heading "Stock Velocity" [level=3] [ref=e67]
        - heading "Top Movers (30d)" [level=3] [ref=e85]
        - heading "PO Breakdown" [level=3] [ref=e123]
      - generic [ref=e145]:
        - generic [ref=e146]:
          - heading "Stock by Department" [level=3] [ref=e147]
          - paragraph [ref=e148]: No stock data
        - generic [ref=e149]:
          - heading "Movement Trends (14 days)" [level=3] [ref=e150]
          - generic [ref=e151]:
            - generic [ref=e152]: Inbound
            - generic [ref=e154]: Outbound
          - paragraph [ref=e156]: No movements in the last 14 days
      - generic [ref=e157]:
        - generic [ref=e158]:
          - heading "Materials" [level=2] [ref=e160]
          - generic [ref=e161]:
            - button "↓ Export CSV" [ref=e162]
            - generic [ref=e163] [cursor=pointer]: ↑ Import CSV
            - button "+ Add Material" [ref=e164]
        - table [ref=e166]:
          - rowgroup [ref=e167]:
            - row "Name↕ Part Number↕ Quantity↕ Unit↕ Location↕ Department↕ Actions" [ref=e168]:
              - columnheader "Name↕" [ref=e169] [cursor=pointer]
              - columnheader "Part Number↕" [ref=e170] [cursor=pointer]
              - columnheader "Quantity↕" [ref=e171] [cursor=pointer]
              - columnheader "Unit↕" [ref=e172] [cursor=pointer]
              - columnheader "Location↕" [ref=e173] [cursor=pointer]
              - columnheader "Department↕" [ref=e174] [cursor=pointer]
              - columnheader "Actions" [ref=e175]
          - rowgroup [ref=e176]:
            - row "Aluminum Sheet MAT-003 25 sheets Warehouse B - Rack 2 — Edit In Out Transfer" [ref=e177]:
              - cell "Aluminum Sheet" [ref=e178] [cursor=pointer]
              - cell "MAT-003" [ref=e179] [cursor=pointer]
              - cell "25" [ref=e180]:
                - generic [ref=e181]: "25"
              - cell "sheets" [ref=e182]
              - cell "Warehouse B - Rack 2" [ref=e183]
              - cell "—" [ref=e184]
              - cell "Edit In Out Transfer" [ref=e185]:
                - generic [ref=e186]:
                  - button "Edit" [ref=e187]
                  - button "In" [ref=e188]
                  - button "Out" [ref=e189]
                  - button "Transfer" [ref=e190]
            - row "Copper Wire 2mm MAT-002 50 spools Warehouse A - Shelf 3 — Edit In Out Transfer" [ref=e191]:
              - cell "Copper Wire 2mm" [ref=e192] [cursor=pointer]
              - cell "MAT-002" [ref=e193] [cursor=pointer]
              - cell "50" [ref=e194]:
                - generic [ref=e195]: "50"
              - cell "spools" [ref=e196]
              - cell "Warehouse A - Shelf 3" [ref=e197]
              - cell "—" [ref=e198]
              - cell "Edit In Out Transfer" [ref=e199]:
                - generic [ref=e200]:
                  - button "Edit" [ref=e201]
                  - button "In" [ref=e202]
                  - button "Out" [ref=e203]
                  - button "Transfer" [ref=e204]
            - row "Steel Rod 10mm MAT-001 100 pieces Warehouse A - Shelf 1 — Edit In Out Transfer" [ref=e205]:
              - cell "Steel Rod 10mm" [ref=e206] [cursor=pointer]
              - cell "MAT-001" [ref=e207] [cursor=pointer]
              - cell "100" [ref=e208]:
                - generic [ref=e209]: "100"
              - cell "pieces" [ref=e210]
              - cell "Warehouse A - Shelf 1" [ref=e211]
              - cell "—" [ref=e212]
              - cell "Edit In Out Transfer" [ref=e213]:
                - generic [ref=e214]:
                  - button "Edit" [ref=e215]
                  - button "In" [ref=e216]
                  - button "Out" [ref=e217]
                  - button "Transfer" [ref=e218]
      - generic [ref=e219]:
        - heading "Recent Movements" [level=2] [ref=e221]
        - table [ref=e223]:
          - rowgroup [ref=e224]:
            - row "Date Material Type Qty Note By" [ref=e225]:
              - columnheader "Date" [ref=e226]
              - columnheader "Material" [ref=e227]
              - columnheader "Type" [ref=e228]
              - columnheader "Qty" [ref=e229]
              - columnheader "Note" [ref=e230]
              - columnheader "By" [ref=e231]
          - rowgroup [ref=e232]:
            - row "7/21/2026 Steel Rod 10mm INBOUND 100 Initial stock intake Admin" [ref=e233]:
              - cell "7/21/2026" [ref=e234]
              - cell "Steel Rod 10mm" [ref=e235]
              - cell "INBOUND" [ref=e236]:
                - generic [ref=e237]: INBOUND
              - cell "100" [ref=e238]
              - cell "Initial stock intake" [ref=e239]
              - cell "Admin" [ref=e240]
      - generic [ref=e241]:
        - generic [ref=e242]:
          - heading "Recent Activity" [level=2] [ref=e243]
          - button "View All →" [ref=e244]
        - generic [ref=e245]:
          - generic [ref=e247]:
            - generic [ref=e248]:
              - generic [ref=e249]: 🗝️
              - generic [ref=e250]: Signed in
            - generic [ref=e251]:
              - generic [ref=e252]: Admin
              - generic [ref=e253]: Jul 21, 07:14 PM
          - generic [ref=e255]:
            - generic [ref=e256]:
              - generic [ref=e257]: 🗝️
              - generic [ref=e258]: Signed in
            - generic [ref=e259]:
              - generic [ref=e260]: Admin
              - generic [ref=e261]: Jul 21, 07:14 PM
          - generic [ref=e263]:
            - generic [ref=e264]:
              - generic [ref=e265]: 🗝️
              - generic [ref=e266]: Signed in
            - generic [ref=e267]:
              - generic [ref=e268]: Admin
              - generic [ref=e269]: Jul 21, 07:14 PM
          - generic [ref=e271]:
            - generic [ref=e272]:
              - generic [ref=e273]: 🗝️
              - generic [ref=e274]: Signed in
            - generic [ref=e275]:
              - generic [ref=e276]: Admin
              - generic [ref=e277]: Jul 21, 07:14 PM
    - generic [ref=e282]:
      - heading "Add New Material" [level=2] [ref=e283]
      - generic [ref=e284]:
        - generic [ref=e285]: Name *
        - textbox "Name *" [active] [ref=e286]:
          - /placeholder: e.g. Steel Rod
          - text: E2E Material 1784679287648
      - generic [ref=e287]:
        - generic [ref=e288]: Part Number *
        - textbox "Part Number *" [ref=e289]:
          - /placeholder: e.g. SR-001
      - generic [ref=e290]:
        - generic [ref=e291]: Description
        - textbox "Description" [ref=e292]:
          - /placeholder: Optional description
      - generic [ref=e293]:
        - generic [ref=e294]: Department
        - combobox "Department" [ref=e295]:
          - option "No department" [selected]
      - generic [ref=e296]:
        - generic [ref=e297]:
          - generic [ref=e298]: Quantity
          - spinbutton "Quantity" [ref=e299]: "0"
        - generic [ref=e300]:
          - generic [ref=e301]: Unit
          - textbox "Unit" [ref=e302]:
            - /placeholder: e.g. pieces
            - text: pieces
      - generic [ref=e303]:
        - generic [ref=e304]: Location
        - textbox "Location" [ref=e305]:
          - /placeholder: e.g. Warehouse A
      - generic [ref=e306]:
        - generic [ref=e307]: Low Stock Threshold
        - spinbutton "Low Stock Threshold" [ref=e308]: "10"
        - generic [ref=e309]: Alert when stock falls to or below this level
      - generic [ref=e310]:
        - button "Cancel" [ref=e311]
        - button "Add Material" [ref=e312]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | async function loginAs(page: Page, email: string, password: string) {
  4   |   await page.goto("/login");
  5   |   await page.getByLabel("Email").fill(email);
  6   |   await page.getByLabel("Password").fill(password);
  7   |   await page.getByRole("button", { name: "Sign In" }).click();
  8   |   await expect(page).toHaveURL(/\/dashboard/);
  9   | }
  10  | 
  11  | async function loginAsAdmin(page: Page) {
  12  |   await loginAs(page, "admin@materialops.com", "Admin!Change#Me2026");
  13  | }
  14  | 
  15  | async function loginAsOperator(page: Page) {
  16  |   await loginAs(page, "operator@materialops.com", "Operator!Change#Me2026");
  17  | }
  18  | 
  19  | test.describe.serial("critical inventory flows", () => {
  20  |   test("admin can login and see dashboard", async ({ page }) => {
  21  |     await loginAsAdmin(page);
  22  |     await expect(page.getByText("LogiCore Inventory Management System")).toBeVisible();
  23  |   });
  24  | 
  25  |   test("admin can create material and record inbound movement", async ({ page }) => {
  26  |     await loginAsAdmin(page);
  27  | 
  28  |     const unique = Date.now();
  29  |     const materialName = "E2E Material " + String(unique);
  30  |     const partNumber = "E2E-" + String(unique);
  31  | 
  32  |     await page.getByRole("button", { name: /Add Material/i }).click();
  33  | 
  34  |     await page.getByLabel(/Name/i).fill(materialName);
> 35  |     await page.getByLabel(/Part Number/i).fill(partNumber);
      |                                           ^ Error: locator.fill: Error: strict mode violation: getByLabel(/Part Number/i) resolved to 2 elements:
  36  |     await page.getByLabel(/Description/i).fill("Created in e2e critical flow");
  37  |     await page.getByLabel(/Quantity/i).fill("5");
  38  |     await page.getByLabel(/Unit/i).fill("pieces");
  39  |     await page.getByLabel(/Location/i).fill("E2E Rack");
  40  |     await page.getByRole("button", { name: /Add Material/i }).last().click();
  41  | 
  42  |     await expect(page.getByText(materialName).first()).toBeVisible();
  43  | 
  44  |     const row = page.locator("tr").filter({ hasText: materialName }).first();
  45  |     await row.getByRole("button", { name: /Inbound/i }).click();
  46  | 
  47  |     await page.getByLabel(/Quantity/i).fill("3");
  48  |     await page.getByLabel(/Note/i).fill("e2e inbound");
  49  |     await page.getByRole("button", { name: /Record Inbound/i }).click();
  50  | 
  51  |     await expect(page.getByText(/Inbound recorded/i)).toBeVisible();
  52  | 
  53  |     await page.goto("/dashboard/audit-log");
  54  | 
  55  |     const createdRow = page
  56  |       .locator("tr")
  57  |       .filter({ hasText: materialName })
  58  |       .filter({ hasText: "Create Material" })
  59  |       .first();
  60  | 
  61  |     await expect(createdRow).toBeVisible();
  62  |   });
  63  | 
  64  |   test("admin can transfer stock between materials", async ({ page }) => {
  65  |     await loginAsAdmin(page);
  66  | 
  67  |     const unique = crypto.randomUUID();
  68  |     const sourceName = "E2E Transfer Source " + unique;
  69  |     const sourcePart = "E2E-TS-" + unique;
  70  |     const destName = "E2E Transfer Dest " + unique;
  71  |     const destPart = "E2E-TD-" + unique;
  72  | 
  73  |     async function createMaterial(name: string, partNumber: string, qty: string) {
  74  |       const openAddButton = page.getByRole("button", { name: /Add Material/i }).first();
  75  |       await expect(openAddButton).toBeVisible({ timeout: 15000 });
  76  |       await openAddButton.click();
  77  | 
  78  |       const modalForm = page.locator("form").filter({ has: page.locator("#add-name") });
  79  |       await expect(modalForm).toBeVisible();
  80  | 
  81  |       await page.locator("#add-name").fill(name);
  82  |       await page.locator("#add-partNumber").fill(partNumber);
  83  |       await page.locator("#add-description").fill("e2e transfer setup");
  84  |       await page.locator("#add-quantity").fill(qty);
  85  |       await page.locator("#add-unit").fill("pieces");
  86  |       await page.locator("#add-location").fill("E2E Transfer Rack");
  87  | 
  88  |       const createReq = page.waitForResponse(
  89  |         (res) =>
  90  |           (res.url().includes("/api/materials") &&
  91  |           res.request().method() === "POST" &&
  92  |           res.request().postData()?.includes(partNumber)) || false
  93  |       );
  94  | 
  95  |       await modalForm.getByRole("button", { name: /^Add Material$/i }).click();
  96  | 
  97  |       const createRes = await createReq;
  98  |       if (!createRes.ok()) {
  99  |         throw new Error(`Create material failed: ${createRes.status()} ${await createRes.text()}`);
  100 |       }
  101 | 
  102 |       await expect(modalForm).toHaveCount(0);
  103 | 
  104 |       const createdRow = page.locator("tr").filter({ hasText: name }).first();
  105 |       await expect(createdRow).toBeVisible({ timeout: 15000 });
  106 |     }
  107 | 
  108 |     await createMaterial(sourceName, sourcePart, "5");
  109 |     await createMaterial(destName, destPart, "1");
  110 | 
  111 |     const sourceRow = page.locator("tr").filter({ hasText: sourceName }).first();
  112 |     await expect(sourceRow).toBeVisible();
  113 |     await sourceRow.getByRole("button", { name: /\bTransfer$/ }).click();
  114 | 
  115 |     const destSelect = page.locator("#transfer-dest");
  116 |     await expect(destSelect).toBeVisible();
  117 | 
  118 |     await expect
  119 |       .poll(async () => await destSelect.locator("option", { hasText: destName }).count())
  120 |       .toBeGreaterThan(0);
  121 | 
  122 |     const destOption = destSelect.locator("option", { hasText: destName }).first();
  123 |     const destValue = await destOption.getAttribute("value");
  124 |     expect(destValue).toBeTruthy();
  125 | 
  126 |     await destSelect.selectOption(destValue!);
  127 | 
  128 |     await page.locator("#transfer-qty").fill("1");
  129 |     await page.locator("#transfer-note").fill("e2e transfer");
  130 |     await page.getByRole("button", { name: /^Transfer$/i }).click();
  131 | 
  132 |     await expect(page.getByText(/Transfer completed/i)).toBeVisible();
  133 | 
  134 |     await page.goto("/dashboard/audit-log");
  135 |     await expect(page.getByText(/Transfer/i).first()).toBeVisible();
```