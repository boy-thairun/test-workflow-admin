# แผน TDD สำหรับหน้าจัดการผู้ใช้

สถานะร่างเพื่อรีวิว · แอดมินล็อกอินเพื่อเปิดรายการผู้ใช้และแก้ชื่อที่แสดงของบัญชี ใน MVP หน้าจอแสดง email และ role เพื่อให้ระบุบัญชีได้ ส่วนฟอร์มแก้ไขมีฟิลด์ชื่อที่แสดง บัญชีแอดมินใช้เซสชันบน origin ของ admin และ API ตรวจ role ในทุกคำขอจัดการผู้ใช้

บทบาท `admin` เดียวกันให้สิทธิ์แก้ผังพื้นที่สาธารณะบนเว็บผู้เล่นผ่าน ROOM-020 แอดมินเข้าสู่ระบบบนเว็บผู้เล่นเพื่อเห็นแมพและย้ายเฟอร์นิเจอร์ตรงตำแหน่งจริง

## สัญญาที่ใช้

| การ์ด Admin | ผู้ผลิต | การเชื่อมต่อและ fixture |
|---|---|---|
| AUTH-030 | CONTRACT-010, AUTH-010 | ใช้ `POST /auth/login`, `GET /auth/me` และ `POST /auth/logout` ทดสอบ role `admin`, role `user`, ข้อมูลล็อกอินผิด และเซสชันหมดอายุ |
| USER-020 | CONTRACT-010, USER-010 | ใช้ `GET /admin/users?offset=0&limit=20` และ `PATCH /admin/users/{userId}` ทดสอบรายการว่าง หน้าที่สอง ชื่อภาษาไทย ชื่อว่าง และผู้ใช้ที่หาไม่พบ |

ตัวอ่าน API และ fixtures ใช้สัญญา v1 เดียวกับ API หลัง CONTRACT-010 เป็น Frozen UI ใช้ error code จาก API เพื่อเลือกข้อความ เช่น `401 UNAUTHENTICATED` พากลับล็อกอิน `403 FORBIDDEN` แสดงว่าไม่มีสิทธิ์ และ `422 VALIDATION_ERROR` คงค่าที่พิมพ์พร้อมข้อความที่ช่องชื่อ

## Task Cards

AUTH-030 ใช้แพ็กเกจสัญญา v1 ที่ pin จาก API ผ่าน tarball ใน `src/auth/contracts/` และใช้ fixtures ของแพ็กเกจตรวจเส้นทางแอดมิน ผู้ใช้ทั่วไป และเซสชันหมดอายุใน Playwright ส่วนการทดสอบกับบัญชีแอดมินบน API จริงใช้เมื่อ AUTH-010 พร้อม

AUTH-030 กำหนดสคริปต์ใน `package.json` ให้ `test` รัน `vitest run`, `lint` รัน `eslint .`, `typecheck` รัน `tsc --noEmit`, `test:e2e` รัน `playwright test` และใช้ `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm test:e2e` ตรวจงาน

| การ์ด | ทำหลัง | Owned Paths | Acceptance Criteria |
|---|---|---|---|
| AUTH-030 ล็อกอินและตรวจสิทธิ์เข้า Admin · Feature · 5 แต้ม | CONTRACT-010 Frozen | `src/app/**`, `src/auth/**`, `tests/auth/**`, `tests/e2e/auth.spec.ts`, `index.html`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.mjs`, `.github/workflows/verify-admin.yml` | แอดมินเข้าหน้าจัดการได้ เปิด URL ตรงและรีเฟรชได้เมื่อมีเซสชัน ผู้ใช้ทั่วไปเห็นสถานะไม่มีสิทธิ์ |
| USER-020 เปิดรายการผู้ใช้และแก้ชื่อ · Feature · 5 แต้ม | AUTH-030, CONTRACT-010 | `src/users/**`, `tests/users/**`, `tests/e2e/users.spec.*` | แสดงรายการและแบ่งหน้า เปิดฟอร์มของบัญชีที่เลือก ส่งเฉพาะ `displayName` และอัปเดตแถวจากข้อมูลที่ API ยืนยัน |

**Must Not Modify** จำกัดการแก้ไขตาม Owned Paths การเปลี่ยน field ที่แก้ได้หรือกฎสิทธิ์จัดการเริ่มจากสัญญาของ API

### การ์ด ClickUp

เปิด PR แผนจาก fork เข้า `develop` ของ upstream และอ้างลิงก์ในรายละเอียดการ์ด ช่อง `PR Link` ใช้กับ Draft PR สำหรับ RED ของการ์ดแต่ละใบหลังได้รับอนุมัติเป็น `ready`

| Task Card | ClickUp |
|---|---|
| AUTH-030 | [DEV-6055 Add Admin Login and Access Control](https://app.clickup.com/t/z929e7qhh2) |
| USER-020 | [DEV-6056 Build Admin User Management Screen](https://app.clickup.com/t/z929e7qhh4) |

ให้ Tech Lead อนุมัติแผนและเปลี่ยนการ์ดเป็น `ready` ก่อนเริ่ม RED ทำทีละการ์ดบน branch ที่มีรหัส ClickUp เปิด Draft PR เข้า `develop` โดยใช้ `ClickUp-Task: <CLICKUP-ID>` เป็นบรรทัดแรกของ PR แล้วรอ Dev ยืนยันผล RED ก่อนทำ GREEN และ REFACTOR

### RED ที่ต้องเห็นก่อนเขียนโค้ด

| การ์ด | RED scenarios |
|---|---|
| AUTH-030 | **RED-1** แอดมินล็อกอินแล้วเห็นหน้าจัดการและยังเข้าถึงได้หลัง refresh **RED-2** ผู้ใช้ทั่วไปเปิด URL ตรงแล้วเห็นข้อความไม่มีสิทธิ์และไม่มี request อ่านรายชื่อ **RED-3** เมื่อเซสชันหมดอายุ ออกจากระบบ หรือล็อกอินด้วยข้อมูลผิด ระบบแสดงหน้าล็อกอินหรือข้อผิดพลาดตามสถานะ |
| USER-020 | **RED-1** โหลดรายการ หน้าแรกและหน้าถัดไปใช้ offset ถูกต้อง และแสดงสถานะเมื่อรายการว่าง **RED-2** แก้ชื่อของบัญชีที่เลือก ส่งเฉพาะ `displayName` ไปยัง ID นั้น และแสดงชื่อที่ API คืน **RED-3** ชื่อว่างถูกตรวจที่ฟอร์ม เมื่อ API ปฏิเสธด้วย `422` หรือ `404` แสดงข้อความตามกรณี ค่าเดิมในรายการยังอยู่และผู้ใช้เห็นค่าที่พิมพ์ |

## เกณฑ์ตรวจรับร่วม

Browser E2E ใช้ API จริงผ่าน same-origin proxy แอดมินล็อกอิน เลือกผู้ใช้ เปลี่ยนชื่อ และเห็นค่าใหม่หลังรีเฟรช ผู้ใช้ทั่วไปเรียก GET หรือ PATCH ได้ `403` ใน API integration test ทดสอบข้าม repo โดยให้บัญชีเป้าหมายเปิดเซสชันในเว็บผู้เล่น แล้วตรวจว่า `GET /auth/me` คืนชื่อใหม่หลังแอดมินบันทึก

ใช้หนึ่งการ์ดต่อหนึ่ง PR ยืนยันว่าเทสต์ RED ล้มจากเงื่อนไขที่ตั้งไว้ก่อนเขียน implementation หลัง GREEN ให้รันเทสต์เดิม ตามด้วย lint, typecheck และ browser suite
