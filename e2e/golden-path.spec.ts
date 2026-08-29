import { expect, test } from '@playwright/test'

const VALID_ANALYSIS = {
  tags: ['경영학과', '서비스 기획자', '1단계'],
  summary: '테스트 요약',
  coreSkills: Array.from({ length: 5 }, (_, i) => ({
    id: `core-${i}`,
    title: `핵심 역량 ${i}`,
    description: '설명',
    readiness: '일부 준비',
  })),
  gapSkills: [{ id: 'gap-1', title: '부족 역량', description: '판단 이유' }],
  steps: [1, 2, 3].map((order) => ({
    order,
    title: `${order}단계 준비 항목`,
    why: '추천 이유',
    how: ['방법 1', '방법 2'],
    nextAction: '오늘 할 일',
  })),
  finalAction: { message: '최종 메시지', detail: '상세 설명' },
}

async function fillValidInput(page: import('@playwright/test').Page) {
  await page.getByLabel('전공').fill('경영학과')
  await page.getByLabel('희망 직무').fill('서비스 기획자')
  await page.getByLabel('현재 준비 상황').fill('교내 프로젝트 1회 경험이 있습니다.')
}

test('정상 플로우: 입력 → 확인 → 분석 → 결과', async ({ page }) => {
  await page.route('**/api/analyze', async (route) => {
    await route.fulfill({ json: { success: true, data: VALID_ANALYSIS } })
  })

  await page.goto('/start')

  await fillValidInput(page)
  await page.getByRole('button', { name: /다음/ }).click()

  await expect(page.getByRole('button', { name: '분석 시작하기' })).toBeVisible()
  await page.getByRole('button', { name: '분석 시작하기' }).click()

  await expect(page.getByRole('heading', { name: '직무 핵심 역량 및 내 준비 수준' })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText('핵심 역량 0')).toBeVisible()
  await expect(page.getByText('1단계 준비 항목')).toBeVisible()
})

test('프로덕션 빌드에서는 개발용 시나리오 위젯이 노출되지 않는다 (P0 회귀 방지)', async ({ page }) => {
  await page.goto('/start')
  await expect(page.getByText('디자인 시나리오 미리보기')).toHaveCount(0)
})

test('필수 입력 누락 시 오류 메시지를 표시하고 입력을 유지한다 (PRD 5.1)', async ({ page }) => {
  await page.goto('/start')

  await page.getByLabel('희망 직무').fill('서비스 기획자')
  await page.getByRole('button', { name: /다음/ }).click()

  await expect(page.getByText('필수 정보를 입력해주세요.').first()).toBeVisible()
  await expect(page.getByLabel('희망 직무')).toHaveValue('서비스 기획자')
})

test('AI 분석 실패 시 에러 화면을 표시하고 재시도 버튼을 제공한다 (PRD 5.4)', async ({ page }) => {
  await page.route('**/api/analyze', async (route) => {
    await route.fulfill({ json: { success: false, error: 'AI_FAIL' } })
  })

  await page.goto('/start')

  await fillValidInput(page)
  await page.getByRole('button', { name: /다음/ }).click()
  await page.getByRole('button', { name: '분석 시작하기' }).click()

  await expect(page.getByText('분석에 실패했습니다.')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: '다시 시도' })).toBeVisible()
})

test('직무와 무관한 결과 판정 시 입력 수정 화면으로 안내한다 (PRD 5.8)', async ({ page }) => {
  await page.route('**/api/analyze', async (route) => {
    await route.fulfill({ json: { success: false, error: 'IRRELEVANT_RESULT' } })
  })

  await page.goto('/start')

  await fillValidInput(page)
  await page.getByRole('button', { name: /다음/ }).click()
  await page.getByRole('button', { name: '분석 시작하기' }).click()

  await expect(page.getByText('직무에 맞는 분석 결과를 만들지 못했습니다.')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByRole('button', { name: '입력 수정하기' })).toBeVisible()

  await page.getByRole('button', { name: '입력 수정하기' }).click()
  await expect(page.getByLabel('희망 직무')).toHaveValue('서비스 기획자')
})
