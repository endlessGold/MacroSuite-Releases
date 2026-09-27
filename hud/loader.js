const inflate = async (paths) => {
  const chunks = await Promise.all(paths.map(path => fetch(path).then(r => {
    if (!r.ok) throw new Error(path + ': ' + r.status)
    return r.text()
  })))
  const binary = atob(chunks.join('').replace(/\s+/g, ''))
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Response(stream).text()
}

const css = await inflate(['./chunks/css-00.txt'])
const style = document.createElement('style')
style.textContent = css
document.head.append(style)

const js = await inflate([
  './chunks/js-00.txt','./chunks/js-01.txt','./chunks/js-02.txt',
  './chunks/js-03.txt','./chunks/js-04.txt','./chunks/js-05.txt'
])
const script = document.createElement('script')
script.type = 'module'
script.textContent = js
document.head.append(script)
