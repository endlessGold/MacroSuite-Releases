// 공식 홈: 로그인 공통 처리는 shell.js, 여기서는 제품 story와 공개 데이터를 연결한다.

import { el } from './shell.js'

const $ = selector => document.querySelector(selector)
const $$ = selector => Array.from(document.querySelectorAll(selector))

const STORY_SCENES = ['discover', 'organize', 'inspect', 'run', 'stop']
const isStoryScene = value => STORY_SCENES.includes(value)

function initStory() {
  const shell = $('#story-shell')
  const frame = $('#story-demo')
  const status = $('#demo-status')
  if (!shell || !frame) return

  const buttons = $$('[data-story-scene-button]')
  const steps = $$('[data-story-step]')
  const demoOrigin = new URL(frame.src).origin
  let active = 'discover'
  let ready = false

  const sendScene = scene => {
    if (!ready || !frame.contentWindow) return
    frame.contentWindow.postMessage({
      type: 'macrosuite:preview-scene',
      version: 1,
      scene,
    }, demoOrigin)
  }

  const setScene = (scene, { scroll = false } = {}) => {
    if (!isStoryScene(scene)) return
    active = scene
    shell.dataset.scene = scene

    for (const button of buttons) {
      const selected = button.dataset.storySceneButton === scene
      button.setAttribute('aria-pressed', String(selected))
    }
    for (const step of steps) step.classList.toggle('is-active', step.dataset.storyStep === scene)

    sendScene(scene)

    if (scroll) {
      steps.find(step => step.dataset.storyStep === scene)?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'center',
      })
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => setScene(button.dataset.storySceneButton, { scroll: true }))
  }

  const onMessage = event => {
    if (event.origin !== demoOrigin || event.source !== frame.contentWindow) return
    if (event.data?.type !== 'macrosuite:preview-ready' || event.data?.version !== 1) return
    ready = true
    status.textContent = '플로우 연결됨'
    status.classList.remove('is-fallback')
    status.classList.add('is-ready')
    sendScene(active)
  }
  window.addEventListener('message', onMessage)

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      const scene = visible?.target?.dataset?.storyStep
      if (scene) setScene(scene)
    }, {
      rootMargin: '-26% 0px -48% 0px',
      threshold: [0.18, 0.35, 0.55, 0.72],
    })
    for (const step of steps) observer.observe(step)
  }

  setTimeout(() => {
    if (ready) return
    status.textContent = '직접 조작 가능'
    status.classList.add('is-fallback')
  }, 4500)

  setScene(active)
}

const statusNode = $('#service-status')
statusNode.classList.add('is-up')
statusNode.lastElementChild.textContent = '임시 프리뷰'

async function loadHubRail() {
  const rail = $('#hub-rail')
  rail.replaceChildren(el('li', { class: 'empty' }, [
    el('strong', { text: '임시 정적 프리뷰에서는 허브 API를 직접 호출하지 않습니다.' }),
    el('a', { class: 'btn btn-line btn-sm empty-action', href: 'https://macrosuite.vercel.app/hub', text: '실제 허브 열기' }),
  ]))
}

async function loadRelease() {
  $('#release-version').textContent = '최신 배포판'
  $('#release-size').textContent = '운영 사이트에서 확인'
  $('#download-version-label').textContent = 'Windows 앱 내려받기'
  $('#release-sha-row').hidden = true
}

$('#copy-sha')?.addEventListener('click', async () => {})

initStory()
void loadHubRail()
void loadRelease()
