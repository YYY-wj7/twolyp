import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Camera, Heart, Map, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils'

const STEPS = [
  {
    icon: Sparkles,
    title: '欢迎来到 TwoLyp',
    subtitle: '这是只属于你们两个人的秘密花园',
    description: '记录旅行、美食、每一个平凡而闪亮的日子',
    gradient: 'from-apricot-300 to-apricot-400',
  },
  {
    icon: Camera,
    title: '记录生活',
    subtitle: '照片、视频、文字，随心所欲',
    description: '智能分类和标签，帮你整理每一段回忆',
    gradient: 'from-tulip-300 to-tulip-400',
  },
  {
    icon: Map,
    title: '留下足迹',
    subtitle: '在地图上标记你们去过的地方',
    description: '每座城市、每个角落，都有你们的故事',
    gradient: 'from-apricot-400 to-tulip-300',
  },
  {
    icon: Heart,
    title: '一起开始吧',
    subtitle: '设置你的昵称和头像',
    description: '然后邀请 TA 加入你们的花园',
    gradient: 'from-tulip-400 to-apricot-300',
  },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      navigate('/feed')
    } else {
      setStep(step + 1)
    }
  }

  const current = STEPS[step]
  const Icon = current.icon

  return (
    <div className="min-h-dvh flex flex-col bg-milk-50 dark:bg-dark-bg transition-theme">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-12 pb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === step
                ? 'w-8 bg-apricot-400'
                : i < step
                  ? 'w-1.5 bg-apricot-300'
                  : 'w-1.5 bg-milk-300 dark:bg-dark-border'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 animate-fade-in">
        <div className={cn(
          'w-28 h-28 rounded-3xl bg-gradient-to-br flex items-center justify-center mb-8',
          'shadow-xl',
          current.gradient
        )}>
          <Icon className="w-14 h-14 text-white" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-semibold text-milk-900 dark:text-milk-100 mb-2">
          {current.title}
        </h1>
        <p className="text-base text-milk-700 dark:text-milk-300 mb-2">
          {current.subtitle}
        </p>
        <p className="text-sm text-milk-500 dark:text-milk-400 text-center max-w-xs">
          {current.description}
        </p>
      </div>

      {/* Bottom action */}
      <div className="px-8 pb-12 safe-bottom">
        <button
          onClick={handleNext}
          className={cn(
            'w-full h-14 rounded-2xl font-medium text-white flex items-center justify-center gap-2',
            'bg-gradient-to-r from-apricot-400 to-tulip-400',
            'active:scale-[0.98] transition-transform',
            'shadow-lg shadow-apricot-300/30'
          )}
        >
          {isLast ? '开始使用' : '下一步'}
          {!isLast && <ChevronRight className="w-5 h-5" />}
        </button>

        {!isLast && (
          <button
            onClick={() => navigate('/feed')}
            className="w-full mt-3 text-sm text-milk-400 hover:text-milk-600 dark:hover:text-milk-300 transition-colors"
          >
            跳过引导
          </button>
        )}
      </div>
    </div>
  )
}
