'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ClockAlertIcon,
  FileWarningIcon,
  ListXIcon,
  OctagonXIcon,
  SearchXIcon,
  WifiOffIcon,
} from 'lucide-react'
import { AppHeader } from '@/components/prep/app-header'
import { InputStep } from '@/components/prep/input-step'
import { ConfirmStep } from '@/components/prep/confirm-step'
import { LoadingStep } from '@/components/prep/loading-step'
import { ResultStep } from '@/components/prep/result-step'
import { ErrorState } from '@/components/prep/error-state'
import { ScenarioPreview } from '@/components/prep/scenario-preview'
import {
  DEFAULT_INPUT,
  EXAMPLE_INPUT,
  generateMockAnalysis,
  getLoadingMessages,
  validateAnalysisResult,
  type AnalysisResult,
  type PrepInput,
  type ScenarioKey,
} from '@/lib/mock-analysis'
import { validatePrepInput, type FieldErrors } from '@/lib/validation'

type Stage = 'input' | 'confirm' | 'loading' | 'result' | 'error'

const ERROR_CONFIG: Record<
  Exclude<ScenarioKey, 'success'>,
  {
    icon: typeof OctagonXIcon
    title: string
    description: string
    actionLabel: string
    retryTarget: 'loading' | 'input'
  }
> = {
  ai_fail: {
    icon: OctagonXIcon,
    title: '분석에 실패했습니다.',
    description: '잠시 후 다시 시도해주세요.',
    actionLabel: '다시 시도',
    retryTarget: 'loading',
  },
  timeout: {
    icon: ClockAlertIcon,
    title: '분석에 시간이 오래 걸리고 있습니다.',
    description: '다시 시도해주세요.',
    actionLabel: '다시 시도',
    retryTarget: 'loading',
  },
  format_error: {
    icon: FileWarningIcon,
    title: '결과를 완성하지 못했습니다.',
    description: '불완전한 결과는 표시하지 않아요. 다시 분석해주세요.',
    actionLabel: '다시 분석하기',
    retryTarget: 'loading',
  },
  insufficient: {
    icon: ListXIcon,
    title: '추천할 준비 항목이 충분하지 않습니다.',
    description: '다시 분석해주세요.',
    actionLabel: '다시 분석하기',
    retryTarget: 'loading',
  },
  meaningless: {
    icon: SearchXIcon,
    title: '직무에 맞는 분석 결과를 만들지 못했습니다.',
    description: '희망 직무와 준비 상황을 조금 더 구체적으로 입력한 후 다시 시도해주세요.',
    actionLabel: '입력 수정하기',
    retryTarget: 'input',
  },
  network_error: {
    icon: WifiOffIcon,
    title: '네트워크 연결에 문제가 있습니다.',
    description: '네트워크 연결을 확인한 후 다시 시도해주세요.',
    actionLabel: '다시 시도',
    retryTarget: 'loading',
  },
}

const STAGE_INDEX: Record<Stage, number> = {
  input: 0,
  confirm: 1,
  loading: 2,
  result: 3,
  error: 2,
}

export default function Page() {
  const [stage, setStage] = useState<Stage>('input')
  const [input, setInput] = useState<PrepInput>(DEFAULT_INPUT)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [activePhase, setActivePhase] = useState(0)
  const [scenario, setScenario] = useState<ScenarioKey>('success')

  useEffect(() => {
    if (stage !== 'loading') return

    const messages = getLoadingMessages()
    setActivePhase(0)

    let phase = 0
    const phaseTimer = setInterval(() => {
      phase += 1
      if (phase < messages.length) setActivePhase(phase)
    }, 800)

    const resolveTimer = setTimeout(() => {
      clearInterval(phaseTimer)
      if (scenario === 'success') {
        const generated = generateMockAnalysis(input)
        if (validateAnalysisResult(generated)) {
          setAnalysis(generated)
          setStage('result')
        } else {
          setStage('error')
        }
      } else {
        setStage('error')
      }
    }, messages.length * 800 + 400)

    return () => {
      clearInterval(phaseTimer)
      clearTimeout(resolveTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, scenario])

  const stageIndex = useMemo(() => {
    if (stage === 'error' && scenario !== 'success') {
      return ERROR_CONFIG[scenario].retryTarget === 'input' ? 0 : 2
    }
    return STAGE_INDEX[stage]
  }, [stage, scenario])

  function handleChange(field: keyof PrepInput, next: string) {
    setInput((prev) => ({ ...prev, [field]: next }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleFillExample() {
    setInput(EXAMPLE_INPUT)
    setErrors({})
  }

  function handleSubmitInput() {
    const nextErrors = validatePrepInput(input)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    setErrors({})
    setStage('confirm')
  }

  function handleErrorAction() {
    if (scenario === 'success') return
    const target = ERROR_CONFIG[scenario].retryTarget
    setStage(target === 'input' ? 'input' : 'loading')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader stage={stageIndex} />

      <main className="flex-1">
        {stage === 'input' && (
          <InputStep
            value={input}
            errors={errors}
            onChange={handleChange}
            onSubmit={handleSubmitInput}
            onFillExample={handleFillExample}
          />
        )}

        {stage === 'confirm' && (
          <ConfirmStep
            value={input}
            onEdit={() => setStage('input')}
            onConfirm={() => setStage('loading')}
          />
        )}

        {stage === 'loading' && <LoadingStep activePhase={activePhase} />}

        {stage === 'result' && analysis && (
          <ResultStep
            input={input}
            analysis={analysis}
            onRestart={() => setStage('loading')}
          />
        )}

        {stage === 'error' && scenario !== 'success' && (
          <ErrorState
            icon={ERROR_CONFIG[scenario].icon}
            title={ERROR_CONFIG[scenario].title}
            description={ERROR_CONFIG[scenario].description}
            actionLabel={ERROR_CONFIG[scenario].actionLabel}
            onAction={handleErrorAction}
          />
        )}
      </main>

      <ScenarioPreview value={scenario} onChange={setScenario} />
    </div>
  )
}
