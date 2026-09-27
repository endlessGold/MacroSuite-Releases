for (const node of document.querySelectorAll('[data-when="out"]')) node.hidden = false
for (const node of document.querySelectorAll('[data-when="in"], [data-when="admin"]')) node.hidden = true
for (const node of document.querySelectorAll('.reveal')) node.classList.add('is-in')

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue
    if (key === 'class') node.className = value
    else if (key === 'text') node.textContent = value
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value)
    else if (value === true) node.setAttribute(key, '')
    else node.setAttribute(key, value)
  }
  for (const child of children) if (child !== null && child !== undefined && child !== false) node.append(child)
  return node
}
