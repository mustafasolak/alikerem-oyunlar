import '../shared/base.css'
import './home.css'
import { GAMES, SITE_TAGLINE, SITE_TITLE, type GameEntry } from '../shared/games.ts'
import { bestEntryOf } from '../shared/Leaderboard.ts'

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (char) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[char]};`)

function renderTags(tags: string[]): string {
  return `<ul class="tags">${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>`
}

function renderCard(game: GameEntry): string {
  const body = `
    <div class="card-art" aria-hidden="true">${game.emoji}</div>
    <h2>${escapeHtml(game.title)}</h2>
    <p>${escapeHtml(game.tagline)}</p>
    ${renderTags(game.tags)}
  `

  if (game.status === 'soon') {
    return `
      <div class="card card--soon">
        ${body}
        <div class="card-foot"><span class="badge">Yakında</span></div>
      </div>
    `
  }

  const best = bestEntryOf(game.id)
  const record = best
    ? `<span class="record"><span aria-hidden="true">🏆</span> ${escapeHtml(best.name)} · ${best.score}</span>`
    : '<span class="record record--empty">Henüz skor yok</span>'

  return `
    <a class="card" href="${game.href}">
      ${body}
      <div class="card-foot">${record}<span class="go">Oyna →</span></div>
    </a>
  `
}

const readyCount = GAMES.filter((game) => game.status === 'ready').length

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="wrap">
    <header class="site-header">
      <span class="logo" aria-hidden="true">🎮</span>
      <div>
        <h1>${SITE_TITLE}</h1>
        <p>${SITE_TAGLINE}</p>
      </div>
    </header>

    <div class="section-title">
      <span>Oyunlar</span>
      <span>${readyCount} / ${GAMES.length} hazır</span>
    </div>

    <main class="grid">
      ${GAMES.map(renderCard).join('')}
    </main>

    <footer class="site-footer wrap">
      Klavye ve dokunmatik desteklenir. Skorlar yalnızca bu cihazda saklanır. İyi eğlenceler!
    </footer>
  </div>
`

document.title = SITE_TITLE
